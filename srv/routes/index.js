const LOG = new Logger('ROUTES')
const fs = require('fs')
const path = require('path')

module.exports = (app) => {
  LOG.info('Registering routes')
  const files = fs.readdirSync(path.resolve(__dirname, './')).filter(file => file !== 'index.js')
  LOG.info('Found routes', files)

  for (const file of files) {
    require(`./${file}`)(app)
  }
}
