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

const cookieParser = require('cookie-parser')
const registerRoutes = require('./routes/index')
const registerHeaders = require('./server/headers')
const registerAuthentication = require('./server/authentication/index')
const registerSession = require('./server/authentication/session')
const registerProduction = require('./server/production')
const { apiLimiter } = require('./server/rate-limit')
const { doubleCsrfProtection, csrfTokenEndpoint, csrfErrorHandler } = require('./server/csrf')
const prisma = require('./data/prisma')
const dg = require('./data/data-generator')
require('./jobs/jobs')

app.use(useragent.express())
app.use(bodyParser.json({ limit: '50mb' }))
app.use((req, _res, next) => {
  LOG.http(req)
  next()
})

registerProduction(app)
registerHeaders(app)
app.use(apiLimiter)
app.use(cookieParser())
registerSession(app)
registerAuthentication(app)

// CSRF protection for state-changing requests (skip in test/development)
if (!['test', 'development'].includes(process.env.NODE_ENV)) {
  app.use(doubleCsrfProtection)
  app.use(csrfErrorHandler)
}
app.get('/csrf-token', csrfTokenEndpoint)

const server = app.listen(PORT, async () => {
  LOG.info(`App listening on port ${PORT}`)
  LOG.alert('Server has started')
  registerRoutes(app)
  await dg.init()

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
    if (!req.user?.id) {
      return res.status(401).send({ error: 'Not authenticated' })
    }
    const user = await prisma.User.findUnique({
      where: {
        id: req.user.id
      }
    })
    if (!user) return res.status(404).send({ error: 'User not found' })
    return res.status(200).send(user)
  })
})

if (process.env.NODE_ENV === 'test') {
  app.get('/shutdown', () => {
    server.close()
    process.exit(0)
  })
}
