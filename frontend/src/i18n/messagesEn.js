export default {
  locale: {
    en: 'English',
    de: 'German'
  },
  nav: {
    dashboard: 'Dashboard',
    exercises: 'Exercises',
    plans: 'Plans',
    workouts: 'Workouts',
    user: 'User'
  },
  common: {
    add: 'Add',
    apply: 'Apply',
    back: 'Back',
    cancel: 'Cancel',
    close: 'Close',
    confirm: 'Confirm',
    delete: 'Delete',
    done: 'Done',
    edit: 'Edit',
    loading: 'Loading...',
    save: 'Save',
    search: 'Search',
    skip: 'Skip',
    update: 'Update'
  },
  validation: {
    valueBetween: 'Value must be between {min} and {max}.',
    decimalFormat: 'Numbers must be in the format 1000.00.',
    yearFormat: 'Years must be in the format 2023.',
    dateFormat: 'Required format: 12.12.2000',
    integerFormat: 'Whole numbers must be in the format 1000 (no decimals).',
    zipFormat: 'ZIP codes must be in the format 12345.',
    phoneFormat: 'Phone numbers must be in the format +49 171 2323234.'
  },
  units: {
    kg: 'kg',
    reps: 'Reps',
    sets: 'Sets',
    minutesShort: 'min',
    secondsShort: 'sec'
  },
  dates: {
    today: 'Today',
    yesterday: 'Yesterday',
    daysAgo: '{count} days ago'
  },
  muscleGroups: {
    CHEST: 'Chest',
    BACK: 'Back',
    SHOULDERS: 'Shoulders',
    BICEPS: 'Biceps',
    TRICEPS: 'Triceps',
    FOREARMS: 'Forearms',
    ABS: 'Abs',
    OBLIQUES: 'Obliques',
    QUADS: 'Quads',
    HAMSTRINGS: 'Hamstrings',
    GLUTES: 'Glutes',
    CALVES: 'Calves'
  },
  equipment: {
    BARBELL: 'Barbell',
    DUMBBELL: 'Dumbbell',
    MACHINE: 'Machine',
    CABLE: 'Cable',
    BODYWEIGHT: 'Bodyweight',
    KETTLEBELL: 'Kettlebell',
    BAND: 'Resistance band',
    OTHER: 'Other'
  },
  categories: {
    COMPOUND: 'Compound',
    ISOLATION: 'Isolation',
    CARDIO: 'Cardio',
    STRETCHING: 'Stretching'
  },
  workoutStatus: {
    COMPLETED: 'Completed',
    ABANDONED: 'Abandoned',
    IN_PROGRESS: 'Active',
    PAUSED: 'Paused'
  },
  header: {
    logout: 'Log out'
  },
  login: {
    title: 'Welcome back',
    subtitle: 'Your personal fitness tracker',
    info: 'Manage your exercises, create training plans, and track your workouts — all in one place.',
    action: 'Log in'
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Your training overview',
    comingSoon: 'Coming soon',
    comingSoonText: 'Your training stats will appear here soon.',
    actions: {
      startWorkout: 'Start workout',
      startWorkoutDesc: 'Start your training',
      plans: 'Training plans',
      plansDesc: 'Manage plans',
      exercises: 'Exercises',
      exercisesDesc: 'Browse the exercise catalog'
    }
  },
  exercises: {
    title: 'Exercises',
    subtitle: 'Your exercise library',
    create: 'Create new exercise',
    favoritesAdd: 'Mark as favorite',
    favoritesRemove: 'Remove favorite',
    searchPlaceholder: 'Search exercises...',
    loading: 'Loading exercises...',
    empty: 'No exercises found',
    loadMore: 'Load more',
    loadingMore: 'Loading...',
    filters: 'Filters',
    favorites: 'Favorites',
    own: 'Own',
    form: {
      titleCreate: 'Create exercise',
      titleEdit: 'Edit exercise',
      nameLabel: 'Name *',
      namePlaceholder: 'Exercise name',
      descriptionLabel: 'Description / execution',
      descriptionPlaceholder: 'Describe how to perform the exercise...',
      muscleGroupsLabel: 'Muscle groups',
      categoryLabel: 'Category *',
      equipmentLabel: 'Equipment',
      videoLabel: 'Video URL (optional)',
      videoPlaceholder: 'https://...',
      restLabel: 'Recommended rest time (seconds)',
      restPlaceholder: 'e.g. 90',
      cancel: 'Cancel',
      save: 'Save',
      close: 'Close'
    },
    filter: {
      title: 'Filter exercises',
      muscleGroup: 'Muscle group',
      equipment: 'Equipment',
      category: 'Category',
      onlyFavorites: 'Only favorites',
      onlyOwn: 'Only my exercises',
      apply: 'Apply',
      reset: 'Reset'
    },
    variants: {
      singular: 'Variant',
      plural: 'Variants'
    },
    detail: {
      rest: 'Rest',
      execution: 'Execution',
      noDescription: 'No description available.',
      trainedMuscles: 'Trained muscle groups',
      video: 'Video',
      fork: 'Fork',
      forkCopy: 'Create own copy',
      addVariant: 'Add variant',
      variantsTab: 'Variant',
      defaultVariant: 'Default',
      system: 'System exercise',
      own: 'Custom exercise',
      forked: '(forked)',
      deleteTitle: 'Delete exercise',
      deleteMessage: 'Do you really want to delete "{name}"?'
    },
    variantDialog: {
      title: 'Create variant',
      nameLabel: 'Variant name *',
      namePlaceholder: 'e.g. Narrow grip',
      nameError: 'Please enter a name',
      descriptionLabel: 'Description / execution',
      descriptionPlaceholder: 'Describe how to perform this variant...',
      equipmentLabel: 'Equipment',
      cancel: 'Cancel',
      save: 'Save'
    }
  },
  plans: {
    title: 'Plans',
    subtitle: 'Your training plans',
    librarySubtitle: 'Templates to copy',
    mySubtitle: 'Your personal plans',
    tabs: {
      library: 'Library',
      myPlans: 'My plans'
    },
    favorites: 'Favorites',
    favoritesAdd: 'Mark as favorite',
    favoritesRemove: 'Remove favorite',
    system: 'SYSTEM',
    exerciseSingular: 'Exercise',
    exercisePlural: 'Exercises',
    create: 'Create new plan',
    createFirst: 'Create your first plan',
    loading: 'Loading plans...',
    myLoading: 'Loading your plans...',
    empty: 'No plans found',
    emptyFavorites: 'No favorites found',
    emptyOwn: 'You do not have any plans yet',
    libraryLoading: 'Loading library...',
    libraryEmpty: 'No templates found',
    loadMore: 'Load more',
    loadingMore: 'Loading...',
    searchPlaceholder: 'Search plans...',
    estimatedDuration: 'Estimated duration:',
    trainedMuscles: 'Trained muscle groups',
    dayType: {
      label: 'Training day',
      both: 'Both days',
      a: 'Day A',
      b: 'Day B'
    },
    muscleGroups: {
      arms: 'Arms',
      core: 'Core',
      legs: 'Legs'
    },
    muscleView: {
      front: 'Front',
      back: 'Back'
    },
    filter: {
      title: 'Filter plans',
      onlyFavorites: 'Only favorites',
      onlyOwn: 'Only my plans',
      onlySystem: 'Only system plans',
      apply: 'Apply',
      reset: 'Reset'
    },
    form: {
      titleCreate: 'Create plan',
      titleEdit: 'Edit plan',
      nameLabel: 'Name *',
      namePlaceholder: 'Plan name',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Describe the plan...',
      cancel: 'Cancel',
      save: 'Save'
    },
    exercisePicker: {
      title: 'Add exercise',
      searchPlaceholder: 'Search exercises...',
      setsLabel: 'Sets',
      minRepsLabel: 'Min reps',
      maxRepsLabel: 'Max reps',
      targetWeightLabel: 'Target weight',
      restLabel: 'Rest (sec)',
      optional: 'Optional',
      add: 'Add'
    },
    exerciseItem: {
      rest: 'Rest',
      setsLabel: 'Sets',
      minRepsLabel: 'Min reps',
      maxRepsLabel: 'Max reps',
      targetWeightLabel: 'Target weight',
      restLabel: 'Rest (sec)',
      notesLabel: 'Notes',
      notesPlaceholder: 'Notes...',
      update: 'Update',
      remove: 'Remove'
    },
    detail: {
      copy: 'Copy plan',
      loading: 'Loading plan...',
      notFound: 'Plan not found',
      system: 'System plan',
      own: 'Custom plan',
      exercisesTitle: 'Exercises ({count})',
      emptyExercises: 'No exercises added yet',
      deleteTitle: 'Delete plan',
      deleteMessage: 'Do you really want to delete "{name}"?',
      removeExerciseTitle: 'Remove exercise',
      removeExerciseMessage: 'Do you really want to remove "{name}" from the plan?'
    }
  },
  workouts: {
    title: 'Workouts',
    subtitle: 'Your training history',
    filters: {
      all: 'All',
      completed: 'Completed',
      abandoned: 'Abandoned'
    },
    loading: 'Loading workouts...',
    empty: 'No workouts found',
    loadMore: 'Load more',
    loadingMore: 'Loading...',
    start: 'Start workout',
    pause: 'Pause',
    resume: 'Resume',
    abandon: 'Abandon',
    finish: 'Finish',
    notFound: 'Workout not found',
    backToList: 'Back to overview',
    pauseLabel: 'PAUSED',
    rest: 'REST',
    restSkip: 'Skip',
    summary: {
      duration: 'Duration',
      sets: 'Sets',
      personalRecords: 'Personal records',
      volume: 'Volume (kg)',
      exercises: 'Exercises',
      noSets: 'No sets completed',
      completedTitle: 'Workout completed!',
      abandonedTitle: 'Workout abandoned',
      personalRecordsTitle: 'Personal records',
      personalRecordWeight: 'PR: +{value} {unit}',
      personalRecordReps: 'PR: +{value} reps'
    },
    abandonDialog: {
      title: 'Abandon workout?',
      text: 'Your progress will be saved, but the workout will be marked as abandoned.',
      cancel: 'Back',
      confirm: 'Abandon'
    },
    finishWarning: {
      title: 'Finish workout anyway?',
      text: 'Not all sets are completed. If you finish anyway, the missing sets will be saved with 0 reps.',
      missingTitle: 'Missing sets',
      setLabel: 'Set {number}',
      cancel: 'Back',
      confirm: 'Finish anyway'
    },
    setItem: {
      weight: 'Weight',
      reps: 'Reps',
      repetitions: 'Repetitions',
      target: 'Target'
    },
    pickers: {
      weight: 'Weight',
      number: 'Reps'
    },
    planPicker: {
      subtitle: 'Choose a training plan',
      empty: 'You do not have any training plans yet',
      error: 'Failed to load plans',
      dayTypeTitle: 'Which day do you want to train?',
      lastDayType: 'Last: Day {dayType} on {date}',
      noLastDayType: 'No completed workout for this plan yet'
    },
    notes: {
      label: 'Note',
      add: 'Add note',
      edit: 'Edit note',
      title: 'Exercise note',
      placeholder: 'Write your note...',
      saving: 'Saving...',
      saved: 'Saved',
      error: 'Could not save note',
      done: 'Done'
    }
  },
  errors: {
    notFoundTitle: 'Page not found',
    notFoundText: 'The page you are looking for does not exist.',
    goHome: 'Go home'
  },
  dev: {
    title: 'Developer Mode',
    subtitle: 'Configure authentication for local development',
    identity: 'Identity',
    permissions: 'Permissions',
    activeSession: 'Active session',
    saving: 'Saving...',
    autosave: 'Auto-save',
    noEmail: 'No email',
    userId: 'User ID',
    roles: 'Roles',
    noRoles: 'No roles assigned',
    rolesAdmin: 'Admin',
    rolesAdminDesc: 'Full access to the system',
    rolesUser: 'User',
    rolesUserDesc: 'Standard user access',
    unknownUser: 'Unknown',
    userLabel: 'User {id}',
    apply: 'Apply'
  },
  start: {
    subtitle: 'Project base for new applications',
    gettingStarted: 'Getting Started',
    gettingStartedText: 'This is your starter template for new Express.js + Vue projects. Fork this repository and start developing.',
    development: 'Development',
    devDesc: 'Local auth configuration',
    stackTitle: 'Tech Stack'
  }
}
