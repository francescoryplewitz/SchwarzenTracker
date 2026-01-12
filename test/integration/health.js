const { GET } = server.httpOperations()

describe('Health endpoint', () => {
  before(async function () {
    await server.checkConnection()
    server.setService('')
  })

  it('should return status 200 with ok status', async () => {
    const result = await GET('/health')
    expect(result.status).to.equal(200)
    expect(result.data.status).to.equal('ok')
  })
})
