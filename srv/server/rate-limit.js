const rateLimit = require('express-rate-limit')
const LOG = new Logger('RATE-LIMIT')

const isProduction = process.env.NODE_ENV === 'production'

// No-op middleware for non-production environments
const noOpLimiter = (req, res, next) => next()

const createLimiter = (windowMs, max, message) => {
  if (!isProduction) {
    return noOpLimiter
  }

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      LOG.warn(`Rate limit exceeded for IP: ${req.ip}`)
      res.status(429).json({ error: message })
    }
  })
}

// General API limiter: 100 requests per minute
const apiLimiter = createLimiter(
  60 * 1000,
  100,
  'Zu viele Anfragen. Bitte versuche es später erneut.'
)

// Auth limiter: 10 requests per 15 minutes
const authLimiter = createLimiter(
  15 * 60 * 1000,
  10,
  'Zu viele Anmeldeversuche. Bitte versuche es später erneut.'
)

// File upload limiter: 20 uploads per hour
const uploadLimiter = createLimiter(
  60 * 60 * 1000,
  20,
  'Zu viele Uploads. Bitte versuche es später erneut.'
)

module.exports = {
  apiLimiter,
  authLimiter,
  uploadLimiter
}
