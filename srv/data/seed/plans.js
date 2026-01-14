const prisma = require('../prisma')

const systemPlans = [
  {
    name: 'Ganzkörper Anfänger',
    description: 'Perfekt für den Einstieg ins Krafttraining. 3x pro Woche.',
    exercises: [
      { name: 'Kniebeugen', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Bankdrücken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Rudern am Kabelzug', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Kreuzheben', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Bizeps-Curls', sets: 2, minReps: 10, maxReps: 15 }
    ]
  },
  {
    name: 'Push Day',
    description: 'Brust, Schultern, Trizeps. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Bankdrücken', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Kurzhantel-Flys', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Seitheben', sets: 3, minReps: 12, maxReps: 15 },
      { name: 'Trizeps-Dips', sets: 3, minReps: 8, maxReps: 12 }
    ]
  },
  {
    name: 'Pull Day',
    description: 'Rücken, Bizeps. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Klimmzüge', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Rudern am Kabelzug', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Kreuzheben', sets: 3, minReps: 6, maxReps: 10 },
      { name: 'Bizeps-Curls', sets: 3, minReps: 10, maxReps: 12 }
    ]
  },
  {
    name: 'Leg Day',
    description: 'Beine und Gesäß. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Kniebeugen', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Kreuzheben', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Beinpresse', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Ausfallschritte', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Wadenheben', sets: 4, minReps: 12, maxReps: 15 }
    ]
  },
  {
    name: 'Upper Body',
    description: 'Kompletter Oberkörper. Für Upper/Lower Split.',
    exercises: [
      { name: 'Bankdrücken', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Rudern am Kabelzug', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Klimmzüge', sets: 3, minReps: 6, maxReps: 10 },
      { name: 'Bizeps-Curls', sets: 2, minReps: 10, maxReps: 12 },
      { name: 'Trizeps-Dips', sets: 2, minReps: 10, maxReps: 12 }
    ]
  },
  {
    name: 'Lower Body',
    description: 'Kompletter Unterkörper. Für Upper/Lower Split.',
    exercises: [
      { name: 'Kniebeugen', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Kreuzheben', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Ausfallschritte', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Beinpresse', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Wadenheben', sets: 4, minReps: 12, maxReps: 15 }
    ]
  }
]

async function seedPlans() {
  try {
    console.log('Seeding training plans...')

    for (const planData of systemPlans) {
      const existing = await prisma.trainingPlan.findFirst({
        where: { name: planData.name, isSystem: true }
      })

      if (existing) {
        console.log(`Skipped (exists): ${planData.name}`)
        continue
      }

      const exerciseRecords = await Promise.all(
        planData.exercises.map(ex =>
          prisma.exercise.findFirst({ where: { name: ex.name, isSystem: true } })
        )
      )

      const validExercises = planData.exercises
        .map((ex, i) => ({ ...ex, exercise: exerciseRecords[i] }))
        .filter(ex => ex.exercise)

      if (validExercises.length === 0) {
        console.log(`Skipped (no exercises found): ${planData.name}`)
        continue
      }

      await prisma.trainingPlan.create({
        data: {
          name: planData.name,
          description: planData.description,
          isSystem: true,
          exercises: {
            create: validExercises.map((ex, index) => ({
              exerciseId: ex.exercise.id,
              sortOrder: index,
              sets: ex.sets,
              minReps: ex.minReps,
              maxReps: ex.maxReps
            }))
          }
        }
      })
      console.log(`Created: ${planData.name}`)
    }

    console.log('Training plans seeding complete!')
  } catch (e) {
    console.log('TrainingPlan tables not yet migrated, skipping seed')
  }
}

module.exports = { seedPlans, systemPlans }
