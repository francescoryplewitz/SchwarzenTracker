const axios = require('../../common/axios')
const SyncHandler = require('./sync-handler')
const LOG = new Logger('SVENJA-SYNC')
const prisma = require('../../data/prisma')

class SvenjaSyncHandler extends SyncHandler {
  constructor () {
    super()
    this.token = env.svenja.apiKey
  }

  getSubContactorPayload (v) {
    return {
      ...(v.id && { id: v.id }),
      ...(v.name && { name: v.name }),
      ...(v.type && { type: v.type }),
      ...(v.businessRelation && { businessRelation: v.businessRelation }),
      ...(v.isActive !== undefined && { isActive: v.isActive }),
      ...(v.allowsNewsletter !== undefined && { allowsNewsletter: v.allowsNewsletter }),
      ...(v.hasCustomerAccount !== undefined && { hasCustomerAccount: v.hasCustomerAccount }),
      ...(v.street && { street: v.street }),
      ...(v.zip && { zip: v.zip }),
      ...(v.city && { city: v.city }),
      ...(v.federalState && { federalState: v.federalState }),
      ...(v.email && { email: v.email }),
      ...(v.emailSecondary && { emailSecondary: v.emailSecondary }),
      ...(v.mobile && { mobile: v.mobile }),
      ...(v.mobileSecondary && { mobileSecondary: v.mobileSecondary }),
      ...(v.fax && { fax: v.fax }),
      ...(v.web && { web: v.web }),
      ...(v.notes && { notes: v.notes }),

      // Neue Datumsfelder aus Schema (Quasar Date Picker)
      ...(v.exemptionCertificate13bDocsValidTo && { exemptionCertificate13bDate: v.exemptionCertificate13bDocsValidTo }),
      ...(v.exemptionCertificate48bDocsValidTo && { exemptionCertificate48bDate: v.exemptionCertificate48bDocsValidTo }),
      ...(v.clearanceCertificateDocsValidTo && { clearanceCertificateDate: v.clearanceCertificateDocsValidTo }),
      ...(v.businessRegistrationDocsValidTo && { businessRegistrationDate: v.businessRegistrationDocsValidTo }),
      ...(v.guaranteeDocsValidTo && { guaranteeDate: v.guaranteeDocsValidTo }),

      // Numerische Felder als Integer konvertieren:
      ...(v.catchmentAreaRadius != null && { catchmentAreaRadius: parseInt(v.catchmentAreaRadius, 10) }),

      // Trades als Array von Strings
      ...(Array.isArray(v.trades) && v.trades.length > 0 && { trades: v.trades })

    }
  }

  getPersonPayload (v) {
    return {
      ...(v.id && { id: v.id }),
      ...(v.namePrefix && { namePrefix: v.namePrefix }),
      ...(v.title && { title: v.title }),
      ...(v.firstName && { firstName: v.firstName }),
      ...(v.lastName && { lastName: v.lastName }),
      ...(v.type && { type: v.type }),
      ...(v.email && { email: v.email }),
      ...(v.mobile && { mobile: v.mobile }),
      ...(v.description && { notes: v.description })
    }
  }

  async setSubcontractorError (id) {
    LOG.info(`Set isSvenjaInSync to false for subcontractor ${id}`)
    await prisma.legalEntity.update({
      where: { id },
      data: { isSvenjaInSync: false }
    })
  }

  async setPersonError (id) {
    LOG.info(`Set isSvenjaInSync to false for person ${id}`)
    await prisma.person.update({
      where: { id },
      data: { isSvenjaInSync: false }
    })
    return false
  }

  async createSubcontractor (subcontractor) {
    LOG.info(`Start creating subcontractor ${subcontractor.id} to Svenja`)
    const syncResult = await axios({
      url: `${env.svenja.domain}/api/subcontractor`,
      method: 'POST',
      headers: { 'x-api-key': this.token },
      data: this.getSubContactorPayload(subcontractor)
    })

    if (!syncResult) {
      LOG.error('Error when syncing Subcontractor to Svenja. Abort now!')
      return this.setSubcontractorError(subcontractor.id)
    }
    LOG.info('Successfully created Subcontractor in SVENJA')
    return await prisma.legalEntity.update({
      where: { id: subcontractor.id },
      data: { isSvenjaInSync: true }
    })
  }

  async updateSubcontractorById (subcontractor) {
    const syncResult = await axios({
      url: `${env.svenja.domain}/api/subcontractor/${subcontractor.id}`,
      method: 'PATCH',
      headers: { 'x-api-key': this.token },
      data: this.getSubContactorPayload(subcontractor)
    })

    if (!syncResult) {
      LOG.error('Error when syncing Subcontractor to Svenja. Abort now!')
      return this.setSubcontractorError(subcontractor.id)
    }
    LOG.info('Successfully updated Subcontractor in SVENJA')
    return await prisma.legalEntity.update({
      where: { id: subcontractor.id },
      data: { isSvenjaInSync: true }
    })
  }

  async createPerson (person) {
    LOG.info(`Start creating person ${person.id} to Svenja`)
    const syncResult = await axios({
      url: `${env.svenja.domain}/api/person`,
      method: 'POST',
      headers: { 'x-api-key': this.token },
      data: this.getPersonPayload(person)
    })
    if (!syncResult) {
      LOG.error('Error when syncing Person to Svenja. Abort now!')
      return this.setPersonError(person.id)
    }
    LOG.info('Successfully created person in SVENJA')
    return await prisma.person.update({
      where: { id: person.id },
      data: { isSvenjaInSync: true }
    })
  }

  async addPersonToLegalEntity (personId, legalEntityId) {
    LOG.info(`Start adding person ${personId} to legalEntity ${legalEntityId} in Svenja`)
    const syncResult = await axios({
      url: `${env.svenja.domain}/api/legal-entity/${legalEntityId}/contact`,
      method: 'POST',
      headers: { 'x-api-key': this.token },
      data: { personId }
    })
    if (!syncResult) {
      LOG.error('Error when adding person to legalEntity in Svenja. Abort now!')
      await Promise.all([prisma.personsOnLegalEntities.update({
        where: {
          personId_legalEntityId: {
            legalEntityId,
            personId
          }
        },
        data: { isSvenjaInSync: false }
      }),
      this.setSubcontractorError(legalEntityId)
      ])
      return false
    }

    LOG.info(`Successfully added person ${personId} to legalEntity ${legalEntityId} in Svenja!`)
    return await prisma.personsOnLegalEntities.update({
      where: {
        personId_legalEntityId: {
          legalEntityId,
          personId
        }
      },
      data: { isSvenjaInSync: true }
    })
  }

  async createContactPersonForLegalEntity (person, legalEntityId) {
    LOG.info(`Start create contactPerson ${person.id} for legalEntity ${legalEntityId} in Svenja`)
    const personCreateResult = await this.createPerson(person)
    if (!personCreateResult) {
      LOG.info('Abort createContactPersonForLegalEntity because person could not created. Set legalEntity sync to false now')
      return this.setSubcontractorError(legalEntityId)
    }
    await this.addPersonToLegalEntity(person.id, legalEntityId)
  }

  async updatePersonById (person) {
    LOG.info(`Start update person ${person.id}  in Svenja`)

    const syncResult = await axios({
      url: `${env.svenja.domain}/api/person/${person.id}`,
      method: 'PATCH',
      headers: { 'x-api-key': this.token },
      data: this.getPersonPayload(person)
    })

    if (!syncResult) {
      LOG.error('Error when syncing person to Svenja. Abort now!')
      return this.setPersonError(person.id)
    }
    LOG.info('Successfully updated person in SVENJA')
    return await prisma.person.update({
      where: { id: person.id },
      data: { isSvenjaInSync: true }
    })
  }

  async setMainContactOfLegalEntity (legalEntityId, personId) {
    LOG.info(`Start setting person ${personId} as mainContact of ${legalEntityId} in Svenja`)
    const syncResult = await axios({
      url: `${env.svenja.domain}/api/legal-entity/${legalEntityId}/contact-person/${personId}`,
      method: 'PATCH',
      headers: { 'x-api-key': this.token },
      data: {}
    })

    if (!syncResult) {
      LOG.error('Error when setting person as mainContact in Svenja. Abort now!')
      return await Promise.all([
        prisma.personsOnLegalEntities.update({
          where: {
            personId_legalEntityId: {
              legalEntityId,
              personId
            }
          },
          data: { isSvenjaInSync: false }
        }),
        this.setSubcontractorError(legalEntityId)
      ])
    }
    await prisma.personsOnLegalEntities.update({
      where: {
        personId_legalEntityId: {
          legalEntityId,
          personId
        }
      },
      data: { isSvenjaInSync: true }
    })
    LOG.info(`Successfully setted person ${personId} as mainContact for ${legalEntityId}`)
  }

  async removeContactPersonFromLegalEntity (legalEntityId, personId) {
    LOG.info(`Start removing person ${personId} from ${legalEntityId} in Svenja`)

    const syncResult = await axios({
      url: `${env.svenja.domain}/api/legal-entity/${legalEntityId}/contact-person/${personId}`,
      method: 'DELETE',
      headers: { 'x-api-key': this.token },
      data: {}
    })
    if (!syncResult) {
      LOG.error('Error when removing person from legalEntity in Svenja. Abort now!')
      return null
    }
    LOG.info(`Successfully removed person ${personId} from ${legalEntityId} in Svenja`)
  }
}

module.exports = SvenjaSyncHandler
