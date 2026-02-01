const helmet = require('helmet')
const cors = require('cors')
const crypto = require('crypto')
const LOG = new Logger('SERVER')

const isProduction = process.env.NODE_ENV === 'production'

// 1️⃣ Helmet Security Headers
const registerHelmet = (app) => {
  LOG.info('Register Helmet')

  // Generate a nonce per request for inline scripts
  app.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('hex')
    next()
  })

  // Content Security Policy
  app.use(helmet.contentSecurityPolicy({
    useDefaults: false,
    directives: {
      defaultSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      scriptSrc: [
        "'self'",
        (req, res) => `'nonce-${res.locals.cspNonce}'`,
        'https://cdn.jsdelivr.net'
      ],
      styleSrc: ["'self'", 'https://cdn.jsdelivr.net'],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      ...(isProduction ? { upgradeInsecureRequests: [] } : {})
    }
  }))

  // Cross-Origin Resource Policy
  app.use(helmet.crossOriginResourcePolicy({
    policy: process.env.NODE_ENV === 'production'
      ? 'same-origin'
      : 'cross-origin'
  }))

  // Enforce HTTPS
  app.use(helmet.hsts({
    maxAge: 31_536_000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
  }))

  // Clickjacking protection
  app.use(helmet.frameguard({ action: 'deny' }))

  // Prevent MIME-type sniffing
  app.use(helmet.noSniff())

  // Referrer Policy
  app.use(helmet.referrerPolicy({ policy: 'no-referrer' }))

  // Permissions Policy (manuell gesetzt)
  app.use((req, res, next) => {
    res.setHeader(
      'Permissions-Policy',
      'geolocation=(), camera=(), microphone=(), payment=(), fullscreen=(self)'
    )
    next()
  })
}

// 2️⃣ CORS
const registerCors = (app) => {
  LOG.info('Register CORS')
  const whitelist = env.corswhitelist

  app.use(cors({
    origin: (origin, callback) => {
      // In case of non-browser requests (e.g., Postman) origin can be undefined
      if (!origin) return callback(null, false)
      try {
        const originHostname = new URL(origin).hostname
        const valid = whitelist.some(url => originHostname === url || originHostname.endsWith('.' + url))
        callback(null, valid)
      } catch {
        callback(null, false)
      }
    },
    credentials: true,
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'x-csrf-token'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    preflightContinue: false,
    optionsSuccessStatus: 204
  }))
}

// 3️⃣ Cache Control (unchanged)
const setCacheControl = (app) => {
  LOG.info('Register Cache Control')
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })
}

module.exports = (app) => {
  registerHelmet(app)
  registerCors(app)
  setCacheControl(app)
}
