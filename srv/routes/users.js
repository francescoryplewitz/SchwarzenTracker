const { validate } = require('../server/input-validation-v2')
const { authorize } = require('../server/authentication/authorization')
const service = require('../services/users')

module.exports = (app) => {
  app.patch('/user/locale', authorize(['user']), validate({
    locale: { type: 'STRING', required: true }
  }), service.updateLocale)
}
