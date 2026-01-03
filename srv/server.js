global.env = require('./server/enviroment')
global.Logger = require('./server/logger')
global.FileHandler = require('./modules/file-handler/index')

const LOG = new Logger('SERVER')
const express = require('express')
const bodyParser = require('body-parser')
const useragent = require('express-useragent')

const fs = require('fs')
const path = require('path')
const app = express()
const PORT = env.port ?? 4004
const version = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json')).toString())?.version

const registerRoutes = require('./routes/index')
const registerHeaders = require('./server/headers')
const registerAuthentication = require('./server/authentication/index')
const registerSession = require('./server/authentication/session')
const registerProduction = require('./server/production')
const prisma = require('./data/prisma')

require('./jobs/jobs')

app.use(useragent.express())
app.use(bodyParser.json({ limit: '50mb' }))
app.use((req, _res, next) => {
  LOG.http(req)
  next()
})

registerProduction(app)
registerHeaders(app)
registerSession(app)

const server = app.listen(PORT, async () => {
  LOG.info(`App listening on port ${PORT}`)
  LOG.alert('Server has started')
  registerRoutes(app)

  app.get('/', async (_req, res) => {
    return res.status(200).send()
  })

  app.get('/device', async (req, res) => {
    return res.status(200).send({ isMobile: req.useragent.isMobile && !req.useragent.isTablet })
  })

  app.get('/version', (_req, res) => {
    res.status(200).send({
      version,
      stage: env.stage
    })
  })

  app.get('/user/current', async (req, res) => {
    const user = await prisma.User.findUnique({
      where: {
        id: req.user.id
      }
    })
    if (!user) return res.status(404)
    return res.status(200).send(user)
  })
})

if (process.env.NODE_ENV === 'test-local') {
  app.get('/shutdown', () => {
    server.close()
    process.exit(0)
  })
  app.get('/admin/reset', async (_req, res) => {
    await dataGenerator.resetMockdata()
    return res.status(204).send()
  })
}
