const prisma = require('../data/prisma')
const LOG = new Logger('EXERCISES')

const buildExerciseWhere = (req) => {
  const { search, muscleGroup, equipment, category, onlyFavorites, onlyOwn } = req.query
  const userId = req.session?.user?.id
  const where = {}

  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  if (muscleGroup) {
    where.muscleGroups = { has: muscleGroup }
  }
  if (equipment) {
    where.equipment = equipment
  }
  if (category) {
    where.category = category
  }
  if (onlyFavorites && userId) {
    where.userFavorites = { some: { userId } }
  }
  if (onlyOwn && userId) {
    where.createdById = userId
  }

  return where
}

const buildExerciseQuery = (req) => {
  const { skip } = req.query
  const where = buildExerciseWhere(req)

  return {
    where,
    orderBy: { name: 'asc' },
    take: 30,
    skip: isNaN(parseInt(skip)) || parseInt(skip) < 0 ? 0 : parseInt(skip),
    include: {
      variants: { select: { id: true, title: true } },
      _count: { select: { variants: true } }
    }
  }
}

const getExercises = async (req, res) => {
  const { count } = req.query

  try {
    if (count) {
      const where = buildExerciseWhere(req)
      const total = await prisma.exercise.count({ where })
      LOG.info(`Counted ${total} exercises`)
      return res.status(200).send(`${total}`)
    }

    const query = buildExerciseQuery(req)
    const exercises = await prisma.exercise.findMany(query)
    LOG.info(`Fetched ${exercises.length} exercises`)
    return res.status(200).send(exercises)
  } catch (e) {
    LOG.error(`Could not get exercises: ${e}`)
    return res.status(400).send()
  }
}

const getExercise = async (req, res) => {
  const { id } = req.params
  const userId = req.session?.user?.id

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
      include: {
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        userFavorites: userId ? { where: { userId } } : false
      }
    })

    if (!exercise) {
      LOG.info(`Exercise ${id} not found`)
      return res.status(404).send()
    }

    const result = {
      ...exercise,
      isFavorite: exercise.userFavorites?.length > 0
    }
    delete result.userFavorites

    LOG.info(`Fetched exercise ${id}`)
    return res.status(200).send(result)
  } catch (e) {
    LOG.error(`Could not get exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const createExercise = async (req, res) => {
  const userId = req.session.user.id

  try {
    const exercise = await prisma.exercise.create({
      data: {
        ...req.body,
        createdById: userId,
        isSystem: false
      }
    })
    LOG.info(`Created exercise ${exercise.id} by user ${userId}`)
    return res.status(201).send(exercise)
  } catch (e) {
    LOG.error(`Could not create exercise: ${e}`)
    return res.status(400).send()
  }
}

const updateExercise = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const existing = await prisma.exercise.findUnique({ where: { id } })

    if (!existing) {
      LOG.info(`Exercise ${id} not found for update`)
      return res.status(404).send()
    }

    if (existing.isSystem) {
      LOG.info(`Cannot edit system exercise ${id}`)
      return res.status(403).send({ error: 'System-Übungen können nicht bearbeitet werden' })
    }

    if (existing.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to edit exercise ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Übungen bearbeiten' })
    }

    const updated = await prisma.exercise.update({
      where: { id },
      data: req.body
    })
    LOG.info(`Updated exercise ${id}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const deleteExercise = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const existing = await prisma.exercise.findUnique({ where: { id } })

    if (!existing) {
      LOG.info(`Exercise ${id} not found for deletion`)
      return res.status(404).send()
    }

    if (existing.isSystem) {
      LOG.info(`Cannot delete system exercise ${id}`)
      return res.status(403).send({ error: 'System-Übungen können nicht gelöscht werden' })
    }

    if (existing.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to delete exercise ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Übungen löschen' })
    }

    await prisma.exercise.delete({ where: { id } })
    LOG.info(`Deleted exercise ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.error(`Could not delete exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const forkExercise = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const original = await prisma.exercise.findUnique({
      where: { id },
      include: { images: true }
    })

    if (!original) {
      LOG.info(`Exercise ${id} not found for forking`)
      return res.status(404).send()
    }

    const forked = await prisma.exercise.create({
      data: {
        name: original.name,
        description: original.description,
        muscleGroups: original.muscleGroups,
        category: original.category,
        equipment: original.equipment,
        videoUrl: original.videoUrl,
        isSystem: false,
        forkedFromId: id,
        createdById: userId
      }
    })

    LOG.info(`Forked exercise ${id} to ${forked.id} by user ${userId}`)
    return res.status(201).send(forked)
  } catch (e) {
    LOG.error(`Could not fork exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const addVariant = async (req, res) => {
  const { id } = req.params
  const { title, description, equipment } = req.body
  const userId = req.session.user.id

  try {
    const exercise = await prisma.exercise.findUnique({ where: { id } })

    if (!exercise) {
      LOG.info(`Exercise ${id} not found`)
      return res.status(404).send()
    }

    if (exercise.isSystem) {
      LOG.info(`Cannot add variant to system exercise ${id}`)
      return res.status(403).send({ error: 'Zu System-Übungen können keine Varianten hinzugefügt werden' })
    }

    if (exercise.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to add variant to exercise ${id}`)
      return res.status(403).send({ error: 'Du kannst nur zu eigenen Übungen Varianten hinzufügen' })
    }

    const variant = await prisma.exerciseVariant.create({
      data: {
        title,
        description,
        equipment,
        exerciseId: id
      }
    })

    LOG.info(`Created variant ${variant.id} for exercise ${id}`)
    return res.status(201).send(variant)
  } catch (e) {
    LOG.error(`Could not create variant for exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const addFavorite = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const exercise = await prisma.exercise.findUnique({ where: { id } })

    if (!exercise) {
      LOG.info(`Exercise ${id} not found for favorite`)
      return res.status(404).send()
    }

    await prisma.userExerciseFavorite.upsert({
      where: { userId_exerciseId: { userId, exerciseId: id } },
      update: {},
      create: { userId, exerciseId: id }
    })

    LOG.info(`User ${userId} favorited exercise ${id}`)
    return res.status(201).send()
  } catch (e) {
    LOG.error(`Could not add favorite for exercise ${id}: ${e}`)
    return res.status(400).send()
  }
}

const removeFavorite = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    await prisma.userExerciseFavorite.delete({
      where: { userId_exerciseId: { userId, exerciseId: id } }
    })

    LOG.info(`User ${userId} unfavorited exercise ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.info(`Favorite not found for user ${userId} on exercise ${id}`)
    return res.status(404).send()
  }
}

module.exports = {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  forkExercise,
  addVariant,
  addFavorite,
  removeFavorite,
  buildExerciseWhere,
  buildExerciseQuery
}
