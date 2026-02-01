const registerDevAuth = require('./dev-auth')
const { initOidc, registerOidc } = require('./oidc')

const registerAuthentication = async function (app) {
  if (['development', 'test'].includes(process.env.NODE_ENV)) {
    registerDevAuth(app)
    return
  }

  await initOidc()
  registerOidc(app)
}

module.exports = registerAuthentication
