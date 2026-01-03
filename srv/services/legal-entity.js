const prisma = require('../data/prisma')
const LOG = new Logger('LEGALENTITY')

const { buildEntitySearch } = require('../common/helper')

const createLegalEntityInDb = async (data) => {
  try {
    const legalEntity = await prisma.legalEntity.create({
      data
    })
    return legalEntity
  } catch (e) {
    LOG.error('Could not create legalEntity')
    LOG.error(`Error is: ${e}`)
    return false
  }
}

const createLegalEntity = async (req, res) => {
  const creationResult = await createLegalEntityInDb(Object.assign(req.body, { userId: req.user.id }))

  if (!creationResult) return res.status(400).send()

  syncOrchestrator.syncSubcontractorAfterCreation(creationResult)

  return res.status(201).send(creationResult)
}
const getlegalEntitiesFromDb = async (query) => {
  try {
    return await prisma.legalEntity.findMany(query)
  } catch (e) {
    LOG.error('Could not get LegalEntities')
    LOG.error(`Error is: ${e}`)
    return false
  }
}

const getlegalEntities = async (req, res, next) => {
  if (req.query.count) {
    const count = await prisma.LegalEntity.count({ where: getlegalEntityWhere(req.query) })
    return res.status(200).send({ count })
  }

  const query = getlegalEntityQuery(req)
  const legalEntities = await getlegalEntitiesFromDb(query)
  if (!legalEntities) return res.status(400).send()
  return res.status(200).send(legalEntities)
}

const getlegalEntityQuery = (req) => {
  const { skip, sortBy, desc } = req.query
  return {
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      contactPersons: {
        where: {
          isMainContact: true
        },
        include: {
          person: true
        }
      }
    },
    orderBy: {
      [sortBy ?? 'createdAt']: desc === 'true' ? 'desc' : 'asc'
    },
    take: 30,
    skip: isNaN(parseInt(skip)) ? 0 : parseInt(skip),
    where: getlegalEntityWhere(req.query)
  }
}

const getlegalEntityWhere = (query) => {
  const { search, isActive, type, businessRelation, trades, documents } = query
  const where = {}
  if (search) {
    buildEntitySearch(search, where, getLegalEntitySearchQuery)
  }
  if (isActive) {
    where.isActive = isActive === 'true'
  }
  if (type) {
    where.type = type
  }
  if (businessRelation) {
    where.businessRelation = businessRelation
  }
  if (trades) {
    buildTradesWhere(trades, where)
  }
  if (documents === 'invalid') {
    where.OR = [
      { exemptionCertificate13bDocsValidTo: { lte: new Date() } },
      { exemptionCertificate48bDocsValidTo: { lte: new Date() } },
      { clearanceCertificateDocsValidTo: { lte: new Date() } },
      { businessRegistrationDocsValidTo: { lte: new Date() } },
      { guaranteeDocsValidTo: { lte: new Date() } },
      { priceAgreementDocsValidTo: { lte: new Date() } }
    ]
  }
  if (documents === 'valid') {
    if (!where.AND) where.AND = []
    where.AND.push(...[
      { exemptionCertificate13bDocsValidTo: { not: null, gte: new Date() } },
      { exemptionCertificate48bDocsValidTo: { not: null, gte: new Date() } },
      { clearanceCertificateDocsValidTo: { not: null, gte: new Date() } },
      { businessRegistrationDocsValidTo: { not: null, gte: new Date() } },
      { guaranteeDocsValidTo: { not: null, gte: new Date() } },
      { priceAgreementDocsValidTo: { not: null, gte: new Date() } }
    ])
  }
  appendDeepSearch(query, where)
  return where
}

const buildTradesWhere = (trades, where) => {
  const tradesArray = trades.split(',')
  if (!where.AND) where.AND = []
  tradesArray.forEach(trade => {
    where.AND.push({
      trades: {
        has: trade
      }
    })
  })
}
const appendDeepSearch = (query, where) => {
  const deepSearch = {
    name: query.name,
    street: query.street,
    zip: query.zip,
    city: query.city,
    email: query.email,
    mobile: query.mobile
  }
  Object.entries(deepSearch).forEach(([key, value]) => {
    if (!value || value === '') return
    where[key] = {
      contains: value,
      mode: 'insensitive'
    }
  })
}

const getLegalEntitySearchQuery = (search) => {
  return [
    {
      name: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      street: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      zip: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      city: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      email: {
        contains: search,
        mode: 'insensitive'
      }
    },
    {
      mobile: {
        contains: search,
        mode: 'insensitive'
      }
    }
  ]
}

const getLegalEntityById = async (req, res) => {
  const id = req.params.id
  const legalEntity = await prisma.LegalEntity.findUnique({
    include: {
      createdBy: {
        select: {
          firstName: true,
          lastName: true
        }
      },
      contactPersons: {
        include: {
          person: true
        }
      },
      documents: true
    },
    where: {
      id
    }
  })

  return res.status(200).send(legalEntity)
}

const updateLegalEntityDb = async (id, payload) => {
  try {
    await prisma.LegalEntity.update({
      where: { id },
      data: payload
    })
    return true
  } catch (e) {
    LOG.error(`Could not patch legalEntity ${id}`)
    LOG.error(`Error is ${e}`)
    return false
  }
}

const updateLegalEntityById = async (req, res) => {
  const id = req.params.id
  if (Object.keys(req.body).length === 0) return res.status(400).send()
  const legalEntity = await prisma.LegalEntity.findUnique({
    where: {
      id
    }
  })
  if (!legalEntity) {
    LOG.error(`Could not find legalEntity ${id}. Abort Patch now!`)
    return res.status(404).send()
  }
  const update = await updateLegalEntityDb(id, req.body)
  if (!update) return res.status(400).send()

  syncOrchestrator.syncSubcontractorAfterUpdate(id)

  return res.status(204).send()
}

const createContactPersonInDb = async (id, payload) => {
  try {
    const creation = await prisma.person.create({
      data: payload
    })
    await prisma.PersonsOnLegalEntities.create({
      data: {
        personId: creation.id,
        legalEntityId: id
      }
    })
    return creation
  } catch (e) {
    LOG.error(`Could not patch legalEntity ${id}`)
    LOG.error(`Error is ${e}`)
    return false
  }
}

const createContactPersonByLegalEntity = async (req, res) => {
  const id = req.params.id
  const legalEntity = await prisma.LegalEntity.findUnique({
    where: {
      id
    }
  })
  if (!legalEntity) {
    LOG.error(`Could not find legalEntity ${id}. Abort Creation of ContactPerson now!`)
    return res.status(404).send()
  }
  req.body.type = 'external'
  req.body.userId = req.user.id

  const result = await createContactPersonInDb(id, req.body)
  if (!result) return res.status(400).send()

  syncOrchestrator.syncContactPersonForLegalEntityAfterCreate(result, id)

  return res.status(200).send(result)
}

const deleteContactPersonFromLegalEntity = async (req, res) => {
  const { id, personId } = req.params

  const [legalEntity, person, assignment] = await prisma.$transaction([
    prisma.legalEntity.findUnique({ where: { id } }),
    prisma.person.findUnique({ where: { id: personId } }),
    prisma.personsOnLegalEntities.findUnique({
      where: {
        personId_legalEntityId: {
          legalEntityId: id,
          personId
        }
      }
    })
  ])

  if (!legalEntity || !person || !assignment) {
    LOG.info('Something is not existing')
    return res.status(404).send()
  }

  await prisma.personsOnLegalEntities.delete({
    where: {
      personId_legalEntityId: {
        legalEntityId: id,
        personId
      }
    }
  })
  syncOrchestrator.syncContactPersonsOfLegalEntityAfterRemoval(id, personId)
  LOG.info(`Removed person ${personId} from legalEntity ${id}`)
  return res.status(204).send()
}

const setMainContactForLegalEntity = async (req, res) => {
  const { id, personId } = req.params

  const [legalEntity, person, assignment] = await prisma.$transaction([
    prisma.legalEntity.findUnique({ where: { id } }),
    prisma.person.findUnique({ where: { id: personId } }),
    prisma.personsOnLegalEntities.findUnique({
      where: {
        personId_legalEntityId: {
          legalEntityId: id,
          personId
        }
      }
    })
  ])

  if (!legalEntity || !person || !assignment) {
    LOG.info('Something is not existing')
    return res.status(404).send()
  }

  await prisma.$transaction([
    prisma.personsOnLegalEntities.updateMany({
      where: {
        legalEntityId: id,
        personId: { not: personId }
      },
      data: { isMainContact: false }
    }),
    prisma.personsOnLegalEntities.update({
      where: {
        personId_legalEntityId: {
          legalEntityId: id,
          personId
        }
      },
      data: { isMainContact: true }
    })
  ])
  syncOrchestrator.syncMainContactOfLegalEntityAfterUpdate(id, personId)
  LOG.info(`Set person ${personId} from legalEntity ${id} as mainContact`)
  return res.status(204).send()
}

module.exports = {
  createLegalEntity,
  getlegalEntities,
  getLegalEntityById,
  updateLegalEntityById,
  createContactPersonByLegalEntity,
  deleteContactPersonFromLegalEntity,
  setMainContactForLegalEntity
}
