const { GET, PATCH } = server.httpOperations()

describe('User locale endpoint', () => {
  before(async function () {
    await server.checkConnection()
    await server.reset()
    server.setService('')
    await server.setAuth('standard')
  })

  it('should update locale for the current user', async () => {
    const result = await PATCH('/user/locale', { locale: 'de' })
    expect(result.status).to.equal(200)
    expect(result.data.locale).to.equal('de')
  })

  it('should persist locale in current user response', async () => {
    const result = await GET('/user/current')
    expect(result.status).to.equal(200)
    expect(result.data.locale).to.equal('de')
  })

  it('should reject unsupported locales', async () => {
    const result = await PATCH('/user/locale', { locale: 'fr' })
    expect(result.status).to.equal(400)
  })
})
