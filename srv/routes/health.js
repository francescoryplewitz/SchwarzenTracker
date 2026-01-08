module.exports = (app) => {
  app.get('/health', (_req, res) => {
    res.status(200).send({ status: 'ok' })
  })
}
