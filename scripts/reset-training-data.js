const prisma = require('../srv/data/prisma')

const resetTrainingData = async () => {
  try {
    console.log('Deleting training data...')
    await prisma.$transaction([
      prisma.workoutSet.deleteMany(),
      prisma.workout.deleteMany(),
      prisma.planExercise.deleteMany(),
      prisma.userPlanFavorite.deleteMany(),
      prisma.trainingPlan.deleteMany(),
      prisma.userExerciseFavorite.deleteMany(),
      prisma.exerciseImage.deleteMany(),
      prisma.exerciseVariant.deleteMany(),
      prisma.exercise.deleteMany()
    ])
    console.log('Training data deleted.')
  } catch (e) {
    console.log('Tables not yet migrated, skipping reset')
  } finally {
    await prisma.$disconnect()
  }
}

resetTrainingData()
