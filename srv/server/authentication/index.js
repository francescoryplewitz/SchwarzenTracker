const passport = require('passport')
const { registerOAuth } = require('./oauth')

const registerAuthentication = async function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })
  app.use(passport.initialize())

  if (['production', 'ui-tests'].includes(process.env.NODE_ENV)) {
    registerOAuth(app)
  }
}

module.exports = registerAuthentication
