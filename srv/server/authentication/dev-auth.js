const prisma = require('../../data/prisma')
const LOG = new Logger('DEV-AUTH')

const registerDevAuth = (app) => {
  LOG.info('Registering dev auth middleware')

  app.use(async (req, res, next) => {
    // Skip dev auth only for the dev config endpoints, not test endpoints
    if (req.path === '/dev/users' || req.path === '/dev/config') {
      return next()
    }

    // Get dev user config from session, default to user 1
    const devConfig = req.session?.devUser || { userId: 1, roles: ['user'] }

    // If no user configured and no session user, use default
    if (!devConfig.userId) {
      devConfig.userId = 1
      devConfig.roles = ['user']
    }

    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: devConfig.userId }
      })

      if (dbUser) {
        req.user = {
          id: dbUser.id,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
          email: dbUser.email,
          externalId: dbUser.externalId,
          roles: devConfig.roles || [],
          locale: dbUser.locale
        }
        req.session.user = req.user
        LOG.debug(`Dev auth: User ${dbUser.id} (${dbUser.firstName} ${dbUser.lastName}) with roles [${devConfig.roles.join(', ')}]`)
      } else {
        LOG.warn(`Dev auth: User ${devConfig.userId} not found in database`)
        req.user = undefined
      }
    } catch (error) {
      LOG.error(`Dev auth error: ${error.message}`)
      req.user = undefined
    }

    next()
  })
}

module.exports = registerDevAuth
