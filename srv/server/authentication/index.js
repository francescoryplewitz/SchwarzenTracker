const passport = require('passport')
const path = require('path')
const { registerBasicAuth, registerBasicAuthRoute } = require(path.resolve(__dirname, './basic'))
const { registerOAuth } = require('./oauth')

const prisma = require('../../data/prisma')

const registerAuthentication = async function (app) {
  passport.serializeUser(function (user, done) {
    done(null, user)
  })

  passport.deserializeUser(function (user, done) {
    done(null, user)
  })
  app.use(passport.initialize())

  if (['test-local', 'development'].includes(process.env.NODE_ENV)) {
    const users = await prisma.user.findMany()
    registerBasicAuth(users)
    registerBasicAuthRoute('/admin', app)
    registerBasicAuthRoute('/user', app)
    registerBasicAuthRoute('/joerg', app)
    registerBasicAuthRoute('/media', app)
  }
  if (['production', 'ui-tests'].includes(process.env.NODE_ENV)) {
    registerOAuth(app)
  }
}

module.exports = registerAuthentication
