const { doubleCsrf } = require('csrf-csrf')
const LOG = new Logger('CSRF')

const isProduction = process.env.NODE_ENV === 'production'

const { doubleCsrfProtection, generateCsrfToken } = doubleCsrf({
  getSecret: () => env.csrfSecret || 'csrf-secret-for-local-dev',
  getSessionIdentifier: (req) => req.sessionID || '',
  cookieName: '__Host-csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'strict',
    path: '/',
    secure: isProduction
  },
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token']
})

const csrfTokenEndpoint = (req, res) => {
  const token = generateCsrfToken(req, res)
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
