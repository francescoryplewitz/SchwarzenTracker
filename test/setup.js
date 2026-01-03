// imports may appear mixed up, but order does matter
const chai = require('chai')
const chaiHttp = require('chai-http')
const chaiSubset = require('chai-subset')
const { DateTime } = require('luxon')
const env = require('../srv/server/enviroment')

chai.use(chaiHttp)
chai.use(chaiSubset)

global.env = env
const server = require('./server')

global.chai = chai
global.expect = chai.expect
global.server = server
global.DateTime = DateTime

before(() => {
  return server.checkConnection()
})
after( async () => {
  await new Promise(resolve => setTimeout(resolve, 1000))
  await server.reset()
  return server.shutdownServer()
}
)
