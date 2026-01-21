const prisma = require('../prisma')

const systemExercises = [
  {
    name: 'Schrägbankdrücken (Langhantel)',
    description: '1. Lege die Hantel auf Schulterhöhe ab\n2. Senke die Stange kontrolliert zur oberen Brust\n3. Drücke die Stange explosiv nach oben\n4. Halte die Schulterblätter stabil',
    muscleGroups: ['CHEST', 'SHOULDERS', 'TRICEPS'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Butterfly (Maschine)',
    description: '1. Stelle die Sitzhöhe auf Brusthöhe ein\n2. Führe die Arme kontrolliert zusammen\n3. Halte kurz in der Endposition\n4. Führe langsam zurück',
    muscleGroups: ['CHEST'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Hackenschmidt-Kniebeuge',
    description: '1. Stelle die Füße schulterbreit auf die Plattform\n2. Senke kontrolliert bis die Oberschenkel parallel sind\n3. Drücke dich über die Fersen nach oben\n4. Halte den Rücken stabil',
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    category: 'COMPOUND',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Beinstrecker (Maschine)',
    description: '1. Stelle das Polster knapp über dem Fußgelenk ein\n2. Strecke die Knie kontrolliert nach oben\n3. Halte kurz in der Endposition\n4. Senke langsam ab',
    muscleGroups: ['QUADS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Trizepsdrücken am Seil',
    description: '1. Stelle dich stabil an den Kabelzug\n2. Drücke das Seil nach unten bis die Arme gestreckt sind\n3. Halte die Ellbogen eng am Körper\n4. Führe langsam zurück',
    muscleGroups: ['TRICEPS'],
    category: 'ISOLATION',
    equipment: 'CABLE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Seitheben (Maschine)',
    description: '1. Stelle den Sitz so ein, dass die Arme auf Schulterhöhe starten\n2. Hebe die Arme kontrolliert seitlich an\n3. Halte kurz oben\n4. Senke langsam ab',
    muscleGroups: ['SHOULDERS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Latzug breit',
    description: '1. Greife die Stange breit\n2. Ziehe die Stange kontrolliert zur oberen Brust\n3. Halte kurz unten\n4. Lasse langsam nach oben',
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Rudern eng (Kabel)',
    description: '1. Setze dich stabil an den Kabelzug\n2. Ziehe den Griff eng zum Bauch\n3. Halte kurz bei zusammengezogenen Schulterblättern\n4. Führe kontrolliert zurück',
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Rudern breit (Kabel)',
    description: '1. Greife den breiten Griff am Kabelzug\n2. Ziehe den Griff zur Brust\n3. Halte kurz in der Endposition\n4. Senke langsam ab',
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Bizepsmaschine',
    description: '1. Stelle den Sitz und die Ellenbogenpolster ein\n2. Beuge die Arme kontrolliert nach oben\n3. Halte kurz in der Endposition\n4. Senke langsam ab',
    muscleGroups: ['BICEPS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Crunchmaschine',
    description: '1. Stelle Sitz und Polster passend ein\n2. Rolle den Oberkörper kontrolliert ein\n3. Halte kurz unten\n4. Lasse langsam zurück',
    muscleGroups: ['ABS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Rumänisches Kreuzheben (Langhantel)',
    description: '1. Greife die Hantel schulterbreit\n2. Schiebe die Hüfte nach hinten\n3. Senke die Hantel bis knapp unter die Knie\n4. Richte dich kontrolliert auf',
    muscleGroups: ['HAMSTRINGS', 'GLUTES', 'BACK'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Beinbeuger (Maschine)',
    description: '1. Stelle Polster knapp über dem Sprunggelenk ein\n2. Beuge die Knie kontrolliert\n3. Halte kurz in der Endposition\n4. Senke langsam ab',
    muscleGroups: ['HAMSTRINGS'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 180,
    isSystem: true
  },
  {
    name: 'Reverse Butterfly (Maschine)',
    description: '1. Stelle den Sitz so ein, dass die Arme auf Schulterhöhe starten\n2. Führe die Arme nach hinten\n3. Halte kurz in der Endposition\n4. Führe kontrolliert zurück',
    muscleGroups: ['SHOULDERS', 'BACK'],
    category: 'ISOLATION',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  }
]

async function seedExercises () {
  try {
    console.log('Seeding exercises...')

    for (const exercise of systemExercises) {
      const existing = await prisma.exercise.findFirst({
        where: { name: exercise.name, isSystem: true }
      })

      if (!existing) {
        await prisma.exercise.create({ data: exercise })
        console.log(`Created: ${exercise.name}`)
      } else {
        await prisma.exercise.update({
          where: { id: existing.id },
          data: { recommendedRestSeconds: exercise.recommendedRestSeconds }
        })
        console.log(`Updated: ${exercise.name}`)
      }
    }

    console.log('Exercise seeding complete!')
  } catch (e) {
    console.log('Exercise tables not yet migrated, skipping seed')
  }
}

module.exports = { seedExercises, systemExercises }
