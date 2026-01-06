const { doubleCsrf } = require('csrf-csrf')
const LOG = new Logger('CSRF')

const isProduction = process.env.NODE_ENV === 'production'

const { doubleCsrfProtection, generateToken } = doubleCsrf({
  getSecret: () => env.csrfSecret || 'csrf-secret-for-local-dev',
  cookieName: '__Host-csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: isProduction
  },
  getTokenFromRequest: (req) => req.headers['x-csrf-token']
})

const csrfTokenEndpoint = (req, res) => {
  const token = generateToken(req, res)
  res.json({ csrfToken: token })
}

const csrfErrorHandler = (err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    LOG.warn(`CSRF token validation failed for IP: ${req.ip}`)
    return res.status(403).json({ error: 'Ungültiges CSRF-Token' })
  }
  next(err)
}

module.exports = {
  doubleCsrfProtection,
  csrfTokenEndpoint,
  csrfErrorHandler
}
