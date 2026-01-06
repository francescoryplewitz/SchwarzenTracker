const LOG = new Logger('DEV-ROUTES')
const { getUsers, getConfig, setConfig } = require('../services/dev')

module.exports = (app) => {
  if (process.env.NODE_ENV !== 'development') {
    LOG.info('Dev routes disabled - not in development mode')
    return
  }

  LOG.info('Registering dev routes')

  app.get('/dev/users', getUsers)
  app.get('/dev/config', getConfig)
  app.post('/dev/config', setConfig)
}
