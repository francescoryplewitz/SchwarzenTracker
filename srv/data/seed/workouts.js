const prisma = require('../prisma')

async function seedWorkouts () {
  try {
    console.log('Seeding workouts...')

    // Get admin user (userId 2)
    const adminUser = await prisma.user.findFirst({
      where: { id: 2 }
    })

    if (!adminUser) {
      console.log('Admin user not found, skipping workout seed')
      return
    }

    // Get a system plan with exercises
    const pushPlan = await prisma.trainingPlan.findFirst({
      where: { name: 'Push Day', isSystem: true },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true }
        }
      }
    })

    if (!pushPlan || pushPlan.exercises.length === 0) {
      console.log('Push Day plan not found or has no exercises, skipping workout seed')
      return
    }

    // Check if we already have seed workouts
    const existingWorkout = await prisma.workout.findFirst({
      where: { userId: adminUser.id, planName: 'Push Day' }
    })

    if (existingWorkout) {
      console.log('Workouts already seeded, skipping')
      return
    }

    // Create completed workout 1 (3 days ago)
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    threeDaysAgo.setHours(10, 0, 0, 0)

    const completedAt1 = new Date(threeDaysAgo)
    completedAt1.setMinutes(completedAt1.getMinutes() + 52)

    const workout1 = await prisma.workout.create({
      data: {
        planId: pushPlan.id,
        userId: adminUser.id,
        planName: pushPlan.name,
        status: 'COMPLETED',
        startedAt: threeDaysAgo,
        completedAt: completedAt1,
        totalPausedMs: 0,
        sets: {
          create: generateSetsData(pushPlan.exercises, true)
        }
      }
    })
    console.log(`Created completed workout: ${workout1.id}`)

    // Create completed workout 2 (1 day ago)
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    oneDayAgo.setHours(18, 30, 0, 0)

    const completedAt2 = new Date(oneDayAgo)
    completedAt2.setMinutes(completedAt2.getMinutes() + 48)

    const workout2 = await prisma.workout.create({
      data: {
        planId: pushPlan.id,
        userId: adminUser.id,
        planName: pushPlan.name,
        status: 'COMPLETED',
        startedAt: oneDayAgo,
        completedAt: completedAt2,
        totalPausedMs: 120000, // 2 min pause
        sets: {
          create: generateSetsData(pushPlan.exercises, true)
        }
      }
    })
    console.log(`Created completed workout: ${workout2.id}`)

    // Get Pull Day plan for abandoned workout
    const pullPlan = await prisma.trainingPlan.findFirst({
      where: { name: 'Pull Day', isSystem: true },
      include: {
        exercises: {
          orderBy: { sortOrder: 'asc' },
          include: { exercise: true }
        }
      }
    })

    if (pullPlan && pullPlan.exercises.length > 0) {
      // Create abandoned workout (5 days ago)
      const fiveDaysAgo = new Date()
      fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5)
      fiveDaysAgo.setHours(7, 0, 0, 0)

      const abandonedAt = new Date(fiveDaysAgo)
      abandonedAt.setMinutes(abandonedAt.getMinutes() + 15)

      const workout3 = await prisma.workout.create({
        data: {
          planId: pullPlan.id,
          userId: adminUser.id,
          planName: pullPlan.name,
          status: 'ABANDONED',
          startedAt: fiveDaysAgo,
          completedAt: abandonedAt,
          totalPausedMs: 0,
          sets: {
            create: generateSetsData(pullPlan.exercises, false, 3) // Only first 3 sets done
          }
        }
      })
      console.log(`Created abandoned workout: ${workout3.id}`)
    }

    console.log('Workout seeding complete!')
  } catch (e) {
    console.log('Workout tables not yet migrated, skipping seed:', e.message)
  }
}

function generateSetsData (planExercises, allCompleted, completedCount = -1) {
  const sets = []
  let sortOrder = 0
  let completed = 0

  for (const planExercise of planExercises) {
    for (let setNumber = 1; setNumber <= planExercise.sets; setNumber++) {
      const shouldComplete = allCompleted || (completedCount > 0 && completed < completedCount)
      const setData = {
        planExerciseId: planExercise.id,
        setNumber,
        targetWeight: planExercise.targetWeight,
        targetMinReps: planExercise.minReps,
        targetMaxReps: planExercise.maxReps,
        restSeconds: planExercise.restSeconds || 90,
        sortOrder: sortOrder++
      }

      if (shouldComplete) {
        // Add realistic weight and reps
        setData.weight = getRealisticWeight(planExercise.exercise.name, setNumber)
        setData.reps = getRealisticReps(planExercise.minReps, planExercise.maxReps, setNumber)
        setData.completedAt = new Date()
        completed++
      }

      sets.push(setData)
    }
  }

  return sets
}

function getRealisticWeight (exerciseName, setNumber) {
  const baseWeights = {
    Bankdrücken: 70,
    'Kurzhantel-Flys': 14,
    Schulterdrücken: 20,
    Seitheben: 8,
    'Trizeps-Dips': 0, // Bodyweight
    Klimmzüge: 0,
    Kreuzheben: 100,
    'Rudern am Kabelzug': 50,
    'Bizeps-Curls': 12,
    Kniebeugen: 80,
    Ausfallschritte: 16,
    Beinpresse: 120,
    Wadenheben: 0
  }

  const base = baseWeights[exerciseName] || 20
  // Slightly decrease weight on later sets
  return base - (setNumber - 1) * 2.5
}

function getRealisticReps (minReps, maxReps, setNumber) {
  // First set usually gets more reps, later sets fewer
  const range = maxReps - minReps
  const decrease = Math.min(setNumber - 1, range)
  return maxReps - decrease
}

module.exports = { seedWorkouts }
