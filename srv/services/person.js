const prisma = require('../data/prisma')
const LOG = new Logger('LEGALENTITY')

const updatePersonInDb = async (id, data) => {
  try {
    await prisma.person.update({
      where: { id },
      data
    })
    return true
  } catch (e) {
    LOG.error(`Could not patch person ${id}`)
    LOG.error(`Error is ${e}`)
    return false
  }
}

const updatePersonById = async (req, res) => {
  const id = req.params.id

  const person = await prisma.person.findUnique({
    where: { id }
  })
  if (!person) {
    LOG.info(`Could not find person ${id}. Abort now!`)
    return res.status(400).send()
  }

  const updateResult = await updatePersonInDb(id, req.body)
  if (!updateResult) {
    return res.status(400).send()
  }

  LOG.info(`Successfully updated person ${id}`)

  syncOrchestrator.syncPersonAfterUpdate(id)

  return res.status(204).send()
}

module.exports = { updatePersonById }
