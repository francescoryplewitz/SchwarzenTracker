class FileService {
  constructor () {
    // Choose implementation based on environment
    if (process.env.NODE_ENV === 'production') {
      const s3 = require('./s3')
      this.handler = s3
    } else {
      const local = require('./local')
      this.handler = local
    }
  }

  /**
   * Save a document using the configured handler.
   * @param  {...any} args - Arguments forwarded to saveDocument
   * @returns {Promise<any>}
   */
  save (...args) {
    return this.handler.saveDocument(...args)
  }

  /**
   * Read a document using the configured handler.
   * @param  {...any} args - Arguments forwarded to readDocument
   * @returns {Promise<any>}
   */
  read (...args) {
    return this.handler.readDocument(...args)
  }

  /**
   * Delete a document using the configured handler.
   * @param  {...any} args - Arguments forwarded to deleteDocument
   * @returns {Promise<any>}
   */
  delete (...args) {
    return this.handler.deleteDocument(...args)
  }
}

// Export a singleton instance
module.exports = new FileService()
