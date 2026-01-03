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
  aws: {
    clientId: process.env.AWS_CLIENT_ID,
    clientSecret: process.env.AWS_CLIENT_SECRET,
    s3Bucket: process.env.AWS_S3_BUCKET,
    cognito: {
      userPoolId: process.env.AWS_COGNITO_USERPOOLID,
      standardPassword: process.env.AWS_COGNITO_STANDARDPASSWORD
    }
  },
  roleMapping: {
    [process.env.ROLEMAPPING_USER]: 'USER'
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
  resetmockdata: process.env.RESETMOCKDATA,
  stage: process.env.STAGE,
  svenja: {
    apiKey: process.env.SVENJA_API_KEY,
    domain: process.env.SVENJA_DOMAIN
  },
  sage: {
    clientId: process.env.SAGECLIENTID,
    clientSecret: process.env.SAGECLIENTSECRET,
    authUrl: process.env.SAGEAUTHURL,
    baseUrl: process.env.SAGEBASEURL,
    addressPath: process.env.SAGEADDRESSPATH,
    contactPath: process.env.SAGECONTACTPATH
  }
}
console.log('----Setting Secrets----')
console.log(`Example secret: DB:SCHEMA = ${process.env.DB_SCHEMA}`)

fs.writeFileSync(path.resolve(__dirname, '../.env'), `DATABASE_URL=${secrets.db.type}://${secrets.db.username}:${secrets.db.password}@${secrets.db.host}:${secrets.db.port}/${secrets.db.database}?schema=${secrets.db.schema}`)
fs.writeFileSync(path.resolve(__dirname, '../.secrets-private.json'), JSON.stringify(secrets))
