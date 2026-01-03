const axios = require('../../common/axios')
const SyncHandler = require('./sync-handler')
const LOG = new Logger('SAGE-SYNC')
const prisma = require('../../data/prisma')
const querystring = require('querystring')

class SageSyncHandler extends SyncHandler {
  constructor () {
    super()
    this.token = null
    this.tokenAge = null
  }

  async getAccessToken () {
    const params = {
      method: 'POST',
      url: env.sage.authUrl,
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      data: querystring.stringify({
        grant_type: 'client_credentials',
        client_id: env.sage.clientId,
        client_secret: env.sage.clientSecret,
        audience: 's100bp/sage100m2m'
      })
    }
    const result = await axios(params)
    if (!result?.data?.access_token) {
      LOG.info('Could not get access token')
      throw new Error('Could not get access token for SAGE')
    }
    LOG.info('Got fresh access token')
    this.token = result?.data?.access_token
    this.tokenAge = new Date()
  }

  async checkAuthentication () {
    const now = new Date()
    // If we have a token and tokenAge is a Date within the last 3 minutes, we're good.
    if (
      this.token !== null &&
      this.tokenAge instanceof Date &&
      (now - this.tokenAge) < 3 * 60 * 1000 // 3 minutes in ms
    ) {
      return
    }
    LOG.info('Access token is invalid. Fetch new now!')
    await this.getAccessToken()
  }

  async createAddress (address) {
    LOG.info(`Create address now: ${JSON.stringify(address)}`)

    const result = await axios({
      url: `${env.sage.baseUrl}/${env.sage.addressPath}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Sage-ConnectivityVersion': 1.3
      },
      data: address
    })
    if (!result) {
      LOG.info('Could not create address')
      return
    }
    return result.data.$key
  }

  getSubContactorPayload (legalEntity) {
    return {
      title: 'Firma',
      name: legalEntity.name,
      street: legalEntity.street,
      zip: legalEntity.zip,
      city: legalEntity.city,
      mobile: legalEntity.mobile,
      email: legalEntity.email,
      isActive: legalEntity.isActive ? -1 : 0
    }
  }

  getAdressSyncPayloadFromPerson (person) {
    return {
      title: person.title,
      name: `${person.firstName} ${person.lastName}`,
      street: person.street,
      zip: person.zip,
      city: person.city,
      mobile: person.mobile,
      email: person.email,
      isActive: person.isActive ? -1 : 0
    }
  }

  getContactSyncPayload (person, addressId) {
    const addressIdEncoded = addressId ? parseInt(Buffer.from(addressId, 'base64').toString()) : addressId
    return {
      title: person.title,
      firstName: person.firstName,
      lastName: person.lastName,
      mobile: person.mobile,
      email: person.email,
      addressId: addressIdEncoded || addressId
    }
  }

  async setSubcontractorError (id) {
    LOG.info(`Set isSageInSync to false for subcontractor ${id}`)
    await prisma.legalEntity.update({
      where: { id },
      data: { isSageInSync: false }
    })
  }

  async updateAddressById (id, address) {
    const url = `${env.sage.baseUrl}/${env.sage.addressPath}('${id}')`
    const getResult = await axios({
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Sage-ConnectivityVersion': 1.3
      }
    })
    if (!getResult) {
      LOG.info(`Could not get address by id ${id}`)
      return null
    }

    const result = await axios({
      url,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'if-match': getResult.data.$etag,
        'X-Sage-ConnectivityVersion': 1.3
      },
      data: address
    })
    if (!result) return null
    return true
  }

  async createContactPerson (contact) {
    const result = await axios({
      url: `${env.sage.baseUrl}/${env.sage.contactPath}`,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Sage-ConnectivityVersion': 1.3
      },
      data: contact
    })
    if (!result) {
      LOG.error(`Failed at create contact person for addressId: ${contact.addressId}`)
      return
    }
    LOG.info(`Successfully created contact person for addressId: ${contact.addressId}`)
    LOG.info(`ContactId is: ${result.data.$key}`)
    return result.data.$key
  }

  async createSubcontractor (subcontractor) {
    LOG.info(`Start creating subcontractor ${subcontractor.id} to SAGE`)
    await this.checkAuthentication()
    const createResult = await this.createAddress(this.getSubContactorPayload(subcontractor))
    if (!createResult) {
      return this.setSubcontractorError(subcontractor.id)
    }
    await prisma.legalEntity.update({
      where: { id: subcontractor.id },
      data: { isSageInSync: true, sageAddressId: createResult }
    })
    LOG.info(`Successfully created subcontractor ${subcontractor.id} in SAGE`)
  }

  async updateSubcontractorById (subcontractor) {
    LOG.info(`Start update subcontractor ${subcontractor.id}`)

    if (!subcontractor.sageAddressId) {
      LOG.info('Subcontractor has no address id. Abort update and create fresh address for subcontractor')
      return this.createSubcontractor(subcontractor)
    }

    const result = await this.updateAddressById(subcontractor.sageAddressId, this.getSubContactorPayload(subcontractor))
    if (!result) {
      LOG.error(`Could not update address of subcontractor ${subcontractor.id}`)
      return this.setSubcontractorError(subcontractor.id)
    }
    LOG.info(`Successfully updated subcontractor ${subcontractor.id}`)
  }

  async createPerson (person) {
    LOG.info(`Start creating person ${person.id} to sage`)
    if (person.type === 'internal') {
      LOG.info(`Person ${person.id} is internal. Abort now`)
      return
    }
    const addressResult = await this.createAddress(this.getAdressSyncPayloadFromPerson(person))
    if (!addressResult) {
      LOG.error(`Failed to create address for person ${person.id}`)
      return null
    }

    await prisma.person.update({
      where: { id: person.id },
      data: {
        sageAddressId: addressResult
      }
    })

    LOG.info(`Got address sync result, syncing contactpersons now for person ${person.id}`)
    LOG.info(`AddressId is:  ${addressResult}`)
    const contactPersonResult = await this.createContactPerson(this.getContactSyncPayload(person, addressResult))

    if (!contactPersonResult) {
      LOG.error(`Failed to create contactperson for address ${addressResult}`)
      return null
    }

    await prisma.person.update({
      where: { id: person.id },
      data: {
        sageContactPersonIds: {
          push: contactPersonResult
        },
        isSageInSync: true
      }
    })
    LOG.info(`Done creating person ${person.id} in sage`)
    return true
  }

  async addPersonToLegalEntity (person, legalEntity) {
    LOG.info(`Start adding person ${person.id} to legalEntity ${legalEntity.id} in SAGE`)
    if (person.type === 'internal') {
      LOG.info(`Person ${person.id} is internal. Abort now`)
      return null
    }
    const contactResult = await this.createContactPerson(this.getContactSyncPayload(person, legalEntity.sageAddressId))

    if (!contactResult) {
      LOG.error(`Could not create contactPerson of person ${person.id} for legalEntity ${legalEntity.id}`)
      return null
    }

    await prisma.$transaction([
      prisma.PersonsOnLegalEntities.update({
        where: {
          personId_legalEntityId: {
            personId: person.id,
            legalEntityId: legalEntity.id
          }
        },
        data: {
          sageContactId: contactResult,
          isSageInSync: true
        }
      }),
      prisma.person.update({
        where: {
          id: person.id
        },
        data: {
          sageContactPersonIds: {
            push: contactResult
          }
        }
      })
    ])
    LOG.info(`Successfully added person ${person.id} to legalEntity ${legalEntity.id} in SAGE`)
  }

  async createContactPersonForLegalEntity (person, legalEntityId) {
    LOG.info(`Start create contactPerson ${person.id} for legalEntity ${legalEntityId} in SAGE`)
    const personCreateResult = await this.createPerson(person)
    if (!personCreateResult) {
      LOG.error('Could not create Address for person. Abort now!')
      return this.setSubcontractorError(legalEntityId)
    }

    const legalEntity = await prisma.legalEntity.findUnique({ where: { id: legalEntityId } })
    await this.addPersonToLegalEntity(person, legalEntity)
    LOG.info(`Successfully created contactPerson ${person.id} for legalEntity ${legalEntityId} in SAGE`)
  }

  async updateContactById (id, contact) {
    if (contact.addressId) {
      delete contact.addressId
    }
    const url = `${env.sage.baseUrl}/${env.sage.contactPath}('${id}')`
    const getResult = await axios({
      url,
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'X-Sage-ConnectivityVersion': 1.3
      }
    })
    if (!getResult) {
      LOG.error(`Could not get contact ${id}. Abort now!`)
      return null
    }

    const result = await axios({
      url,
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'if-match': getResult.data.$etag,
        'X-Sage-ConnectivityVersion': 1.3
      },
      data: contact
    })
    if (!result) {
      LOG.error(`Could not update contact ${id}. Abort now!`)
      return null
    }
    return true
  }

  async updatePersonById (person) {
    LOG.info(`Start update person ${person.id} in SAGE`)

    if (person.type === 'internal') {
      LOG.info(`Person ${person.id} is internal. Abort now`)
      return
    }
    const contact = this.getContactSyncPayload(person, person.erpAddressId)
    LOG.info(`Got Contact. Id is: ${contact}`)
    const statements = []
    statements.push(
      ...person.sageContactPersonIds.map(contactPersonId => {
        return this.updateContactById(contactPersonId, contact)
      })
    )
    statements.push(this.updateAddressById(person.sageAddressId, this.getAdressSyncPayloadFromPerson(person)))

    const results = await Promise.all(statements)

    if (results.filter(el => !el).length > 0) {
      LOG.info('At least one update statement of contact or address failed!')
      return prisma.person.update({
        where: { id: person.id },
        data: {
          isSageInSync: false
        }
      })
    }
    LOG.info(`Successfully updated person ${person.id} in SAGE`)
  }

  async setMainContactOfLegalEntity () {
    LOG.info('No SAGE implementation needed for setMainContactOfLegalEntity')
  }

  async syncContactPersonsOfLegalEntityAfterRemoval () {
    LOG.info('No SAGE implementation needed for syncContactPersonsOfLegalEntityAfterRemoval')
  }
}

module.exports = SageSyncHandler
