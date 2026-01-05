const axios = require('axios')
const Lib = require('./lib')
const env = require('../srv/server/enviroment')
global.env = env

module.exports = new (class {
  constructor () {
    ;(this.url = env.url),
      (this.service = ''),
      (this.headers = { 'Content-Type': 'application/JSON' })
    this.auth = { username: '', password: '' }
  }
  httpOperations () {
    return {
      GET: async (path, service = this.service, auth = this.auth) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await axios({ url, method: 'GET', auth }).catch(e => {
          if (e.response) {
            return e.response
          }
          return { status: 500, data: { error: e.message } }
        })
      },
      PATCH: async (
        path,
        data,
        service = this.service,
        headers = this.headers,
        auth = this.auth
      ) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await axios({ url, method: 'PATCH', data, headers, auth }).catch(
          e => {
            if (e.response) {
              return e.response
            }
            return { status: 500, data: { error: e.message } }
          }
        )
      },
      POST: async (
        path,
        data,
        headers = this.headers,
        service = this.service,
        auth = this.auth
      ) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await axios({ url, method: 'POST', data, headers, auth }).catch(
          e => {
            if (e.response) {
              return e.response
            }
            return { status: 500, data: { error: e.message } }
          }
        )
      },
      PUT: async (
        path,
        data,
        service = this.service,
        headers = this.headers,
        auth = this.auth
      ) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await axios({ url, method: 'PUT', data, headers, auth }).catch(
          e => {
            if (e.response) {
              return e.response
            }
            return { status: 500, data: { error: e.message } }
          }
        )
      },
      DELETE: async (
        path,
        service = this.service,
        headers = this.headers,
        auth = this.auth,
        data = {}
      ) => {
        const url = `${this.url}${service ? service : ''}${path}`
        const res = await axios({
          url,
          method: 'DELETE',
          headers,
          auth,
          data
        }).catch(e => {
          if (e.response) {
            return e.response
          }
          return { status: 500, data: { error: e.message } }
        })
        return res
      }
    }
  }

  async checkConnection () {
    const result = await axios.get(this.url).catch(_e => {
      return { status: 500 }
    })
    if (result.status === 500) {
      throw new Error('Could not find running server')
    }
  }
  reset () {
    const params = {
      url: `${this.url}/admin/reset`,
      method: 'GET',
      auth: {
        username: 'admin',
        password: 'brale'
      }
    }
    return axios(params)
  }
  clearFileStorage () {
    const params = {
      url: `${this.url}/admin/clear`,
      method: 'GET',
      auth: {
        username: 'admin',
        password: 'brale'
      }
    }
    return axios(params)
  }
  setService (service) {
    this.service = service
  }
  setAuth (auth) {
    this.auth = auth
  }
  addHeader (header) {
    Object.assign(this.headers, header)
  }
  setHeaders (headers) {
    this.headers = headers
  }
  async shutdownServer() {
        const params = {
            method: 'GET',
            url: `${this.url}/shutdown`
        }
        return axios(params).catch(_ => { return null })
    }
})()
