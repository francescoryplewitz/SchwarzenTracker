const prisma = require('../data/prisma')
const LOG = new Logger('WORKOUTS')
const { getRequestLocale } = require('../common/locale')

const applyExerciseTranslations = (exercise) => {
  const translation = exercise.translations[0]
  if (exercise.isSystem && translation) {
    exercise.name = translation.name
    exercise.description = translation.description
  }
  delete exercise.translations

  const note = exercise.exerciseNotes[0]?.note
  exercise.userNote = note || null
  delete exercise.exerciseNotes
}

const applyWorkoutTranslations = (workout) => {
  for (const set of workout.sets) {
    applyExerciseTranslations(set.planExercise.exercise)
  }
}

const buildPreviousMaxes = (sets) => {
  const maxes = new Map()

  for (const set of sets) {
    if (!maxes.has(set.planExerciseId)) {
      maxes.set(set.planExerciseId, { maxWeight: null, maxReps: null })
    }
    const entry = maxes.get(set.planExerciseId)
    if (set.weight !== null && (entry.maxWeight === null || set.weight > entry.maxWeight)) {
      entry.maxWeight = set.weight
    }
    if (set.reps !== null && (entry.maxReps === null || set.reps > entry.maxReps)) {
      entry.maxReps = set.reps
    }
  }

  return maxes
}

const buildCurrentMaxes = (sets) => {
  const maxes = new Map()

  for (const set of sets) {
    if (!set.completedAt) continue
    if (!maxes.has(set.planExerciseId)) {
      maxes.set(set.planExerciseId, {
        maxWeight: null,
        maxReps: null,
        exerciseId: set.planExercise.exercise.id,
        exerciseName: set.planExercise.exercise.name
      })
    }
    const entry = maxes.get(set.planExerciseId)
    if (set.weight !== null && (entry.maxWeight === null || set.weight > entry.maxWeight)) {
      entry.maxWeight = set.weight
    }
    if (set.reps !== null && (entry.maxReps === null || set.reps > entry.maxReps)) {
      entry.maxReps = set.reps
    }
  }

  return maxes
}

const buildPersonalRecords = (currentSets, previousSets) => {
  const previousMaxes = buildPreviousMaxes(previousSets)
  const currentMaxes = buildCurrentMaxes(currentSets)
  const records = []

  for (const [planExerciseId, current] of currentMaxes.entries()) {
    const previous = previousMaxes.get(planExerciseId)
    if (!previous) continue

    const weightDelta = current.maxWeight !== null && previous.maxWeight !== null
      ? current.maxWeight - previous.maxWeight
      : null
    const repsDelta = current.maxReps !== null && previous.maxReps !== null
      ? current.maxReps - previous.maxReps
      : null

    if (weightDelta > 0) {
      records.push({
        planExerciseId,
        exerciseId: current.exerciseId,
        exerciseName: current.exerciseName,
        type: 'WEIGHT',
        delta: weightDelta,
        currentValue: current.maxWeight,
        previousValue: previous.maxWeight
      })
      continue
    }

    if (repsDelta > 0) {
      records.push({
        planExerciseId,
        exerciseId: current.exerciseId,
        exerciseName: current.exerciseName,
        type: 'REPS',
        delta: repsDelta,
        currentValue: current.maxReps,
        previousValue: previous.maxReps
      })
    }
  }

  return records
}

const getPersonalRecords = async (db, workout) => {
  if (workout.status !== 'COMPLETED') return []

  const previousWorkout = await db.workout.findFirst({
    where: {
      userId: workout.userId,
      planId: workout.planId,
      status: 'COMPLETED',
      completedAt: { not: null, lt: workout.completedAt },
      id: { not: workout.id }
    },
    orderBy: { completedAt: 'desc' }
  })

  if (!previousWorkout) return []

  const previousSets = await db.workoutSet.findMany({
    where: {
      workoutId: previousWorkout.id,
      completedAt: { not: null }
    },
    select: {
      planExerciseId: true,
      weight: true,
      reps: true
    }
  })

  return buildPersonalRecords(workout.sets, previousSets)
}

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
  const locale = getRequestLocale(req)

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
              include: {
                exercise: {
                  include: {
                    translations: {
                      where: { locale },
                      select: { name: true, description: true }
                    },
                    exerciseNotes: {
                      where: { userId },
                      select: { note: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!workout) {
      LOG.info(`No active workout for user ${userId}`)
      return res.status(200).send(null)
    }

    applyWorkoutTranslations(workout)
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
  const locale = getRequestLocale(req)

  try {
    const workout = await prisma.workout.findUnique({
      where: { id },
      include: {
        sets: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planExercise: {
              include: {
                exercise: {
                  include: {
                    translations: {
                      where: { locale },
                      select: { name: true, description: true }
                    },
                    exerciseNotes: {
                      where: { userId },
                      select: { note: true }
                    }
                  }
                }
              }
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

    applyWorkoutTranslations(workout)
    workout.personalRecords = await getPersonalRecords(prisma, workout)
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
  const locale = getRequestLocale(req)

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
        translations: {
          where: { locale },
          select: { name: true, description: true }
        },
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: {
            planSets: {
              orderBy: { setNumber: 'asc' }
            },
            progressSets: {
              where: { userId },
              orderBy: { setNumber: 'asc' }
            },
            exercise: {
              include: {
                translations: {
                  where: { locale },
                  select: { name: true, description: true }
                }
              }
            }
          }
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
      const progressMap = {}
      for (const progressSet of planExercise.progressSets) {
        progressMap[progressSet.setNumber] = progressSet
      }

      for (const planSet of planExercise.planSets) {
        const progressSet = progressMap[planSet.setNumber]
        setsData.push({
          planExerciseId: planExercise.id,
          setNumber: planSet.setNumber,
          targetWeight: planSet.targetWeight,
          targetMinReps: planSet.targetMinReps,
          targetMaxReps: planSet.targetMaxReps,
          weight: progressSet ? progressSet.weight : null,
          reps: progressSet ? progressSet.reps : null,
          restSeconds: planExercise.restSeconds || planExercise.exercise.recommendedRestSeconds || 90,
          sortOrder: sortOrder++
        })
      }
    }

    // Create workout with sets
    const planTranslation = plan.translations[0]
    const planName = plan.isSystem && planTranslation ? planTranslation.name : plan.name

    const workout = await prisma.workout.create({
      data: {
        planId,
        userId,
        planName,
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
              include: {
                exercise: {
                  include: {
                    translations: {
                      where: { locale },
                      select: { name: true, description: true }
                    },
                    exerciseNotes: {
                      where: { userId },
                      select: { note: true }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    applyWorkoutTranslations(workout)
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
  const { action, forceComplete } = req.body
  const locale = getRequestLocale(req)

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
        if (!forceComplete) {
          const missingSets = await prisma.workoutSet.count({
            where: {
              workoutId: id,
              completedAt: null
            }
          })
          if (missingSets > 0) {
            return res.status(409).send({ error: 'Nicht alle Sätze sind abgeschlossen. Möchtest Du trotzdem beenden?' })
          }
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

    const updated = action === 'complete'
      ? await prisma.$transaction(async (tx) => {
        if (forceComplete) {
          await tx.workoutSet.updateMany({
            where: {
              workoutId: id,
              completedAt: null
            },
            data: {
              reps: 0
            }
          })
        }
        const updatedWorkout = await tx.workout.update({
          where: { id },
          data: updateData,
          include: {
            sets: {
              orderBy: { sortOrder: 'asc' },
              include: {
                planExercise: {
                  include: {
                    exercise: {
                      include: {
                        translations: {
                          where: { locale },
                          select: { name: true, description: true }
                        },
                        exerciseNotes: {
                          where: { userId },
                          select: { note: true }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        })

        const completedSets = await tx.workoutSet.findMany({
          where: {
            workoutId: id,
            completedAt: { not: null },
            reps: { not: null }
          },
          orderBy: [
            { planExerciseId: 'asc' },
            { setNumber: 'asc' }
          ]
        })

        const planExerciseIds = []
        const progressSetsData = []
        let currentPlanExerciseId = null
        let currentSetNumber = 0

        for (const set of completedSets) {
          if (set.planExerciseId !== currentPlanExerciseId) {
            currentPlanExerciseId = set.planExerciseId
            currentSetNumber = 0
            planExerciseIds.push(currentPlanExerciseId)
          }

          currentSetNumber += 1
          progressSetsData.push({
            userId,
            planExerciseId: currentPlanExerciseId,
            setNumber: currentSetNumber,
            weight: set.weight,
            reps: set.reps
          })
        }

        if (planExerciseIds.length > 0) {
          await tx.planExerciseProgressSet.deleteMany({
            where: {
              userId,
              planExerciseId: { in: planExerciseIds }
            }
          })
        }

        if (progressSetsData.length > 0) {
          await tx.planExerciseProgressSet.createMany({ data: progressSetsData })
        }

        return updatedWorkout
      })
      : await prisma.workout.update({
        where: { id },
        data: updateData,
        include: {
          sets: {
            orderBy: { sortOrder: 'asc' },
            include: {
              planExercise: {
                include: {
                  exercise: {
                    include: {
                      translations: {
                        where: { locale },
                        select: { name: true, description: true }
                      },
                      exerciseNotes: {
                        where: { userId },
                        select: { note: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })

    applyWorkoutTranslations(updated)
    updated.personalRecords = await getPersonalRecords(prisma, updated)
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
  const locale = getRequestLocale(req)

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
          include: {
            exercise: {
              include: {
                translations: {
                  where: { locale },
                  select: { name: true, description: true }
                },
                exerciseNotes: {
                  where: { userId },
                  select: { note: true }
                }
              }
            }
          }
        }
      }
    })

    applyExerciseTranslations(updated.planExercise.exercise)
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
  const locale = getRequestLocale(req)

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
          include: {
            exercise: {
              include: {
                translations: {
                  where: { locale },
                  select: { name: true, description: true }
                },
                exerciseNotes: {
                  where: { userId },
                  select: { note: true }
                }
              }
            }
          }
        }
      }
    })

    applyExerciseTranslations(updated.planExercise.exercise)

    // Find next set
    const nextSet = workout.sets[setIndex + 1] || null

    LOG.info(`Completed set ${setId} in workout ${id}`)
    return res.status(200).send({
      set: updated,
      restSeconds: updated.restSeconds || updated.planExercise?.exercise?.recommendedRestSeconds || 90,
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
