const session = require('express-session')
const MemoryStore = require('memorystore')(session)

const registerSession = function (app) {
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
      domain: process.env.domain,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true
    }
  }
  app.use(session(params))
}

module.exports = registerSession
