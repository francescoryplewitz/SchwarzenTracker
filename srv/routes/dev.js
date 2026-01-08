const LOG = new Logger('DEV-ROUTES')
const { getUsers, getConfig, setConfig } = require('../services/dev')
const { authorize } = require('../server/authentication/authorization')

module.exports = (app) => {
  if (!['development', 'test'].includes(process.env.NODE_ENV)) {
    LOG.info('Dev routes disabled - not in development or test mode')
    return
  }

  LOG.info('Registering dev routes')

  app.get('/dev/users', getUsers)
  app.get('/dev/config', getConfig)
  app.post('/dev/config', setConfig)

  app.get('/dev/test/admin-only', authorize(['admin']), (_req, res) => {
    res.status(200).json({ access: 'admin' })
  })

  app.get('/dev/test/user-only', authorize(['user']), (_req, res) => {
    res.status(200).json({ access: 'user' })
  })
}
