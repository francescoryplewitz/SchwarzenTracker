const axios = require('axios').default
const { wrapper } = require('axios-cookiejar-support')
const { CookieJar } = require('tough-cookie')
const env = require('../srv/server/enviroment')
const dataGenerator = require('../srv/data/data-generator')
const users = require('../srv/data/structuredata/user.json')

global.env = env

const authPresets = {}
for (const user of users) {
  const key = user.firstName.toLowerCase()
  authPresets[key] = { userId: user.id, roles: user.roles }
}

module.exports = new (class {
  constructor () {
    this.url = env.url || env.domain
    this.service = ''
    this.headers = { 'Content-Type': 'application/json' }
    this.jar = new CookieJar()
    this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }))
  }

  httpOperations () {
    return {
      GET: async (path, service = this.service) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await this.client({ url, method: 'GET' }).catch(e => {
          if (e.response) return e.response
          return { status: 500, data: { error: e.message } }
        })
      },
      POST: async (path, data, service = this.service, headers = this.headers) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await this.client({ url, method: 'POST', data, headers }).catch(e => {
          if (e.response) return e.response
          return { status: 500, data: { error: e.message } }
        })
      },
      PATCH: async (path, data, service = this.service, headers = this.headers) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await this.client({ url, method: 'PATCH', data, headers }).catch(e => {
          if (e.response) return e.response
          return { status: 500, data: { error: e.message } }
        })
      },
      PUT: async (path, data, service = this.service, headers = this.headers) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await this.client({ url, method: 'PUT', data, headers }).catch(e => {
          if (e.response) return e.response
          return { status: 500, data: { error: e.message } }
        })
      },
      DELETE: async (path, data = {}, service = this.service, headers = this.headers) => {
        const url = `${this.url}${service ? service : ''}${path}`
        return await this.client({ url, method: 'DELETE', data, headers }).catch(e => {
          if (e.response) return e.response
          return { status: 500, data: { error: e.message } }
        })
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

  async reset () {
    await dataGenerator.resetMockdata()
  }

  resetSession () {
    this.jar = new CookieJar()
    this.client = wrapper(axios.create({ jar: this.jar, withCredentials: true }))
  }

  async setAuth (preset) {
    const config = authPresets[preset]
    if (!config) {
      throw new Error(`Unknown auth preset: ${preset}. Available: ${Object.keys(authPresets).join(', ')}`)
    }
    const url = `${this.url}/dev/config`
    return await this.client({
      url,
      method: 'POST',
      data: config,
      headers: this.headers
    })
  }

  setService (service) {
    this.service = service
  }

  addHeader (header) {
    Object.assign(this.headers, header)
  }

  setHeaders (headers) {
    this.headers = headers
  }

  async shutdownServer () {
    return axios({ method: 'GET', url: `${this.url}/shutdown` }).catch(_ => null)
  }
})()
