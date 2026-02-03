const prisma = require('../prisma')

const systemPlans = [
  {
    name: 'Push',
    description: 'Push plan template.',
    translations: [
      {
        locale: 'de',
        name: 'Push',
        description: 'Push-Plan nach Vorgabe.'
      }
    ],
    exercises: [
      {
        name: 'Incline barbell bench press',
        sets: 3,
        minReps: 12,
        maxReps: 15,
        restSeconds: 180,
        targetWeight: 59
      },
      {
        name: 'Pec deck machine',
        sets: 2,
        minReps: 8,
        maxReps: 12,
        restSeconds: 120,
        targetWeight: 75
      },
      {
        name: 'Hack squat',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 100
      },
      {
        name: 'Leg extension machine',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 100
      },
      {
        name: 'Cable triceps pushdown',
        sets: 3,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 35
      },
      {
        name: 'Machine lateral raise',
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
    description: 'Pull plan template.',
    translations: [
      {
        locale: 'de',
        name: 'Pull',
        description: 'Pull-Plan nach Vorgabe.'
      }
    ],
    exercises: [
      {
        name: 'Wide-grip lat pulldown',
        sets: 2,
        minReps: 6,
        maxReps: 10,
        restSeconds: 180,
        targetWeight: 65
      },
      {
        name: 'Close-grip cable row',
        sets: 2,
        minReps: 6,
        maxReps: 10,
        restSeconds: 120,
        targetWeight: 70
      },
      {
        name: 'Wide-grip cable row',
        sets: 1,
        minReps: 6,
        maxReps: 10,
        restSeconds: 180,
        targetWeight: 60
      },
      {
        name: 'Biceps curl machine',
        sets: 3,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 45
      },
      {
        name: 'Ab crunch machine',
        sets: 2,
        minReps: 8,
        maxReps: 10,
        restSeconds: 120,
        targetWeight: 59
      },
      {
        name: 'Romanian deadlift (barbell)',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 50
      },
      {
        name: 'Leg curl machine',
        sets: 2,
        minReps: 6,
        maxReps: 8,
        restSeconds: 180,
        targetWeight: 45
      },
      {
        name: 'Reverse pec deck machine',
        sets: 1,
        minReps: 6,
        maxReps: 8,
        restSeconds: 120,
        targetWeight: 41
      }
    ]
  }
]

const upsertPlanTranslations = async (planId, translations) => {
  await Promise.all(
    translations.map(translation =>
      prisma.trainingPlanTranslation.upsert({
        where: { trainingPlanId_locale: { trainingPlanId: planId, locale: translation.locale } },
        update: {
          name: translation.name,
          description: translation.description
        },
        create: {
          trainingPlanId: planId,
          locale: translation.locale,
          name: translation.name,
          description: translation.description
        }
      })
    )
  )
}

async function seedPlans () {
  try {
    console.log('Seeding training plans...')

    for (const planData of systemPlans) {
      const existing = await prisma.trainingPlan.findFirst({
        where: { name: planData.name, isSystem: true }
      })

      if (existing) {
        const updated = await prisma.trainingPlan.update({
          where: { id: existing.id },
          data: {
            name: planData.name,
            description: planData.description
          }
        })
        await upsertPlanTranslations(existing.id, planData.translations)
        console.log(`Updated: ${updated.name}`)
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
          translations: { create: planData.translations },
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
