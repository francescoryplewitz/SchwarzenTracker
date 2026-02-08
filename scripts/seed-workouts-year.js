const prisma = require('../srv/data/prisma')

const parseArgs = () => {
  const args = process.argv.slice(2)
  const parsed = {
    userId: null,
    rangeWeeks: 52,
    replace: false,
    pushPlanId: '',
    pullPlanId: ''
  }

  for (const arg of args) {
    if (arg.startsWith('--userId=')) {
      parsed.userId = Number(arg.replace('--userId=', ''))
      continue
    }

    if (arg.startsWith('--rangeWeeks=')) {
      parsed.rangeWeeks = Number(arg.replace('--rangeWeeks=', ''))
      continue
    }

    if (arg === '--replace') {
      parsed.replace = true
      continue
    }

    if (arg.startsWith('--pushPlanId=')) {
      parsed.pushPlanId = arg.replace('--pushPlanId=', '')
      continue
    }

    if (arg.startsWith('--pullPlanId=')) {
      parsed.pullPlanId = arg.replace('--pullPlanId=', '')
    }
  }

  return parsed
}

const toSeed = (value) => {
  let hash = 0
  const text = `${value}`

  for (let index = 0; index < text.length; index++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index)
    hash |= 0
  }

  return Math.abs(hash) + 1
}

const createRng = (seedValue) => {
  let seed = seedValue
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }
}

const roundToStep = (value, step) => {
  return Math.round(value / step) * step
}

const clamp = (value, min, max) => {
  if (value < min) return min
  if (value > max) return max
  return value
}

const getStartOfWeek = (date) => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = start.getUTCDay()
  const offset = day === 0 ? 6 : day - 1
  start.setUTCDate(start.getUTCDate() - offset)
  return start
}

const getStartDate = (rangeWeeks) => {
  const weekStart = getStartOfWeek(new Date())
  return new Date(weekStart.getTime() - ((rangeWeeks - 1) * 7 * 24 * 60 * 60 * 1000))
}

const buildWorkoutDates = (startDate, rng) => {
  const dates = []
  const today = new Date()
  const endDate = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  const dayTargets = [1, 2, 4, 5]

  for (let cursor = new Date(startDate); cursor <= endDate; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
    const day = cursor.getUTCDay()
    if (!dayTargets.includes(day)) continue

    const skipChance = day === 5 ? 0.22 : 0.12
    if (rng() < skipChance) continue

    const hour = day === 5 ? 16 : 18
    const minute = day === 5 ? 15 : 30
    const date = new Date(Date.UTC(
      cursor.getUTCFullYear(),
      cursor.getUTCMonth(),
      cursor.getUTCDate(),
      hour,
      minute,
      0,
      0
    ))

    dates.push(date)
  }

  return dates
}

const buildFallbackPlanSets = (planExercise) => {
  const planSets = []
  for (let setNumber = 1; setNumber <= planExercise.sets; setNumber++) {
    planSets.push({
      setNumber,
      targetWeight: planExercise.targetWeight,
      targetMinReps: planExercise.minReps,
      targetMaxReps: planExercise.maxReps
    })
  }
  return planSets
}

const getPlanExercises = (plan) => {
  return plan.exercises.map(planExercise => {
    const planSets = planExercise.planSets.length
      ? planExercise.planSets
      : buildFallbackPlanSets(planExercise)

    return {
      ...planExercise,
      planSets
    }
  })
}

const getProgressStep = (baseWeight) => {
  if (baseWeight >= 100) return 1.5
  if (baseWeight >= 70) return 1.25
  if (baseWeight >= 40) return 1
  return 0.5
}

const buildPlanState = (plan) => {
  const state = new Map()

  for (const planExercise of getPlanExercises(plan)) {
    const firstSet = planExercise.planSets[0]
    const baseWeight = firstSet.targetWeight || planExercise.targetWeight || 20

    state.set(planExercise.id, {
      baseWeight,
      progressStep: getProgressStep(baseWeight)
    })
  }

  return state
}

const getSetValues = (config, planSet, sessionIndex, setIndex, rng) => {
  const targetMinReps = planSet.targetMinReps
  const targetMaxReps = planSet.targetMaxReps
  const cycle = sessionIndex % 4
  const cycleOffset = [1, 0, -1, -1][cycle]
  const fatigueOffset = Math.floor(setIndex / 2)
  const reps = clamp(targetMaxReps + cycleOffset - fatigueOffset, targetMinReps, targetMaxReps)

  const progressionBlocks = Math.floor(sessionIndex / 3)
  const overload = cycle === 0 && setIndex === 0 ? config.progressStep : 0
  const noise = rng() > 0.8 ? 0.5 : 0
  const weightRaw = config.baseWeight + (progressionBlocks * config.progressStep) + overload + noise
  const weight = roundToStep(weightRaw, 0.5)

  return {
    weight,
    reps
  }
}

const buildWorkoutSets = (plan, planState, sessionIndex, startedAt, completedAt, rng) => {
  const setsData = []
  const planExercises = getPlanExercises(plan)
  let sortOrder = 0

  const activeDuration = completedAt.getTime() - startedAt.getTime()
  const totalSetCount = planExercises.reduce((sum, planExercise) => sum + planExercise.planSets.length, 0)

  for (const planExercise of planExercises) {
    const config = planState.get(planExercise.id)

    for (let setIndex = 0; setIndex < planExercise.planSets.length; setIndex++) {
      const planSet = planExercise.planSets[setIndex]
      const values = getSetValues(config, planSet, sessionIndex, setIndex, rng)
      const progress = (sortOrder + 1) / (totalSetCount + 1)
      const setCompletedAt = new Date(startedAt.getTime() + (progress * activeDuration))

      setsData.push({
        planExerciseId: planExercise.id,
        setNumber: planSet.setNumber,
        weight: values.weight,
        reps: values.reps,
        targetWeight: planSet.targetWeight,
        targetMinReps: planSet.targetMinReps,
        targetMaxReps: planSet.targetMaxReps,
        restSeconds: planExercise.restSeconds || 90,
        completedAt: setCompletedAt,
        sortOrder
      })

      sortOrder += 1
    }
  }

  return setsData
}

const findPlanById = async (userId, planId) => {
  return prisma.trainingPlan.findFirst({
    where: {
      createdById: userId,
      id: planId
    },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' },
        include: {
          planSets: {
            orderBy: { setNumber: 'asc' }
          }
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  })
}

const findUserId = async (inputUserId) => {
  if (inputUserId) return inputUserId

  const user = await prisma.user.findFirst({
    where: { isActive: true },
    orderBy: { id: 'asc' },
    select: { id: true }
  })

  return user?.id || null
}

const replaceExistingWorkouts = async (userId, planIds, startDate) => {
  await prisma.workoutSet.deleteMany({
    where: {
      workout: {
        userId,
        planId: { in: planIds },
        completedAt: { gte: startDate }
      }
    }
  })

  await prisma.workout.deleteMany({
    where: {
      userId,
      planId: { in: planIds },
      completedAt: { gte: startDate }
    }
  })
}

const refreshProgressSets = async (userId, planExerciseIds) => {
  await prisma.planExerciseProgressSet.deleteMany({
    where: {
      userId,
      planExerciseId: { in: planExerciseIds }
    }
  })

  const sets = await prisma.workoutSet.findMany({
    where: {
      workout: {
        userId,
        status: 'COMPLETED'
      },
      planExerciseId: { in: planExerciseIds },
      completedAt: { not: null },
      reps: { not: null }
    },
    include: {
      workout: {
        select: {
          id: true,
          completedAt: true
        }
      }
    },
    orderBy: [
      { workout: { completedAt: 'desc' } },
      { planExerciseId: 'asc' },
      { setNumber: 'asc' }
    ]
  })

  const selectedWorkoutByExercise = new Map()
  const progressSets = []

  for (const set of sets) {
    const selectedWorkoutId = selectedWorkoutByExercise.get(set.planExerciseId)
    if (!selectedWorkoutId) {
      selectedWorkoutByExercise.set(set.planExerciseId, set.workoutId)
    }

    if (selectedWorkoutByExercise.get(set.planExerciseId) !== set.workoutId) {
      continue
    }

    progressSets.push({
      userId,
      planExerciseId: set.planExerciseId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    })
  }

  if (progressSets.length) {
    await prisma.planExerciseProgressSet.createMany({ data: progressSets })
  }
}

const seedYearWorkouts = async (config) => {
  const userId = await findUserId(config.userId)
  if (!userId) {
    throw new Error('Kein aktiver User gefunden. Nutze --userId=<id>.')
  }

  if (!config.pushPlanId || !config.pullPlanId) {
    throw new Error('Bitte nutze --pushPlanId=<id> und --pullPlanId=<id>.')
  }

  const pushPlan = await findPlanById(userId, config.pushPlanId)
  const pullPlan = await findPlanById(userId, config.pullPlanId)

  if (!pushPlan || !pullPlan) {
    throw new Error('Push/Pull Plan nicht gefunden oder gehört nicht zum User. Prüfe die Plan-IDs.')
  }

  const startDate = getStartDate(config.rangeWeeks)
  const rng = createRng(toSeed(`${userId}-${pushPlan.id}-${pullPlan.id}`))
  const workoutDates = buildWorkoutDates(startDate, rng)

  if (config.replace) {
    await replaceExistingWorkouts(userId, [pushPlan.id, pullPlan.id], startDate)
  }

  const pushState = buildPlanState(pushPlan)
  const pullState = buildPlanState(pullPlan)

  let generatedPush = 0
  let generatedPull = 0

  for (let index = 0; index < workoutDates.length; index++) {
    const date = workoutDates[index]
    const usePush = index % 2 === 0
    const plan = usePush ? pushPlan : pullPlan
    const planState = usePush ? pushState : pullState
    const sessionIndex = usePush ? generatedPush : generatedPull

    const durationMinutes = 52 + Math.floor(rng() * 28)
    const pausedMinutes = 3 + Math.floor(rng() * 8)

    const startedAt = new Date(date.getTime())
    const completedAt = new Date(startedAt.getTime() + (durationMinutes * 60 * 1000))

    const setsData = buildWorkoutSets(plan, planState, sessionIndex, startedAt, completedAt, rng)

    await prisma.workout.create({
      data: {
        planId: plan.id,
        userId,
        planName: plan.name,
        status: 'COMPLETED',
        startedAt,
        completedAt,
        totalPausedMs: pausedMinutes * 60 * 1000,
        sets: {
          create: setsData
        }
      }
    })

    if (usePush) {
      generatedPush += 1
    } else {
      generatedPull += 1
    }
  }

  const allPlanExerciseIds = [
    ...pushPlan.exercises.map(planExercise => planExercise.id),
    ...pullPlan.exercises.map(planExercise => planExercise.id)
  ]

  await refreshProgressSets(userId, allPlanExerciseIds)

  return {
    userId,
    pushPlanName: pushPlan.name,
    pullPlanName: pullPlan.name,
    generatedPush,
    generatedPull,
    generatedTotal: generatedPush + generatedPull,
    startDate
  }
}

const run = async () => {
  const config = parseArgs()

  try {
    const result = await seedYearWorkouts(config)

    console.log('Workout Seed abgeschlossen')
    console.log(`User: ${result.userId}`)
    console.log(`Push Plan: ${result.pushPlanName}`)
    console.log(`Pull Plan: ${result.pullPlanName}`)
    console.log(`Startdatum: ${result.startDate.toISOString().slice(0, 10)}`)
    console.log(`Generiert: ${result.generatedTotal} Workouts (${result.generatedPush} Push / ${result.generatedPull} Pull)`)
    if (!config.replace) {
      console.log('Hinweis: Ohne --replace werden bestehende Daten nicht entfernt.')
    }
  } catch (error) {
    console.error('Workout Seed fehlgeschlagen', error)
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

run()


