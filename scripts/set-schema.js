const path = require('path')
const fs = require('fs')
const env = require('../srv/server/enviroment')
fs.writeFileSync(path.resolve(__dirname, '../.env'), `DATABASE_URL=${env.db.type}://${env.db.username}:${env.db.password}@${env.db.host}:${env.db.port}/${env.db.database}?schema=${env.db.schema}`)
