const session = require('express-session')
const MemoryStore = require('memorystore')(session)

const registerSession = function (app) {
  app.use((req, res, next) => {
    if (req.cookies?.['connect.sid']) {
      res.clearCookie('connect.sid', { path: '/' })
      res.clearCookie('connect.sid', { path: '/', domain: req.hostname })
    }
    next()
  })

  const params = {
    name: 'st.sid',
    secret: 'somesecretforlocal',
    resave: false,
    rolling: true,
    saveUninitialized: true,
    store: new MemoryStore({
      checkPeriod: 1 * 60 * 60 * 1000
    }),
    cookie: {
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === 'production' && env.domain?.startsWith('https'),
      httpOnly: true
    }
  }
  app.use(session(params))
}

module.exports = registerSession
