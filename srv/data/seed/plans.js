const prisma = require('../prisma')

const systemPlans = [
  {
    name: 'Push',
    description: 'Push-Plan nach Vorgabe.',
    exercises: [
      {
        name: 'Schrägbankdrücken (Langhantel)',
        sets: 3,
        minReps: 12,
        maxReps: 15,
        restSeconds: 180,
        targetWeight: 59
      },
      {
        name: 'Butterfly (Maschine)',
        sets: 2,
        minReps: 8,
        maxReps: 12,
        restSeconds: 120,
        targetWeight: 75
      },
      {
        name: 'Hackenschmidt-Kniebeuge',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 100
      },
      {
        name: 'Beinstrecker (Maschine)',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 100
      },
      {
        name: 'Trizepsdrücken am Seil',
        sets: 3,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 35
      },
      {
        name: 'Seitheben (Maschine)',
        sets: 2,
        minReps: 12,
        maxReps: 15,
        restSeconds: 120,
        targetWeight: 25
      }
    ]
  },
  {
    name: 'Pull',
    description: 'Pull-Plan nach Vorgabe.',
    exercises: [
      {
        name: 'Latzug breit',
        sets: 2,
        minReps: 6,
        maxReps: 10,
        restSeconds: 180,
        targetWeight: 65
      },
      {
        name: 'Rudern eng (Kabel)',
        sets: 2,
        minReps: 6,
        maxReps: 10,
        restSeconds: 120,
        targetWeight: 70
      },
      {
        name: 'Rudern breit (Kabel)',
        sets: 1,
        minReps: 6,
        maxReps: 10,
        restSeconds: 180,
        targetWeight: 60
      },
      {
        name: 'Bizepsmaschine',
        sets: 3,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 45
      },
      {
        name: 'Crunchmaschine',
        sets: 2,
        minReps: 8,
        maxReps: 10,
        restSeconds: 120,
        targetWeight: 59
      },
      {
        name: 'Rumänisches Kreuzheben (Langhantel)',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 50
      },
      {
        name: 'Beinbeuger (Maschine)',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 45
      },
      {
        name: 'Reverse Butterfly (Maschine)',
        sets: 1,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 41
      }
    ]
  }
]

async function seedPlans () {
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

      const validExercises = []
      for (const [index, exerciseRecord] of exerciseRecords.entries()) {
        if (!exerciseRecord) continue
        const planExercise = planData.exercises[index]
        validExercises.push({
          exercise: exerciseRecord,
          sets: planExercise.sets,
          minReps: planExercise.minReps,
          maxReps: planExercise.maxReps,
          restSeconds: planExercise.restSeconds,
          targetWeight: planExercise.targetWeight
        })
      }

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
              maxReps: ex.maxReps,
              restSeconds: ex.restSeconds,
              targetWeight: ex.targetWeight
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
