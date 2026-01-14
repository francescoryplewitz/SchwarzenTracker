const prisma = require('../srv/data/prisma')
const fs = require('fs')
const path = require('path')
const { seedExercises } = require('../srv/data/seed/exercises')
const { seedPlans } = require('../srv/data/seed/plans')
const { seedWorkouts } = require('../srv/data/seed/workouts')

const loadStructureData = () => {
  const dir = path.resolve(__dirname, '../srv/data/structuredata')
  const files = fs.readdirSync(dir)
  return files.reduce((acc, file) => {
    if (!file.endsWith('.json')) return acc
    const data = fs.readFileSync(path.join(dir, file))
    const key = file.replace('.json', '')
    acc[key] = JSON.parse(data.toString())
    return acc
  }, {})
}

const resetEntities = async () => {
  console.log('Deleting existing data...')
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
  console.log('Data deleted.')
}

const upsertStructureData = async (data) => {
  console.log('Upserting structure data (users)...')
  for (const [key, values] of Object.entries(data)) {
    for (const value of values) {
      await prisma[key].upsert({
        where: { id: value.id },
        update: value,
        create: value
      })
    }
  }
  console.log('Structure data done.')
}

const seed = async () => {
  console.log('Starting database seed...\n')

  await resetEntities()

  const structureData = loadStructureData()
  await upsertStructureData(structureData)

  console.log('\nSeeding exercises...')
  await seedExercises()

  console.log('\nSeeding plans...')
  await seedPlans()

  console.log('\nSeeding workouts...')
  await seedWorkouts()

  console.log('\nSeed complete!')
  await prisma.$disconnect()
}

seed().catch(async (e) => {
  console.error('Seed failed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
