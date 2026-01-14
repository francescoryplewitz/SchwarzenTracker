const prisma = require('../prisma')

const systemExercises = [
  // CHEST
  {
    name: 'Bankdrücken',
    description: '1. Lege dich flach auf die Bank\n2. Greife die Stange etwas breiter als schulterbreit\n3. Senke die Stange kontrolliert zur Brust\n4. Drücke explosiv nach oben',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Kurzhantel-Flys',
    description: '1. Lege dich flach auf die Bank mit Kurzhanteln\n2. Strecke die Arme nach oben\n3. Senke die Arme seitlich ab (leicht gebeugt)\n4. Führe die Arme wieder zusammen',
    muscleGroups: ['CHEST'],
    category: 'ISOLATION',
    equipment: 'DUMBBELL',
    recommendedRestSeconds: 60,
    isSystem: true
  },
  {
    name: 'Liegestütze',
    description: '1. Stütze dich auf Händen und Zehenspitzen ab\n2. Halte den Körper gerade\n3. Senke den Körper kontrolliert ab\n4. Drücke dich wieder hoch',
    muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
    category: 'COMPOUND',
    equipment: 'BODYWEIGHT',
    recommendedRestSeconds: 90,
    isSystem: true
  },

  // BACK
  {
    name: 'Kreuzheben',
    description: '1. Stehe schulterbreit vor der Stange\n2. Greife die Stange mit gestreckten Armen\n3. Hebe die Stange durch Strecken der Hüfte\n4. Halte den Rücken gerade',
    muscleGroups: ['BACK', 'HAMSTRINGS', 'GLUTES'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 150,
    isSystem: true
  },
  {
    name: 'Klimmzüge',
    description: '1. Greife die Stange etwas breiter als schulterbreit\n2. Hänge mit gestreckten Armen\n3. Ziehe dich hoch bis das Kinn über der Stange ist\n4. Senke dich kontrolliert ab',
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'BODYWEIGHT',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Rudern am Kabelzug',
    description: '1. Setze dich an die Maschine\n2. Greife den Griff\n3. Ziehe den Griff zum Bauch\n4. Drücke die Schulterblätter zusammen',
    muscleGroups: ['BACK', 'BICEPS'],
    category: 'COMPOUND',
    equipment: 'CABLE',
    recommendedRestSeconds: 90,
    isSystem: true
  },

  // SHOULDERS
  {
    name: 'Schulterdrücken',
    description: '1. Halte die Kurzhanteln auf Schulterhöhe\n2. Drücke die Gewichte nach oben\n3. Strecke die Arme vollständig\n4. Senke kontrolliert ab',
    muscleGroups: ['SHOULDERS', 'TRICEPS'],
    category: 'COMPOUND',
    equipment: 'DUMBBELL',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Seitheben',
    description: '1. Halte die Kurzhanteln seitlich am Körper\n2. Hebe die Arme seitlich bis auf Schulterhöhe\n3. Halte kurz\n4. Senke kontrolliert ab',
    muscleGroups: ['SHOULDERS'],
    category: 'ISOLATION',
    equipment: 'DUMBBELL',
    recommendedRestSeconds: 60,
    isSystem: true
  },

  // ARMS
  {
    name: 'Bizeps-Curls',
    description: '1. Halte die Kurzhanteln mit gestreckten Armen\n2. Beuge die Arme und hebe die Gewichte\n3. Halte die Ellbogen am Körper\n4. Senke kontrolliert ab',
    muscleGroups: ['BICEPS'],
    category: 'ISOLATION',
    equipment: 'DUMBBELL',
    recommendedRestSeconds: 60,
    isSystem: true
  },
  {
    name: 'Trizeps-Dips',
    description: '1. Stütze dich auf zwei Bänken oder Griffen ab\n2. Halte den Körper aufrecht\n3. Beuge die Arme und senke den Körper\n4. Drücke dich wieder hoch',
    muscleGroups: ['TRICEPS', 'CHEST'],
    category: 'COMPOUND',
    equipment: 'BODYWEIGHT',
    recommendedRestSeconds: 90,
    isSystem: true
  },

  // LEGS
  {
    name: 'Kniebeugen',
    description: '1. Stelle dich schulterbreit hin\n2. Lege die Stange auf den oberen Rücken\n3. Beuge die Knie bis die Oberschenkel parallel sind\n4. Drücke dich durch die Fersen hoch',
    muscleGroups: ['QUADS', 'HAMSTRINGS', 'GLUTES'],
    category: 'COMPOUND',
    equipment: 'BARBELL',
    recommendedRestSeconds: 150,
    isSystem: true
  },
  {
    name: 'Ausfallschritte',
    description: '1. Stehe aufrecht mit Kurzhanteln\n2. Mache einen großen Schritt nach vorne\n3. Senke das hintere Knie Richtung Boden\n4. Drücke dich zurück in die Ausgangsposition',
    muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
    category: 'COMPOUND',
    equipment: 'DUMBBELL',
    recommendedRestSeconds: 90,
    isSystem: true
  },
  {
    name: 'Beinpresse',
    description: '1. Setze dich in die Maschine\n2. Platziere die Füße schulterbreit\n3. Drücke das Gewicht nach oben\n4. Senke kontrolliert ab ohne die Knie zu überstrecken',
    muscleGroups: ['QUADS', 'GLUTES'],
    category: 'COMPOUND',
    equipment: 'MACHINE',
    recommendedRestSeconds: 120,
    isSystem: true
  },
  {
    name: 'Wadenheben',
    description: '1. Stehe auf einer Erhöhung mit den Fersen frei\n2. Senke die Fersen nach unten\n3. Drücke dich auf die Zehenspitzen\n4. Halte kurz und senke ab',
    muscleGroups: ['CALVES'],
    category: 'ISOLATION',
    equipment: 'BODYWEIGHT',
    recommendedRestSeconds: 45,
    isSystem: true
  },

  // CORE
  {
    name: 'Plank',
    description: '1. Stütze dich auf Unterarmen und Zehenspitzen ab\n2. Halte den Körper gerade wie ein Brett\n3. Spanne Bauch und Gesäß an\n4. Halte die Position',
    muscleGroups: ['ABS', 'OBLIQUES'],
    category: 'ISOLATION',
    equipment: 'BODYWEIGHT',
    recommendedRestSeconds: 60,
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
