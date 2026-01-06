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

  if (['production'].includes(process.env.NODE_ENV)) {
    registerOAuth(app)
  }

  if (process.env.NODE_ENV === 'development') {
    registerDevAuth(app)
  }
}

module.exports = registerAuthentication
