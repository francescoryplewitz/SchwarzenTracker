const prisma = require('../srv/data/prisma')

const collectProgressSets = (sets) => {
  const selectedWorkoutByKey = new Map()
  const progressSets = []
  const targetMap = new Map()

  for (const set of sets) {
    const key = `${set.workout.userId}:${set.planExerciseId}`
    const selectedWorkoutId = selectedWorkoutByKey.get(key)

    if (!selectedWorkoutId) {
      selectedWorkoutByKey.set(key, set.workoutId)
    }

    if (selectedWorkoutByKey.get(key) !== set.workoutId) {
      continue
    }

    progressSets.push({
      userId: set.workout.userId,
      planExerciseId: set.planExerciseId,
      setNumber: set.setNumber,
      weight: set.weight,
      reps: set.reps
    })

    if (!targetMap.has(set.workout.userId)) {
      targetMap.set(set.workout.userId, new Set())
    }
    targetMap.get(set.workout.userId).add(set.planExerciseId)
  }

  return { progressSets, targetMap }
}

const backfillProgressSets = async () => {
  const sets = await prisma.workoutSet.findMany({
    where: {
      completedAt: { not: null },
      reps: { not: null },
      workout: { status: 'COMPLETED' }
    },
    include: {
      workout: {
        select: {
          id: true,
          userId: true,
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

  const { progressSets, targetMap } = collectProgressSets(sets)

  for (const [userId, planExerciseIds] of targetMap.entries()) {
    await prisma.planExerciseProgressSet.deleteMany({
      where: {
        userId,
        planExerciseId: { in: Array.from(planExerciseIds) }
      }
    })
  }

  if (progressSets.length > 0) {
    await prisma.planExerciseProgressSet.createMany({ data: progressSets })
  }
}

const run = async () => {
  try {
    await backfillProgressSets()
    console.log('PlanExerciseProgressSet backfill completed')
  } catch (e) {
    console.error('PlanExerciseProgressSet backfill failed', e)
  } finally {
    await prisma.$disconnect()
  }
}

run()
