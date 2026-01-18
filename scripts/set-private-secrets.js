const fs = require('fs')
const path = require('path')
require('dotenv').config()

const secrets = {
  auth: {
    cognitoUrl: process.env.AUTH_COGNITO_URL,
    clientId: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL
  },
  roleMapping: {
    [process.env.ROLEMAPPING_USER]: 'user',
    [process.env.ROLEMAPPING_ADMIN]: 'admin'
  },
  db: {
    schema: process.env.DB_SCHEMA,
    type: process.env.DB_TYPE,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
  },
  jobs: {
    run: process.env.JOBSRUN
  },
  domain: process.env.DOMAIN,
  stage: process.env.STAGE,
}
console.log('----Setting Secrets----')
console.log(`Example secret: DB:SCHEMA = ${process.env.DB_SCHEMA}`)

fs.writeFileSync(path.resolve(__dirname, '../.env'), `DATABASE_URL=${secrets.db.type}://${secrets.db.username}:${secrets.db.password}@${secrets.db.host}:${secrets.db.port}/${secrets.db.database}?schema=${secrets.db.schema}`)
fs.writeFileSync(path.resolve(__dirname, '../.secrets-private.json'), JSON.stringify(secrets))
