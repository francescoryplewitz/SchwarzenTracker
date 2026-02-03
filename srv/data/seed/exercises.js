const prisma = require('../prisma')

const systemExercises = [
  {
    name: 'Incline barbell bench press',
    description: '1. Set the bar at shoulder height\n2. Lower the bar to the upper chest in a controlled motion\n3. Press the bar up explosively\n4. Keep your shoulder blades stable',
    translations: [
      {
        locale: 'de',
        name: 'Schrägbankdrücken (Langhantel)',
        description: '1. Lege die Hantel auf Schulterhöhe ab\n2. Senke die Stange kontrolliert zur oberen Brust\n3. Drücke die Stange explosiv nach oben\n4. Halte die Schulterblätter stabil'
      }
    ],
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Pec deck machine',
    description: '1. Adjust the seat so the handles are at chest height\n2. Bring the arms together in a controlled motion\n3. Hold briefly at the end position\n4. Return slowly',
    translations: [
      {
        locale: 'de',
        name: 'Butterfly (Maschine)',
        description: '1. Stelle die Sitzhöhe auf Brusthöhe ein\n2. Führe die Arme kontrolliert zusammen\n3. Halte kurz in der Endposition\n4. Führe langsam zurück'
      }
    ],
    muscleGroups: ['CHEST'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Hack squat',
    description: '1. Place your feet shoulder-width on the platform\n2. Lower in a controlled motion until the thighs are parallel\n3. Drive up through your heels\n4. Keep your back stable',
    translations: [
      {
        locale: 'de',
        name: 'Hackenschmidt-Kniebeuge',
        description: '1. Stelle die Füße schulterbreit auf die Plattform\n2. Senke kontrolliert bis die Oberschenkel parallel sind\n3. Drücke dich über die Fersen nach oben\n4. Halte den Rücken stabil'
      }
    ],
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    category: 'COMPOUND',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Leg extension machine',
    description: '1. Set the pad just above the ankle\n2. Extend the knees in a controlled motion\n3. Hold briefly at the top\n4. Lower slowly',
    translations: [
      {
        locale: 'de',
        name: 'Beinstrecker (Maschine)',
        description: '1. Stelle das Polster knapp über dem Fußgelenk ein\n2. Strecke die Knie kontrolliert nach oben\n3. Halte kurz in der Endposition\n4. Senke langsam ab'
      }
    ],
    muscleGroups: ['QUADS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Cable triceps pushdown',
    description: '1. Stand stable at the cable station\n2. Press the rope down until the arms are straight\n3. Keep the elbows close to your body\n4. Return slowly',
    translations: [
      {
        locale: 'de',
        name: 'Trizepsdrücken am Seil',
        description: '1. Stelle dich stabil an den Kabelzug\n2. Drücke das Seil nach unten bis die Arme gestreckt sind\n3. Halte die Ellbogen eng am Körper\n4. Führe langsam zurück'
      }
    ],
    muscleGroups: ['TRICEPS'],
    category: 'ISOLATION',
    equipment: 'CABLE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Machine lateral raise',
    description: '1. Adjust the seat so the arms start at shoulder height\n2. Raise the arms out to the side in a controlled motion\n3. Hold briefly at the top\n4. Lower slowly',
    translations: [
      {
        locale: 'de',
        name: 'Seitheben (Maschine)',
        description: '1. Stelle den Sitz so ein, dass die Arme auf Schulterhöhe starten\n2. Hebe die Arme kontrolliert seitlich an\n3. Halte kurz oben\n4. Senke langsam ab'
      }
    ],
    muscleGroups: ['SHOULDERS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Wide-grip lat pulldown',
    description: '1. Grab the bar wide\n2. Pull the bar to the upper chest in a controlled motion\n3. Hold briefly at the bottom\n4. Let it rise slowly',
    translations: [
      {
        locale: 'de',
        name: 'Latzug breit',
        description: '1. Greife die Stange breit\n2. Ziehe die Stange kontrolliert zur oberen Brust\n3. Halte kurz unten\n4. Lasse langsam nach oben'
      }
    ],
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Close-grip cable row',
    description: '1. Sit stable at the cable row\n2. Pull the handle close to your stomach\n3. Hold briefly with shoulder blades squeezed\n4. Return under control',
    translations: [
      {
        locale: 'de',
        name: 'Rudern eng (Kabel)',
        description: '1. Setze dich stabil an den Kabelzug\n2. Ziehe den Griff eng zum Bauch\n3. Halte kurz bei zusammengezogenen Schulterblättern\n4. Führe kontrolliert zurück'
      }
    ],
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Wide-grip cable row',
    description: '1. Grab the wide handle on the cable row\n2. Pull the handle to the chest\n3. Hold briefly at the end position\n4. Lower slowly',
    translations: [
      {
        locale: 'de',
        name: 'Rudern breit (Kabel)',
        description: '1. Greife den breiten Griff am Kabelzug\n2. Ziehe den Griff zur Brust\n3. Halte kurz in der Endposition\n4. Senke langsam ab'
      }
    ],
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Biceps curl machine',
    description: '1. Adjust the seat and elbow pads\n2. Curl the arms up in a controlled motion\n3. Hold briefly at the top\n4. Lower slowly',
    translations: [
      {
        locale: 'de',
        name: 'Bizepsmaschine',
        description: '1. Stelle den Sitz und die Ellenbogenpolster ein\n2. Beuge die Arme kontrolliert nach oben\n3. Halte kurz in der Endposition\n4. Senke langsam ab'
      }
    ],
    muscleGroups: ['BICEPS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Ab crunch machine',
    description: '1. Adjust the seat and pads\n2. Curl the upper body forward in a controlled motion\n3. Hold briefly at the bottom\n4. Return slowly',
    translations: [
      {
        locale: 'de',
        name: 'Crunchmaschine',
        description: '1. Stelle Sitz und Polster passend ein\n2. Rolle den Oberkörper kontrolliert ein\n3. Halte kurz unten\n4. Lasse langsam zurück'
      }
    ],
    muscleGroups: ['ABS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Romanian deadlift (barbell)',
    description: '1. Grip the bar about shoulder width\n2. Push the hips back\n3. Lower the bar to just below the knees\n4. Return to standing under control',
    translations: [
      {
        locale: 'de',
        name: 'Rumänisches Kreuzheben (Langhantel)',
        description: '1. Greife die Hantel schulterbreit\n2. Schiebe die Hüfte nach hinten\n3. Senke die Hantel bis knapp unter die Knie\n4. Richte dich kontrolliert auf'
      }
    ],
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Leg curl machine',
    description: '1. Adjust the pad just above the ankle\n2. Curl the knees in a controlled motion\n3. Hold briefly at the top\n4. Lower slowly',
    translations: [
      {
        locale: 'de',
        name: 'Beinbeuger (Maschine)',
        description: '1. Stelle Polster knapp über dem Sprunggelenk ein\n2. Beuge die Knie kontrolliert\n3. Halte kurz in der Endposition\n4. Senke langsam ab'
      }
    ],
    muscleGroups: ['HAMSTRINGS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Reverse pec deck machine',
    description: '1. Adjust the seat so the arms start at shoulder height\n2. Move the arms back in a controlled motion\n3. Hold briefly at the end position\n4. Return under control',
    translations: [
      {
        locale: 'de',
        name: 'Reverse Butterfly (Maschine)',
        description: '1. Stelle den Sitz so ein, dass die Arme auf Schulterhöhe starten\n2. Führe die Arme nach hinten\n3. Halte kurz in der Endposition\n4. Führe kontrolliert zurück'
      }
    ],
    muscleGroups: ['SHOULDERS', 'BACK'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  }
]

const findExistingExercise = async (exercise) => {
  const names = [exercise.name, ...exercise.translations.map(translation => translation.name)]
  return prisma.exercise.findFirst({
    where: {
      isSystem: true,
      OR: names.map(name => ({ name }))
    }
  })
}

const upsertExerciseTranslations = async (exerciseId, translations) => {
  await Promise.all(
    translations.map(translation =>
      prisma.exerciseTranslation.upsert({
        where: { exerciseId_locale: { exerciseId, locale: translation.locale } },
        update: {
          name: translation.name,
          description: translation.description
        },
        create: {
          exerciseId,
          locale: translation.locale,
          name: translation.name,
          description: translation.description
        }
      })
    )
  )
}

async function seedExercises () {
  try {
    console.log('Seeding exercises...')

    for (const exercise of systemExercises) {
      const existing = await findExistingExercise(exercise)
      const { translations, ...exerciseData } = exercise

      if (!existing) {
        const created = await prisma.exercise.create({
          data: {
            ...exerciseData,
            translations: { create: translations }
          }
        })
        console.log(`Created: ${created.name}`)
      } else {
        const updated = await prisma.exercise.update({
          where: { id: existing.id },
          data: exerciseData
        })
        await upsertExerciseTranslations(existing.id, translations)
        console.log(`Updated: ${updated.name}`)
      }
    }

    console.log('Exercise seeding complete!')
  } catch (e) {
    console.log('Exercise tables not yet migrated, skipping seed')
  }
}

module.exports = { seedExercises, systemExercises }
