const session = require('express-session')
const MemoryStore = require('memorystore')(session)

const extractHostname = (urlOrHostname) => {
  if (!urlOrHostname) return undefined
  try {
    const url = new URL(urlOrHostname)
    return url.hostname
  } catch {
    return urlOrHostname
  }
}

const registerSession = function (app) {
  const cookieDomain = ['test', 'development'].includes(process.env.NODE_ENV)
    ? undefined
    : extractHostname(env.domain)

  const params = {
    secret: 'somesecretforlocal',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 1 * 60 * 60 * 1000
    }),
    cookie: {
      sameSite: 'lax',
      domain: cookieDomain,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production' && env.domain?.startsWith('https'),
      httpOnly: true
    }
  }
  app.use(session(params))
}

module.exports = registerSession
