// core/SyncHandler.js

/**
 * @typedef {Object} Subunternehmer
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * // … weitere Felder
 */

/**
 * @interface
 */
class SyncHandler {
  async createSubcontractor () {
    throw new Error('syncSubcontractor() must be implemented')
  }

  async updateSubcontractor () {
    throw new Error('syncSubcontractor() must be implemented')
  }

  async createContactPersonForLegalEntity () {
    throw new Error('createContactPersonForLegalEntity() must be implemented')
  }

  async updatePersonById () {
    throw new Error('updatePerson() must be implemented')
  }

  async setMainContactOfLegalEntity () {
    throw new Error('setMainContactOfLegalEntity() must be implemented')
  }

  async removeContactPersonFromLegalEntity () {
    throw new Error('removeContactPersonFromLegalEntity() must be implemented')
  }
}

module.exports = SyncHandler
