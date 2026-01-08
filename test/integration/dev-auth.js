const { GET, POST } = server.httpOperations()

describe('Dev authentication endpoints', () => {
  before(async function () {
    await server.checkConnection()
    server.resetSession()
  })

  afterEach(() => {
    server.resetSession()
  })

  describe('Admin-only endpoint', () => {
    it('should allow access for users with admin role', async () => {
      await POST('/dev/config', { userId: 1, roles: ['admin'] })
      const result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(200)
      expect(result.data.access).to.equal('admin')
    })

    it('should deny access for users with only user role', async () => {
      await POST('/dev/config', { userId: 1, roles: ['user'] })
      const result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(403)
    })

    it('should deny access for users with no roles', async () => {
      await POST('/dev/config', { userId: 1, roles: [] })
      const result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(403)
    })
  })

  describe('User-only endpoint', () => {
    it('should allow access for users with user role', async () => {
      await server.setAuth('standard')
      const result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(200)
      expect(result.data.access).to.equal('user')
    })

    it('should allow access for admin users who also have user role', async () => {
      await server.setAuth('admin')
      const result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(200)
      expect(result.data.access).to.equal('user')
    })

    it('should deny access for users with only admin role', async () => {
      await POST('/dev/config', { userId: 1, roles: ['admin'] })
      const result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(403)
    })

    it('should deny access for users with no roles', async () => {
      await POST('/dev/config', { userId: 1, roles: [] })
      const result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(403)
    })
  })

  describe('User switching during test', () => {
    it('should change access when switching from user to admin role', async () => {
      // Start as regular user
      await POST('/dev/config', { userId: 1, roles: ['user'] })

      // User can access user endpoint
      let result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(200)

      // User cannot access admin endpoint
      result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(403)

      // Switch to admin role
      await POST('/dev/config', { userId: 1, roles: ['admin'] })

      // Now can access admin endpoint
      result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(200)

      // But cannot access user-only endpoint
      result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(403)
    })

    it('should change access when switching from admin to user role', async () => {
      // Start as admin
      await POST('/dev/config', { userId: 1, roles: ['admin'] })

      // Admin can access admin endpoint
      let result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(200)

      // Switch to user role
      await POST('/dev/config', { userId: 1, roles: ['user'] })

      // Now cannot access admin endpoint
      result = await GET('/dev/test/admin-only')
      expect(result.status).to.equal(403)

      // But can access user endpoint
      result = await GET('/dev/test/user-only')
      expect(result.status).to.equal(200)
    })

    it('should allow both endpoints when user has both roles', async () => {
      await server.setAuth('admin')

      const adminResult = await GET('/dev/test/admin-only')
      expect(adminResult.status).to.equal(200)

      const userResult = await GET('/dev/test/user-only')
      expect(userResult.status).to.equal(200)
    })
  })
})
