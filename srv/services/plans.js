const prisma = require('../data/prisma')
const LOG = new Logger('PLANS')

const calculatePlanDuration = (exercises) => {
  if (!exercises || exercises.length === 0) return 0

  let totalDuration = 0

  exercises.forEach((exercise) => {
    // Pausen zwischen Sätzen (n-1 Pausen für n Sätze)
    if (exercise.sets > 1) {
      const restSeconds = exercise.restSeconds || 90
      totalDuration += (exercise.sets - 1) * restSeconds
    }
  })

  return totalDuration
}

const buildPlanWhere = (req) => {
  const { search, onlyFavorites, onlyOwn, onlySystem, muscleGroups } = req.query
  const userId = req.session?.user?.id
  const where = {}

  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  if (onlySystem) {
    where.isSystem = true
  }
  if (onlyOwn && userId) {
    where.createdById = userId
  }
  if (onlyFavorites && userId) {
    where.favorites = { some: { userId } }
  }
  if (muscleGroups) {
    const groups = muscleGroups.split(',')
    where.exercises = {
      some: {
        exercise: {
          muscleGroups: { hasSome: groups }
        }
      }
    }
  }

  return where
}

const buildPlanQuery = (req) => {
  const { skip } = req.query
  const userId = req.session?.user?.id
  const where = buildPlanWhere(req)

  return {
    where,
    orderBy: { name: 'asc' },
    take: 30,
    skip: isNaN(parseInt(skip)) || parseInt(skip) < 0 ? 0 : parseInt(skip),
    include: {
      exercises: {
        select: {
          id: true,
          sets: true,
          restSeconds: true
        },
        orderBy: { sortOrder: 'asc' }
      },
      favorites: userId ? { where: { userId }, select: { userId: true } } : false
    }
  }
}

const getPlans = async (req, res) => {
  const { count } = req.query

  try {
    if (count) {
      const where = buildPlanWhere(req)
      const total = await prisma.trainingPlan.count({ where })
      LOG.info(`Counted ${total} plans`)
      return res.status(200).send(`${total}`)
    }

    const query = buildPlanQuery(req)
    const plans = await prisma.trainingPlan.findMany(query)

    const result = plans.map(p => ({
      ...p,
      isFavorite: p.favorites?.length > 0,
      exerciseCount: p.exercises.length,
      estimatedDuration: calculatePlanDuration(p.exercises),
      favorites: undefined,
      exercises: undefined
    }))

    LOG.info(`Fetched ${result.length} plans`)
    return res.status(200).send(result)
  } catch (e) {
    LOG.error(`Could not get plans: ${e}`)
    return res.status(400).send()
  }
}

const getPlan = async (req, res) => {
  const { id } = req.params
  const userId = req.session?.user?.id

  try {
    const plan = await prisma.trainingPlan.findUnique({
      where: { id },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true }
        },
        favorites: userId ? { where: { userId }, select: { userId: true } } : false
      }
    })

    if (!plan) {
      LOG.info(`Plan ${id} not found`)
      return res.status(404).send()
    }

    const result = {
      ...plan,
      isFavorite: plan.favorites?.length > 0
    }
    delete result.favorites

    LOG.info(`Fetched plan ${id}`)
    return res.status(200).send(result)
  } catch (e) {
    LOG.error(`Could not get plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const createPlan = async (req, res) => {
  const userId = req.session.user.id

  try {
    const plan = await prisma.trainingPlan.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        createdById: userId,
        isSystem: false
      }
    })
    LOG.info(`Created plan ${plan.id} by user ${userId}`)
    return res.status(201).send(plan)
  } catch (e) {
    LOG.error(`Could not create plan: ${e}`)
    return res.status(400).send()
  }
}

const updatePlan = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const existing = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!existing) {
      LOG.info(`Plan ${id} not found for update`)
      return res.status(404).send()
    }

    if (existing.isSystem) {
      LOG.info(`Cannot edit system plan ${id}`)
      return res.status(403).send({ error: 'System-Pläne können nicht bearbeitet werden' })
    }

    if (existing.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to edit plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne bearbeiten' })
    }

    const updated = await prisma.trainingPlan.update({
      where: { id },
      data: {
        name: req.body.name,
        description: req.body.description
      }
    })
    LOG.info(`Updated plan ${id}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const deletePlan = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const existing = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!existing) {
      LOG.info(`Plan ${id} not found for deletion`)
      return res.status(404).send()
    }

    if (existing.isSystem) {
      LOG.info(`Cannot delete system plan ${id}`)
      return res.status(403).send({ error: 'System-Pläne können nicht gelöscht werden' })
    }

    if (existing.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to delete plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne löschen' })
    }

    await prisma.trainingPlan.delete({ where: { id } })
    LOG.info(`Deleted plan ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.error(`Could not delete plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const copyPlan = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const original = await prisma.trainingPlan.findUnique({
      where: { id },
      include: { exercises: true }
    })

    if (!original) {
      LOG.info(`Plan ${id} not found for copying`)
      return res.status(404).send()
    }

    const copy = await prisma.trainingPlan.create({
      data: {
        name: `${original.name} (Kopie)`,
        description: original.description,
        createdById: userId,
        isSystem: false,
        exercises: {
          create: original.exercises.map(e => ({
            exerciseId: e.exerciseId,
            sortOrder: e.sortOrder,
            sets: e.sets,
            minReps: e.minReps,
            maxReps: e.maxReps,
            targetWeight: e.targetWeight,
            restSeconds: e.restSeconds,
            notes: e.notes
          }))
        }
      },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true }
        }
      }
    })

    LOG.info(`Copied plan ${id} to ${copy.id} by user ${userId}`)
    return res.status(201).send(copy)
  } catch (e) {
    LOG.error(`Could not copy plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const addExercise = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id
  const { exerciseId, sets, minReps, maxReps, targetWeight, restSeconds, notes } = req.body

  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!plan) {
      LOG.info(`Plan ${id} not found`)
      return res.status(404).send()
    }

    if (plan.isSystem) {
      LOG.info(`Cannot add exercise to system plan ${id}`)
      return res.status(403).send({ error: 'Zu System-Plänen können keine Übungen hinzugefügt werden' })
    }

    if (plan.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to modify plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne bearbeiten' })
    }

    const maxOrder = await prisma.planExercise.aggregate({
      where: { planId: id },
      _max: { sortOrder: true }
    })

    const planExercise = await prisma.planExercise.create({
      data: {
        planId: id,
        exerciseId,
        sortOrder: (maxOrder._max.sortOrder || 0) + 1,
        sets: sets || 3,
        minReps: minReps || 8,
        maxReps: maxReps || 12,
        targetWeight,
        restSeconds,
        notes
      },
      include: { exercise: true }
    })

    LOG.info(`Added exercise ${exerciseId} to plan ${id}`)
    return res.status(201).send(planExercise)
  } catch (e) {
    LOG.error(`Could not add exercise to plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const updatePlanExercise = async (req, res) => {
  const { id, exerciseId } = req.params
  const userId = req.session.user.id
  const { sets, minReps, maxReps, targetWeight, restSeconds, notes } = req.body

  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!plan) {
      LOG.info(`Plan ${id} not found`)
      return res.status(404).send()
    }

    if (plan.isSystem) {
      LOG.info(`Cannot update exercise in system plan ${id}`)
      return res.status(403).send({ error: 'System-Pläne können nicht bearbeitet werden' })
    }

    if (plan.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to modify plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne bearbeiten' })
    }

    const planExercise = await prisma.planExercise.findFirst({
      where: { planId: id, exerciseId }
    })

    if (!planExercise) {
      LOG.info(`Exercise ${exerciseId} not found in plan ${id}`)
      return res.status(404).send()
    }

    const updated = await prisma.planExercise.update({
      where: { id: planExercise.id },
      data: { sets, minReps, maxReps, targetWeight, restSeconds, notes },
      include: { exercise: true }
    })

    LOG.info(`Updated exercise ${exerciseId} in plan ${id}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update exercise in plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const removeExercise = async (req, res) => {
  const { id, exerciseId } = req.params
  const userId = req.session.user.id

  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!plan) {
      LOG.info(`Plan ${id} not found`)
      return res.status(404).send()
    }

    if (plan.isSystem) {
      LOG.info(`Cannot remove exercise from system plan ${id}`)
      return res.status(403).send({ error: 'System-Pläne können nicht bearbeitet werden' })
    }

    if (plan.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to modify plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne bearbeiten' })
    }

    const planExercise = await prisma.planExercise.findFirst({
      where: { planId: id, exerciseId }
    })

    if (!planExercise) {
      LOG.info(`Exercise ${exerciseId} not found in plan ${id}`)
      return res.status(404).send()
    }

    await prisma.planExercise.delete({ where: { id: planExercise.id } })

    LOG.info(`Removed exercise ${exerciseId} from plan ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.error(`Could not remove exercise from plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const reorderExercises = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id
  const { order } = req.body

  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!plan) {
      LOG.info(`Plan ${id} not found`)
      return res.status(404).send()
    }

    if (plan.isSystem) {
      LOG.info(`Cannot reorder exercises in system plan ${id}`)
      return res.status(403).send({ error: 'System-Pläne können nicht bearbeitet werden' })
    }

    if (plan.createdById !== userId) {
      LOG.info(`User ${userId} not authorized to modify plan ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne bearbeiten' })
    }

    await prisma.$transaction(
      order.map(item =>
        prisma.planExercise.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    )

    LOG.info(`Reordered exercises in plan ${id}`)
    return res.status(200).send({ success: true })
  } catch (e) {
    LOG.error(`Could not reorder exercises in plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const addFavorite = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const plan = await prisma.trainingPlan.findUnique({ where: { id } })

    if (!plan) {
      LOG.info(`Plan ${id} not found for favorite`)
      return res.status(404).send()
    }

    await prisma.userPlanFavorite.upsert({
      where: { userId_planId: { userId, planId: id } },
      update: {},
      create: { userId, planId: id }
    })

    LOG.info(`User ${userId} favorited plan ${id}`)
    return res.status(201).send()
  } catch (e) {
    LOG.error(`Could not add favorite for plan ${id}: ${e}`)
    return res.status(400).send()
  }
}

const removeFavorite = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    await prisma.userPlanFavorite.delete({
      where: { userId_planId: { userId, planId: id } }
    })

    LOG.info(`User ${userId} unfavorited plan ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.info(`Favorite not found for user ${userId} on plan ${id}`)
    return res.status(404).send()
  }
}

module.exports = {
  getPlans,
  getPlan,
  createPlan,
  updatePlan,
  deletePlan,
  copyPlan,
  addExercise,
  updatePlanExercise,
  removeExercise,
  reorderExercises,
  addFavorite,
  removeFavorite,
  buildPlanWhere,
  buildPlanQuery
}
