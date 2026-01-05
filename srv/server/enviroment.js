const fs = require('fs')
const path = require('path')
const ENV = process.env.NODE_ENV ?? 'development'

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../.secrets.json').toString()))

const parsePrivateSecrets = (config) => {
  if (['test'].includes(ENV)) return
  if (!fs.existsSync(path.resolve(__dirname, '../../.secrets-private.json'))) return
  const privateConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../.secrets-private.json').toString()))
  for (const [key, value] of Object.entries(privateConfig)) {
    config[key] = value
  }
}

const setJSONToProcessEnviroment = (variables, prefix) => {
  Object.keys(variables).forEach((key) => {
    if (typeof variables[key] === 'object') {
      return setJSONToProcessEnviroment(variables[key], `${key}_`)
    }
    process.env[`${prefix}${key}`.toUpperCase()] = variables[key]
  })
}
const buildDatabaseConnectionString = (env) => {
  const { db } = env
  process.env.DATABASE_URL = `${db.type}://${db.username}:${db.password}@${db.host}:${db.port}/${db.database}?schema=${db.schema}`
}
parsePrivateSecrets(config[ENV])
buildDatabaseConnectionString(config[ENV])
setJSONToProcessEnviroment(config[ENV], '')
module.exports = config[ENV]
