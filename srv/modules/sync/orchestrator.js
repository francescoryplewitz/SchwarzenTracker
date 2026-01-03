const prisma = require('../../data/prisma')
const LOG = new Logger('SYNC-ORCHESTRATOR')
class SyncOrchestrator {
  /**
   * @param {SyncHandler[]} handlers
   */
  constructor (handlers) {
    this.handlers = handlers
  }

  /**
   * Sync in parallel to all systems.
   * Logs individual failures without stopping the whole process.
   * @param {Subcontractor} subcontractor
   * @returns {Promise<Array<{handler: string, status: string, error?: any}>>}
   */
  async syncSubcontractorAfterCreation (subcontractor) {
    const promises = this.handlers.map(handler =>
      handler
        .createSubcontractor(subcontractor)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncSubcontractorAfterUpdate (id) {
    LOG.info(`Start update subcontractor ${id}`)
    const subcontractor = await prisma.legalEntity.findUnique({ where: { id } })
    if (!subcontractor) {
      LOG.error(`Could not find legalEntity ${id}. Abort now!`)
      return false
    }

    const promises = this.handlers.map(handler =>
      handler
        .updateSubcontractorById(subcontractor)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncPersonAfterCreate (person) {
    LOG.info(`Start create person ${person.id}`)

    const promises = this.handlers.map(handler =>
      handler
        .createPerson(person)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncContactPersonForLegalEntityAfterCreate (person, legalEntityId) {
    const promises = this.handlers.map(handler =>
      handler
        .createContactPersonForLegalEntity(person, legalEntityId)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncPersonAfterUpdate (personId) {
    LOG.info(`Start update person ${personId}`)
    const person = await prisma.person.findUnique({ where: { id: personId } })
    if (!person) {
      LOG.error(`Could not find person ${personId}. Abort now!`)
      return false
    }

    const promises = this.handlers.map(handler =>
      handler
        .updatePersonById(person)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncMainContactOfLegalEntityAfterUpdate (legalEntityId, personId) {
    const promises = this.handlers.map(handler =>
      handler
        .setMainContactOfLegalEntity(legalEntityId, personId)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }

  async syncContactPersonsOfLegalEntityAfterRemoval (legalEntityId, personId) {
    const promises = this.handlers.map(handler =>
      handler
        .removeContactPersonFromLegalEntity(legalEntityId, personId)
        .then(() => ({ handler: handler.constructor.name, status: 'ok' }))
        .catch(err => ({ handler: handler.constructor.name, status: 'fail', error: err }))
    )

    const report = await Promise.all(promises)
    report.forEach(r => {
      if (r.status === 'fail') {
        console.error(`Sync failed in ${r.handler}:`, r.error)
      }
    })
    return report
  }
}

module.exports = SyncOrchestrator
