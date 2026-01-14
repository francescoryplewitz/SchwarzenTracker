const prisma = require('../data/prisma')
const LOG = new Logger('DEV-SERVICE')

const getUsersFromDb = async () => {
  try {
    return await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        roles: true
      },
      orderBy: { id: 'asc' }
    })
  } catch (e) {
    LOG.error('Could not get users')
    LOG.error(`Error is: ${e}`)
    return false
  }
}

const getUsers = async (req, res) => {
  const users = await getUsersFromDb()
  if (!users) return res.status(500).json({ error: 'Failed to fetch users' })
  return res.status(200).json(users)
}

const getConfig = (req, res) => {
  const devConfig = req.session?.devUser || { userId: 1, roles: ['user'] }
  return res.status(200).json(devConfig)
}

const setConfig = (req, res) => {
  const { userId, roles } = req.body

  if (!userId || typeof userId !== 'number') {
    return res.status(400).json({ error: 'userId is required and must be a number' })
  }

  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'roles must be an array' })
  }

  req.session.devUser = {
    userId,
    roles
  }

  LOG.info(`Dev config updated: User ${userId} with roles [${roles.join(', ')}]`)
  return res.status(200).json(req.session.devUser)
}

module.exports = {
  getUsers,
  getConfig,
  setConfig
}
