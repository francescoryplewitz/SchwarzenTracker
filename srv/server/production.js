const express = require('express')
const path = require('path')
const LOG = new Logger('Server')
module.exports = (app) => {
  if (!['production'].includes(process.env.NODE_ENV)) return
  LOG.info('Register client build')
  app.use(express.static(path.join(__dirname, '../../frontend/dist/spa/')))
  app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/spa/index.html'))
  })
}
