const prisma = require('../data/prisma')
const LOG = new Logger('WORKOUTS')

const buildWorkoutWhere = (req) => {
  const { status } = req.query
  const userId = req.session.user.id
  const where = { userId }

  if (status) {
    where.status = status
  }

  return where
}

const buildWorkoutQuery = (req) => {
  const { skip } = req.query
  const where = buildWorkoutWhere(req)

  return {
    where,
    orderBy: { startedAt: 'desc' },
    take: 30,
    skip: isNaN(parseInt(skip)) || parseInt(skip) < 0 ? 0 : parseInt(skip),
    include: {
      sets: {
        select: { id: true, completedAt: true }
      }
    }
  }
}

const calculateDuration = (workout) => {
  const start = new Date(workout.startedAt).getTime()
  const end = workout.completedAt
    ? new Date(workout.completedAt).getTime()
    : Date.now()
  const paused = workout.totalPausedMs || 0

  if (workout.pausedAt) {
    const pauseStart = new Date(workout.pausedAt).getTime()
    return end - start - paused - (Date.now() - pauseStart)
  }

  return end - start - paused
}

const getWorkouts = async (req, res) => {
  const { count } = req.query

  try {
    if (count) {
      const where = buildWorkoutWhere(req)
      const total = await prisma.workout.count({ where })
      LOG.info(`Counted ${total} workouts`)
      return res.status(200).send(`${total}`)
    }

    const query = buildWorkoutQuery(req)
    const workouts = await prisma.workout.findMany(query)

    const result = workouts.map(w => ({
      id: w.id,
      planId: w.planId,
      planName: w.planName,
      status: w.status,
      startedAt: w.startedAt,
      completedAt: w.completedAt,
      duration: calculateDuration(w),
      setsCompleted: w.sets.filter(s => s.completedAt).length,
      totalSets: w.sets.length
    }))

    LOG.info(`Fetched ${result.length} workouts`)
    return res.status(200).send(result)
  } catch (e) {
    LOG.error(`Could not get workouts: ${e}`)
    return res.status(400).send()
  }
}

const getActiveWorkout = async (req, res) => {
  const userId = req.session.user.id

  try {
    const workout = await prisma.workout.findFirst({
      where: {
        userId,
        status: { in: ['IN_PROGRESS', 'PAUSED'] }
      },
      include: {
        sets: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planExercise: {
              include: { exercise: true }
            }
          }
        }
      }
    })

    if (!workout) {
      LOG.info(`No active workout for user ${userId}`)
      return res.status(200).send(null)
    }

    LOG.info(`Found active workout ${workout.id}`)
    return res.status(200).send(workout)
  } catch (e) {
    LOG.error(`Could not get active workout: ${e}`)
    return res.status(400).send()
  }
}

const getWorkout = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        sets: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planExercise: {
              include: { exercise: true }
            }
          }
        }
      }
    })

    if (!workout) {
      LOG.info(`Workout ${id} not found`)
      return res.status(404).send()
    }

    if (workout.userId !== userId) {
      LOG.info(`User ${userId} not authorized to view workout ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Workouts sehen' })
    }

    LOG.info(`Fetched workout ${id}`)
    return res.status(200).send(workout)
  } catch (e) {
    LOG.error(`Could not get workout ${id}: ${e}`)
    return res.status(400).send()
  }
}

const createWorkout = async (req, res) => {
  const userId = req.session.user.id
  const { planId } = req.body

  try {
    // Check if user has an active workout
    const activeWorkout = await prisma.workout.findFirst({
      where: {
        userId,
        status: { in: ['IN_PROGRESS', 'PAUSED'] }
      }
    })

    if (activeWorkout) {
      LOG.info(`User ${userId} already has active workout ${activeWorkout.id}`)
      return res.status(400).send({ error: 'Du hast bereits ein aktives Workout. Beende es zuerst oder brich es ab.' })
    }

    // Get plan with exercises
    const plan = await prisma.trainingPlan.findUnique({
      where: { id: planId },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true }
        }
      }
    })

    if (!plan) {
      LOG.info(`Plan ${planId} not found`)
      return res.status(404).send({ error: 'Trainingsplan nicht gefunden' })
    }

    // Check ownership - users can only do workouts for their own plans
    if (plan.createdById !== userId && !plan.isSystem) {
      LOG.info(`User ${userId} not authorized to use plan ${planId}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Pläne oder System-Pläne verwenden' })
    }

    // Generate sets from plan exercises
    const setsData = []
    let sortOrder = 0

    for (const planExercise of plan.exercises) {
      for (let setNumber = 1; setNumber <= planExercise.sets; setNumber++) {
        setsData.push({
          planExerciseId: planExercise.id,
          setNumber,
          targetWeight: planExercise.targetWeight,
          targetMinReps: planExercise.minReps,
          targetMaxReps: planExercise.maxReps,
          restSeconds: planExercise.restSeconds,
          sortOrder: sortOrder++
        })
      }
    }

    // Create workout with sets
    const workout = await prisma.workout.create({
      data: {
        planId,
        userId,
        planName: plan.name,
        status: 'IN_PROGRESS',
        sets: {
          create: setsData
        }
      },
      include: {
        sets: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planExercise: {
              include: { exercise: true }
            }
          }
        }
      }
    })

    LOG.info(`Created workout ${workout.id} for user ${userId} from plan ${planId}`)
    return res.status(201).send(workout)
  } catch (e) {
    LOG.error(`Could not create workout: ${e}`)
    return res.status(400).send()
  }
}

const updateWorkoutStatus = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id
  const { action } = req.body

  try {
    const workout = await prisma.workout.findUnique({ where: { id } })

    if (!workout) {
      LOG.info(`Workout ${id} not found`)
      return res.status(404).send()
    }

    if (workout.userId !== userId) {
      LOG.info(`User ${userId} not authorized to update workout ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Workouts bearbeiten' })
    }

    let updateData = {}

    switch (action) {
      case 'pause':
        if (workout.status !== 'IN_PROGRESS') {
          return res.status(400).send({ error: 'Nur laufende Workouts können pausiert werden' })
        }
        updateData = {
          status: 'PAUSED',
          pausedAt: new Date()
        }
        break

      case 'resume': {
        if (workout.status !== 'PAUSED') {
          return res.status(400).send({ error: 'Nur pausierte Workouts können fortgesetzt werden' })
        }
        const pausedDuration = Date.now() - new Date(workout.pausedAt).getTime()
        updateData = {
          status: 'IN_PROGRESS',
          pausedAt: null,
          totalPausedMs: workout.totalPausedMs + pausedDuration
        }
        break
      }

      case 'complete': {
        if (!['IN_PROGRESS', 'PAUSED'].includes(workout.status)) {
          return res.status(400).send({ error: 'Workout kann nicht abgeschlossen werden' })
        }
        let finalPausedMs = workout.totalPausedMs
        if (workout.pausedAt) {
          finalPausedMs += Date.now() - new Date(workout.pausedAt).getTime()
        }
        updateData = {
          status: 'COMPLETED',
          completedAt: new Date(),
          pausedAt: null,
          totalPausedMs: finalPausedMs
        }
        break
      }

      case 'abandon': {
        if (!['IN_PROGRESS', 'PAUSED'].includes(workout.status)) {
          return res.status(400).send({ error: 'Workout kann nicht abgebrochen werden' })
        }
        let abandonPausedMs = workout.totalPausedMs
        if (workout.pausedAt) {
          abandonPausedMs += Date.now() - new Date(workout.pausedAt).getTime()
        }
        updateData = {
          status: 'ABANDONED',
          completedAt: new Date(),
          pausedAt: null,
          totalPausedMs: abandonPausedMs
        }
        break
      }

      default:
        return res.status(400).send({ error: 'Ungültige Aktion' })
    }

    const updated = await prisma.workout.update({
      where: { id },
      data: updateData,
      include: {
        sets: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planExercise: {
              include: { exercise: true }
            }
          }
        }
      }
    })

    LOG.info(`Updated workout ${id} status to ${updated.status}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update workout ${id}: ${e}`)
    return res.status(400).send()
  }
}

const updateSet = async (req, res) => {
  const { id, setId } = req.params
  const userId = req.session.user.id
  const { weight, reps } = req.body

  try {
    const workout = await prisma.workout.findUnique({ where: { id } })

    if (!workout) {
      LOG.info(`Workout ${id} not found`)
      return res.status(404).send()
    }

    if (workout.userId !== userId) {
      LOG.info(`User ${userId} not authorized to update workout ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Workouts bearbeiten' })
    }

    const set = await prisma.workoutSet.findFirst({
      where: { id: setId, workoutId: id }
    })

    if (!set) {
      LOG.info(`Set ${setId} not found in workout ${id}`)
      return res.status(404).send()
    }

    const updated = await prisma.workoutSet.update({
      where: { id: setId },
      data: { weight, reps },
      include: {
        planExercise: {
          include: { exercise: true }
        }
      }
    })

    LOG.info(`Updated set ${setId} in workout ${id}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update set ${setId}: ${e}`)
    return res.status(400).send()
  }
}

const completeSet = async (req, res) => {
  const { id, setId } = req.params
  const userId = req.session.user.id

  try {
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: { sets: { orderBy: { sortOrder: 'asc' } } }
    })

    if (!workout) {
      LOG.info(`Workout ${id} not found`)
      return res.status(404).send()
    }

    if (workout.userId !== userId) {
      LOG.info(`User ${userId} not authorized to update workout ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Workouts bearbeiten' })
    }

    const setIndex = workout.sets.findIndex(s => s.id === setId)
    if (setIndex === -1) {
      LOG.info(`Set ${setId} not found in workout ${id}`)
      return res.status(404).send()
    }

    const set = workout.sets[setIndex]
    if (set.completedAt) {
      LOG.info(`Set ${setId} already completed`)
      return res.status(400).send({ error: 'Satz wurde bereits abgeschlossen' })
    }

    const updated = await prisma.workoutSet.update({
      where: { id: setId },
      data: { completedAt: new Date() },
      include: {
        planExercise: {
          include: { exercise: true }
        }
      }
    })

    // Find next set
    const nextSet = workout.sets[setIndex + 1] || null

    LOG.info(`Completed set ${setId} in workout ${id}`)
    return res.status(200).send({
      set: updated,
      restSeconds: updated.restSeconds,
      nextSetId: nextSet?.id || null
    })
  } catch (e) {
    LOG.error(`Could not complete set ${setId}: ${e}`)
    return res.status(400).send()
  }
}

const deleteWorkout = async (req, res) => {
  const { id } = req.params
  const userId = req.session.user.id

  try {
    const workout = await prisma.workout.findUnique({ where: { id } })

    if (!workout) {
      LOG.info(`Workout ${id} not found`)
      return res.status(404).send()
    }

    if (workout.userId !== userId) {
      LOG.info(`User ${userId} not authorized to delete workout ${id}`)
      return res.status(403).send({ error: 'Du kannst nur eigene Workouts löschen' })
    }

    await prisma.workout.delete({ where: { id } })
    LOG.info(`Deleted workout ${id}`)
    return res.status(204).send()
  } catch (e) {
    LOG.error(`Could not delete workout ${id}: ${e}`)
    return res.status(400).send()
  }
}

module.exports = {
  getWorkouts,
  getActiveWorkout,
  getWorkout,
  createWorkout,
  updateWorkoutStatus,
  updateSet,
  completeSet,
  deleteWorkout,
  buildWorkoutWhere,
  buildWorkoutQuery
}
