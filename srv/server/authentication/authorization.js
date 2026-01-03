const LOG = new Logger('AUTH')

const checkUserRoles = (user, restriction) => {
  const roles = user?.roles
  let isAuthorized = false

  LOG.info(`Checking roles for user ${user?.id || 'unknown'}`, { roles, restriction })

  if (!roles || !Array.isArray(roles)) {
    LOG.warn(`Invalid or missing roles for user ${user?.id || 'unknown'}`, { roles })
    return false
  }

  roles.forEach(role => {
    if (restriction.includes(role)) {
      isAuthorized = true
      LOG.info(`Role '${role}' is permitted`, { userId: user?.id, role })
    }
  })

  if (!isAuthorized) {
    LOG.info(`User ${user?.id || 'unknown'} does not have required roles`, { userRoles: roles, required: restriction })
  }

  return isAuthorized
}

const authorize = (restriction) => {
  return (req, res, next) => {
    const user = req.user
    const isAuthorized = checkUserRoles(user, restriction)

    LOG.info(`Authorization check for request ${req.method} ${req.originalUrl}`, { userId: user?.id, isAuthorized })

    if (!isAuthorized) {
      LOG.warn('Unauthorized access attempt', { userId: user?.id, path: req.originalUrl, requiredRoles: restriction })
      return res.status(403).send('UNAUTHORIZED')
    }

    LOG.info('Access granted', { userId: user?.id, path: req.originalUrl })
    next()
  }
}

module.exports = {
  authorize
}
