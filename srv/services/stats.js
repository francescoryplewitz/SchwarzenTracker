const prisma = require('../data/prisma')
const { getRequestLocale } = require('../common/locale')
const LOG = new Logger('STATS')

const RANGE_WEEKS = {
  '8w': 8,
  '12w': 12,
  '24w': 24
}

const MUSCLE_GROUPS = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'OBLIQUES',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES'
]

const CATEGORY_FACTORS = {
  COMPOUND: 1,
  ISOLATION: 0.85,
  CARDIO: 0.7,
  STRETCHING: 0.6
}

const MS_PER_DAY = 24 * 60 * 60 * 1000
const MS_PER_WEEK = 7 * MS_PER_DAY

const getRangeWeeks = (range) => {
  return RANGE_WEEKS[range] || RANGE_WEEKS['12w']
}

const toIsoDate = (date) => {
  return date.toISOString().slice(0, 10)
}

const getUtcWeekStart = (date) => {
  const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = utcDate.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  utcDate.setUTCDate(utcDate.getUTCDate() - offset)
  return utcDate
}

const buildWeekStarts = (weeks) => {
  const currentWeekStart = getUtcWeekStart(new Date())
  const weekStarts = []

  for (let index = weeks - 1; index >= 0; index--) {
    weekStarts.push(new Date(currentWeekStart.getTime() - (index * MS_PER_WEEK)))
  }

  return weekStarts
}

const getRangeStartDate = (weeks) => {
  return buildWeekStarts(weeks)[0]
}

const buildCompletedWorkoutWhere = (userId, startDate, planId, dayType) => {
  const where = {
    userId,
    status: 'COMPLETED',
    completedAt: {
      gte: startDate,
      not: null
    }
  }

  if (planId) {
    where.planId = planId
  }

  if (dayType) {
    where.dayType = dayType
  }

  return where
}

const applyExerciseTranslation = (exercise) => {
  const translation = exercise.translations[0]
  if (exercise.isSystem && translation) {
    exercise.name = translation.name
  }
  delete exercise.translations
}

const getE1rm = (weight, reps) => {
  return weight * (1 + (reps / 30))
}

const getMedian = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

const getCategoryFactor = (category) => {
  return CATEGORY_FACTORS[category] || 1
}

const isBetterSet = (candidate, current) => {
  if (candidate.weight > current.weight) return true
  if (candidate.weight === current.weight && candidate.reps > current.reps) return true
  return false
}

const getWorkoutsTrend = async (req, res) => {
  const userId = req.session.user.id
  const weeks = getRangeWeeks(req.query.range)
  const startDate = getRangeStartDate(weeks)

  try {
    const workouts = await prisma.workout.findMany({
      where: buildCompletedWorkoutWhere(userId, startDate),
      select: {
        completedAt: true
      }
    })

    const countsByWeek = new Map()
    for (const workout of workouts) {
      const weekStart = toIsoDate(getUtcWeekStart(new Date(workout.completedAt)))
      const count = countsByWeek.get(weekStart) || 0
      countsByWeek.set(weekStart, count + 1)
    }

    const points = buildWeekStarts(weeks).map((weekStart) => {
      const key = toIsoDate(weekStart)
      return {
        weekStart: key,
        completedWorkouts: countsByWeek.get(key) || 0
      }
    })

    return res.status(200).send({
      rangeWeeks: weeks,
      points
    })
  } catch (error) {
    LOG.error(`Could not load workouts trend: ${error}`)
    return res.status(400).send()
  }
}

const getExerciseTrend = async (req, res) => {
  const userId = req.session.user.id
  const locale = getRequestLocale(req)
  const weeks = getRangeWeeks(req.query.range)
  const startDate = getRangeStartDate(weeks)
  const { exerciseId, planId, dayType } = req.query

  try {
    const availableExercises = await prisma.exercise.findMany({
      where: {
        planExercises: {
          some: {
            workoutSets: {
              some: {
                completedAt: { not: null },
                workout: buildCompletedWorkoutWhere(userId, startDate, planId, dayType)
              }
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        isSystem: true,
        translations: {
          where: { locale },
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    for (const exercise of availableExercises) {
      applyExerciseTranslation(exercise)
    }

    if (availableExercises.length === 0) {
      return res.status(200).send({
        rangeWeeks: weeks,
        selectedExerciseId: null,
        availableExercises: [],
        points: []
      })
    }

    const selectedExerciseId = exerciseId && availableExercises.some(exercise => exercise.id === exerciseId)
      ? exerciseId
      : availableExercises[0].id

    const sets = await prisma.workoutSet.findMany({
      where: {
        completedAt: { not: null },
        workout: buildCompletedWorkoutWhere(userId, startDate, planId, dayType),
        planExercise: {
          exerciseId: selectedExerciseId
        }
      },
      select: {
        workoutId: true,
        weight: true,
        reps: true,
        workout: {
          select: {
            completedAt: true
          }
        }
      },
      orderBy: {
        workout: {
          completedAt: 'asc'
        }
      }
    })

    const topSetByWorkout = new Map()
    for (const set of sets) {
      if (set.weight === null || set.reps === null || set.weight <= 0 || set.reps <= 0) continue

      const current = topSetByWorkout.get(set.workoutId)
      const candidate = {
        date: toIsoDate(new Date(set.workout.completedAt)),
        topSetWeight: set.weight,
        topSetReps: set.reps,
        e1rm: getE1rm(set.weight, set.reps)
      }

      if (!current || isBetterSet(candidate, current)) {
        topSetByWorkout.set(set.workoutId, candidate)
      }
    }

    const points = [...topSetByWorkout.values()]
      .sort((left, right) => left.date.localeCompare(right.date))
      .map(point => ({
        ...point,
        e1rm: Number(point.e1rm.toFixed(2))
      }))

    return res.status(200).send({
      rangeWeeks: weeks,
      selectedExerciseId,
      availableExercises,
      points
    })
  } catch (error) {
    LOG.error(`Could not load exercise trend: ${error}`)
    return res.status(400).send()
  }
}

const getMuscleGroupTrend = async (req, res) => {
  const userId = req.session.user.id
  const weeks = getRangeWeeks(req.query.range)
  const startDate = getRangeStartDate(weeks)
  const muscleGroup = req.query.muscleGroup

  if (!MUSCLE_GROUPS.includes(muscleGroup)) {
    return res.status(400).send({ error: 'Ungültige Muskelgruppe' })
  }

  try {
    const sets = await prisma.workoutSet.findMany({
      where: {
        completedAt: { not: null },
        workout: buildCompletedWorkoutWhere(userId, startDate),
        planExercise: {
          exercise: {
            muscleGroups: {
              has: muscleGroup
            }
          }
        }
      },
      select: {
        workoutId: true,
        weight: true,
        reps: true,
        workout: {
          select: {
            completedAt: true
          }
        },
        planExercise: {
          select: {
            exerciseId: true,
            exercise: {
              select: {
                category: true
              }
            }
          }
        }
      },
      orderBy: {
        workout: {
          completedAt: 'asc'
        }
      }
    })

    const topSetByExerciseWorkout = new Map()

    for (const set of sets) {
      if (set.weight === null || set.reps === null || set.weight <= 0 || set.reps <= 0) continue

      const exerciseId = set.planExercise.exerciseId
      const workoutId = set.workoutId

      if (!topSetByExerciseWorkout.has(exerciseId)) {
        topSetByExerciseWorkout.set(exerciseId, new Map())
      }

      const topSetByWorkout = topSetByExerciseWorkout.get(exerciseId)
      const candidate = {
        weekStart: toIsoDate(getUtcWeekStart(new Date(set.workout.completedAt))),
        e1rm: getE1rm(set.weight, set.reps),
        factor: getCategoryFactor(set.planExercise.exercise.category),
        weight: set.weight,
        reps: set.reps,
        date: set.workout.completedAt
      }

      const current = topSetByWorkout.get(workoutId)
      if (!current || isBetterSet(candidate, current)) {
        topSetByWorkout.set(workoutId, candidate)
      }
    }

    const weekValuesMap = new Map()

    for (const topSetByWorkout of topSetByExerciseWorkout.values()) {
      const points = [...topSetByWorkout.values()].sort((left, right) => left.date - right.date)
      const baselineSource = points.slice(0, Math.min(points.length, 3)).map(point => point.e1rm)
      const baseline = getMedian(baselineSource)

      for (const point of points) {
        const indexValue = (point.e1rm / baseline) * 100
        const entry = weekValuesMap.get(point.weekStart) || { weightedSum: 0, factorSum: 0 }
        entry.weightedSum += indexValue * point.factor
        entry.factorSum += point.factor
        weekValuesMap.set(point.weekStart, entry)
      }
    }

    const points = buildWeekStarts(weeks).map((weekStart) => {
      const key = toIsoDate(weekStart)
      const weekValues = weekValuesMap.get(key)
      return {
        weekStart: key,
        muscleGroupIndex: weekValues
          ? Number((weekValues.weightedSum / weekValues.factorSum).toFixed(2))
          : null
      }
    })

    return res.status(200).send({
      rangeWeeks: weeks,
      muscleGroup,
      points
    })
  } catch (error) {
    LOG.error(`Could not load muscle group trend: ${error}`)
    return res.status(400).send()
  }
}

module.exports = {
  getWorkoutsTrend,
  getExerciseTrend,
  getMuscleGroupTrend
}
