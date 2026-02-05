const prisma = require('../srv/data/prisma')

const buildPlanSetsData = (sets, minReps, maxReps, targetWeight) => {
  const planSets = []

  for (let i = 1; i <= sets; i += 1) {
    planSets.push({
      setNumber: i,
      targetWeight,
      targetMinReps: minReps,
      targetMaxReps: maxReps
    })
  }

  return planSets
}

const backfillPlanSets = async () => {
  const planExercises = await prisma.planExercise.findMany({
    select: {
      id: true,
      sets: true,
      minReps: true,
      maxReps: true,
      targetWeight: true
    }
  })

  for (const planExercise of planExercises) {
    const planSets = buildPlanSetsData(
      planExercise.sets,
      planExercise.minReps,
      planExercise.maxReps,
      planExercise.targetWeight
    )

    await prisma.$transaction([
      prisma.planExerciseSet.deleteMany({ where: { planExerciseId: planExercise.id } }),
      prisma.planExerciseSet.createMany({
        data: planSets.map(planSet => ({
          ...planSet,
          planExerciseId: planExercise.id
        }))
      })
    ])
  }
}

const run = async () => {
  try {
    await backfillPlanSets()
    console.log('PlanExerciseSet backfill completed')
  } catch (e) {
    console.error('PlanExerciseSet backfill failed', e)
  } finally {
    await prisma.$disconnect()
  }
}

run()
