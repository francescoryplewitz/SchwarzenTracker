// Exercise fixtures for frontend tests

export const singleExercise = {
  id: 'ex-1',
  name: 'Bankdrücken',
  description: 'Flach auf der Bank liegend, Langhantel von der Brust nach oben drücken.',
  muscleGroups: ['CHEST', 'TRICEPS', 'SHOULDERS'],
  category: 'COMPOUND',
  equipment: 'BARBELL',
  videoUrl: 'https://example.com/video.mp4',
  isSystem: false,
  isFavorite: true,
  forkedFromId: null,
  variants: [
    {
      id: 'var-1',
      title: 'Enge Griffweite',
      description: 'Mit engerem Griff für mehr Trizeps-Aktivierung.',
      equipment: 'BARBELL'
    },
    {
      id: 'var-2',
      title: 'Weite Griffweite',
      description: 'Mit weiterem Griff für mehr Brust-Aktivierung.',
      equipment: 'BARBELL'
    }
  ],
  _count: {
    variants: 2
  }
}

export const systemExercise = {
  id: 'ex-sys-1',
  name: 'Kniebeugen',
  description: 'Die Grundübung für Beine.',
  muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
  category: 'COMPOUND',
  equipment: 'BARBELL',
  videoUrl: null,
  isSystem: true,
  isFavorite: false,
  forkedFromId: null,
  variants: [],
  _count: {
    variants: 0
  }
}

export const exerciseWithoutVariants = {
  id: 'ex-2',
  name: 'Bizeps Curls',
  description: 'Isolation für den Bizeps.',
  muscleGroups: ['BICEPS'],
  category: 'ISOLATION',
  equipment: 'DUMBBELL',
  videoUrl: null,
  isSystem: false,
  isFavorite: false,
  forkedFromId: null,
  variants: [],
  _count: {
    variants: 0
  }
}

export const generateExerciseList = (count = 30) => {
  const muscleGroups = ['CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADS', 'GLUTES', 'ABS']
  const categories = ['COMPOUND', 'ISOLATION', 'CARDIO']
  const equipments = ['BARBELL', 'DUMBBELL', 'MACHINE', 'CABLE', 'BODYWEIGHT']
  const names = [
    'Bankdrücken', 'Kniebeugen', 'Kreuzheben', 'Schulterdrücken', 'Rudern',
    'Klimmzüge', 'Dips', 'Bizeps Curls', 'Trizeps Pushdowns', 'Beinpresse',
    'Wadenheben', 'Planks', 'Sit-Ups', 'Lunges', 'Bulgarian Split Squats',
    'Face Pulls', 'Lateral Raises', 'Front Raises', 'Hammer Curls', 'Skull Crushers',
    'Cable Flyes', 'Leg Curls', 'Leg Extensions', 'Hip Thrusts', 'Calf Raises',
    'Shrugs', 'Reverse Flyes', 'Preacher Curls', 'Close Grip Bench', 'Incline Bench'
  ]

  return Array.from({ length: count }, (_, i) => ({
    id: `ex-${i + 1}`,
    name: names[i % names.length],
    description: `Beschreibung für ${names[i % names.length]}`,
    muscleGroups: [muscleGroups[i % muscleGroups.length], muscleGroups[(i + 1) % muscleGroups.length]],
    category: categories[i % categories.length],
    equipment: equipments[i % equipments.length],
    videoUrl: i % 3 === 0 ? 'https://example.com/video.mp4' : null,
    isSystem: i % 4 === 0,
    isFavorite: i % 5 === 0,
    forkedFromId: null,
    _count: {
      variants: i % 3
    }
  }))
}

export const exerciseList = generateExerciseList(30)
export const exerciseListSmall = generateExerciseList(15)
export const emptyExerciseList = []

export const createdExercise = {
  id: 'ex-new-1',
  name: 'Neue Übung',
  description: 'Eine neu erstellte Übung.',
  muscleGroups: ['CHEST'],
  category: 'COMPOUND',
  equipment: 'BARBELL',
  videoUrl: null,
  isSystem: false,
  isFavorite: false,
  forkedFromId: null,
  variants: [],
  _count: {
    variants: 0
  }
}

export const updatedExercise = {
  ...singleExercise,
  name: 'Aktualisierte Übung',
  description: 'Eine aktualisierte Beschreibung.'
}

export const createdVariant = {
  id: 'var-new-1',
  title: 'Neue Variante',
  description: 'Eine neu erstellte Variante.',
  equipment: 'DUMBBELL'
}

export const forkedExercise = {
  id: 'ex-forked-1',
  name: 'Kniebeugen (Kopie)',
  description: 'Die Grundübung für Beine.',
  muscleGroups: ['QUADS', 'GLUTES', 'HAMSTRINGS'],
  category: 'COMPOUND',
  equipment: 'BARBELL',
  videoUrl: null,
  isSystem: false,
  isFavorite: false,
  forkedFromId: 'ex-sys-1',
  variants: [],
  _count: {
    variants: 0
  }
}
