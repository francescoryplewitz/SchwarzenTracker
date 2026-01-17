const passport = require('passport')
const { registerOAuth } = require('./oauth')
const registerDevAuth = require('./dev-auth')

const registerAuthentication = async function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })
  app.use(passport.initialize())
  app.use(passport.session())

  if (['production'].includes(process.env.NODE_ENV)) {
   // registerOAuth(app)
    registerDevAuth(app)
  }

  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    registerDevAuth(app)
  }
}

module.exports = registerAuthentication
