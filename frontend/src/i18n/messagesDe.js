export default {
  locale: {
    en: 'Englisch',
    de: 'Deutsch'
  },
  nav: {
    dashboard: 'Dashboard',
    progress: 'Fortschritt',
    exercises: 'Übungen',
    plans: 'Pläne',
    workouts: 'Workouts',
    user: 'User'
  },
  common: {
    add: 'Hinzufügen',
    apply: 'Anwenden',
    back: 'Zurück',
    cancel: 'Abbrechen',
    close: 'Schließen',
    confirm: 'Bestätigen',
    delete: 'Löschen',
    done: 'Fertig',
    edit: 'Bearbeiten',
    loading: 'Lade...',
    save: 'Speichern',
    search: 'Suchen',
    skip: 'Überspringen',
    update: 'Aktualisieren'
  },
  validation: {
    valueBetween: 'Der Wert muss zwischen {min} und {max} liegen.',
    decimalFormat: 'Zahlen müssen im Format 1000,00 angegeben werden!',
    yearFormat: 'Jahreszahlen müssen im Format 2023 angegeben werden!',
    dateFormat: 'Erforderliches Format: 12.12.2000',
    integerFormat: 'Ganze Zahlen müssen im Format 1000 (ohne Dezimalstellen) angegeben werden!',
    zipFormat: 'Postleitzahlen müssen im Format 12345 angegeben werden!',
    phoneFormat: 'Telefonnummern müssen im Format +49 171 2323234 angegeben werden!'
  },
  units: {
    kg: 'kg',
    reps: 'Wdh',
    sets: 'Sätze',
    minutesShort: 'Min',
    secondsShort: 'Sek'
  },
  dates: {
    today: 'Heute',
    yesterday: 'Gestern',
    daysAgo: 'vor {count} Tagen'
  },
  muscleGroups: {
    CHEST: 'Brust',
    BACK: 'Rücken',
    SHOULDERS: 'Schultern',
    BICEPS: 'Bizeps',
    TRICEPS: 'Trizeps',
    FOREARMS: 'Unterarme',
    ABS: 'Bauch',
    OBLIQUES: 'Seitliche Bauchmuskeln',
    QUADS: 'Oberschenkel',
    HAMSTRINGS: 'Beinbeuger',
    GLUTES: 'Gesäß',
    CALVES: 'Waden'
  },
  equipment: {
    BARBELL: 'Langhantel',
    DUMBBELL: 'Kurzhantel',
    MACHINE: 'Maschine',
    CABLE: 'Kabelzug',
    BODYWEIGHT: 'Körpergewicht',
    KETTLEBELL: 'Kettlebell',
    BAND: 'Widerstandsband',
    OTHER: 'Sonstiges'
  },
  categories: {
    COMPOUND: 'Compound',
    ISOLATION: 'Isolation',
    CARDIO: 'Cardio',
    STRETCHING: 'Dehnung'
  },
  workoutStatus: {
    COMPLETED: 'Abgeschlossen',
    ABANDONED: 'Abgebrochen',
    IN_PROGRESS: 'Aktiv',
    PAUSED: 'Pausiert'
  },
  header: {
    logout: 'Ausloggen'
  },
  login: {
    title: 'Willkommen zurück',
    subtitle: 'Dein persönlicher Fitness-Tracker',
    info: 'Verwalte Deine Übungen, erstelle Trainingspläne und tracke Deine Workouts — alles an einem Ort.',
    action: 'Einloggen'
  },
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Dein Trainingsüberblick',
    comingSoon: 'Demnächst',
    comingSoonText: 'Hier erscheinen bald Deine Trainingsstatistiken.',
    actions: {
      startWorkout: 'Workout starten',
      startWorkoutDesc: 'Beginne Dein Training',
      progress: 'Fortschritt',
      progressDesc: 'Trends und Entwicklung ansehen',
      plans: 'Trainingspläne',
      plansDesc: 'Pläne verwalten',
      exercises: 'Übungen',
      exercisesDesc: 'Übungskatalog durchsuchen'
    }
  },
  progress: {
    title: 'Fortschritt',
    subtitle: 'Deine Entwicklung über die Zeit',
    empty: 'Noch keine Daten im gewählten Zeitraum',
    tabs: {
      training: 'Training',
      exercises: 'Übungen',
      muscleGroups: 'Muskelgruppen'
    },
    training: {
      chartTitle: 'Workouts pro Woche',
      yAxisLabel: 'Workouts',
      calendarWeek: 'KW {week}/{year}',
      averageLabel: 'Durchschnitt pro Woche ({range})'
    },
    exercises: {
      selectExercise: 'Übung auswählen',
      searchPlaceholder: 'Übung suchen...',
      noResults: 'Keine Übung gefunden',
      chartTitle: 'Topset und e1RM',
      formulaTitle: 'e1RM Formel',
      formulaValue: 'e1RM = Gewicht × (1 + Wiederholungen / 30)',
      formulaHint: 'Beispiel: 80 kg × (1 + 8/30) = 101,3 kg. So kannst Du Sätze mit unterschiedlichen Wiederholungen besser vergleichen.'
    },
    muscleGroups: {
      selectGroup: 'Muskelgruppe auswählen',
      chartTitle: 'Muskelgruppen-Index',
      indexTitle: 'Was bedeutet der Muscle Group Index?',
      indexIntro: 'Der Index zeigt Dir, ob Du bei {muscle} im Vergleich zu Deinem eigenen Start stärker oder schwächer geworden bist.',
      indexStep1: 'Pro Workout nehmen wir bei jeder Übung dieser Muskelgruppe Dein bestes Top-Set.',
      indexStep2: 'Daraus berechnen wir einen Kraftwert (e1RM) mit Gewicht und Wiederholungen.',
      indexStep3: 'Als Startwert (100) nutzen wir den Median Deiner ersten bis zu 3 Messpunkte je Übung.',
      indexStep4: 'Für jede Woche bilden wir einen gewichteten Durchschnitt über alle Übungs-Indizes. Das ist der Wochenwert im Chart.',
      factorCompound: 'Compound Faktor: 1,00',
      factorIsolation: 'Isolation Faktor: 0,85',
      indexValue100: '100 = ungefähr Dein Startniveau',
      indexValue110: '110 = ca. 10% stärker als zu Beginn',
      indexValue90: '90 = ca. 10% unter Deinem Startniveau'
    }
  },
  exercises: {
    title: 'Übungen',
    subtitle: 'Deine Übungsbibliothek',
    create: 'Neue Übung erstellen',
    favoritesAdd: 'Als Favorit markieren',
    favoritesRemove: 'Favorit entfernen',
    searchPlaceholder: 'Übung suchen...',
    loading: 'Lade Übungen...',
    empty: 'Keine Übungen gefunden',
    loadMore: 'Mehr laden',
    loadingMore: 'Lade...',
    filters: 'Filter',
    favorites: 'Favoriten',
    own: 'Eigene',
    form: {
      titleCreate: 'Übung erstellen',
      titleEdit: 'Übung bearbeiten',
      nameLabel: 'Name *',
      namePlaceholder: 'Name der Übung',
      descriptionLabel: 'Beschreibung / Ausführung',
      descriptionPlaceholder: 'Beschreibe die Ausführung der Übung...',
      muscleGroupsLabel: 'Muskelgruppen',
      categoryLabel: 'Kategorie *',
      equipmentLabel: 'Equipment',
      videoLabel: 'Video URL (optional)',
      videoPlaceholder: 'https://...',
      restLabel: 'Empfohlene Pausenzeit (Sekunden)',
      restPlaceholder: 'z.B. 90',
      cancel: 'Abbrechen',
      save: 'Speichern',
      close: 'Schließen'
    },
    filter: {
      title: 'Übungen filtern',
      muscleGroup: 'Muskelgruppe',
      equipment: 'Equipment',
      category: 'Kategorie',
      onlyFavorites: 'Nur Favoriten',
      onlyOwn: 'Nur eigene Übungen',
      apply: 'Anwenden',
      reset: 'Zurücksetzen'
    },
    variants: {
      singular: 'Variante',
      plural: 'Varianten'
    },
    detail: {
      rest: 'Pause',
      execution: 'Ausführung',
      noDescription: 'Keine Beschreibung vorhanden.',
      trainedMuscles: 'Trainierte Muskelgruppen',
      video: 'Video',
      fork: 'Forken',
      forkCopy: 'Eigene Kopie erstellen',
      addVariant: 'Variante hinzufügen',
      variantsTab: 'Variante',
      defaultVariant: 'Standard',
      system: 'System-Übung',
      own: 'Eigene Übung',
      forked: '(geforkt)',
      deleteTitle: 'Übung löschen',
      deleteMessage: 'Möchtest Du "{name}" wirklich löschen?'
    },
    variantDialog: {
      title: 'Variante erstellen',
      nameLabel: 'Name der Variante *',
      namePlaceholder: 'z.B. Enge Griffweite',
      nameError: 'Bitte gib einen Namen ein',
      descriptionLabel: 'Beschreibung / Ausführung',
      descriptionPlaceholder: 'Beschreibe die Ausführung dieser Variante...',
      equipmentLabel: 'Equipment',
      cancel: 'Abbrechen',
      save: 'Speichern'
    }
  },
  plans: {
    title: 'Pläne',
    subtitle: 'Deine Trainingspläne',
    librarySubtitle: 'Vorlagen zum Kopieren',
    mySubtitle: 'Deine eigenen Pläne',
    tabs: {
      library: 'Bibliothek',
      myPlans: 'Meine Pläne'
    },
    favorites: 'Favoriten',
    favoritesAdd: 'Als Favorit markieren',
    favoritesRemove: 'Favorit entfernen',
    system: 'SYSTEM',
    exerciseSingular: 'Übung',
    exercisePlural: 'Übungen',
    create: 'Neuen Plan erstellen',
    createFirst: 'Ersten Plan erstellen',
    loading: 'Lade Pläne...',
    myLoading: 'Lade Deine Pläne...',
    empty: 'Keine Pläne gefunden',
    emptyFavorites: 'Keine Favoriten gefunden',
    emptyOwn: 'Du hast noch keine eigenen Pläne',
    libraryLoading: 'Lade Bibliothek...',
    libraryEmpty: 'Keine Vorlagen gefunden',
    loadMore: 'Mehr laden',
    loadingMore: 'Lade...',
    searchPlaceholder: 'Plan suchen...',
    estimatedDuration: 'Geschätzte Dauer:',
    trainedMuscles: 'Trainierte Muskelgruppen',
    dayType: {
      label: 'Trainingstag',
      both: 'Beide Tage',
      a: 'Tag A',
      b: 'Tag B'
    },
    muscleGroups: {
      arms: 'Arme',
      core: 'Core',
      legs: 'Beine'
    },
    muscleView: {
      front: 'Vorne',
      back: 'Hinten'
    },
    filter: {
      title: 'Pläne filtern',
      onlyFavorites: 'Nur Favoriten',
      onlyOwn: 'Nur eigene Pläne',
      onlySystem: 'Nur System-Pläne',
      apply: 'Anwenden',
      reset: 'Zurücksetzen'
    },
    form: {
      titleCreate: 'Plan erstellen',
      titleEdit: 'Plan bearbeiten',
      nameLabel: 'Name *',
      namePlaceholder: 'Name des Plans',
      descriptionLabel: 'Beschreibung',
      descriptionPlaceholder: 'Beschreibe den Plan...',
      cancel: 'Abbrechen',
      save: 'Speichern'
    },
    exercisePicker: {
      title: 'Übung hinzufügen',
      searchPlaceholder: 'Übung suchen...',
      setsLabel: 'Sätze',
      minRepsLabel: 'Min Wdh',
      maxRepsLabel: 'Max Wdh',
      targetWeightLabel: 'Zielgewicht',
      restLabel: 'Pause (Sek)',
      optional: 'Optional',
      add: 'Hinzufügen'
    },
    exerciseItem: {
      rest: 'Pause',
      setsLabel: 'Sätze',
      minRepsLabel: 'Min Wdh',
      maxRepsLabel: 'Max Wdh',
      targetWeightLabel: 'Zielgewicht',
      restLabel: 'Pause (Sek)',
      notesLabel: 'Notizen',
      notesPlaceholder: 'Notizen...',
      update: 'Aktualisieren',
      remove: 'Entfernen'
    },
    detail: {
      copy: 'Plan kopieren',
      loading: 'Lade Plan...',
      notFound: 'Plan nicht gefunden',
      system: 'System-Plan',
      own: 'Eigener Plan',
      exercisesTitle: 'Übungen ({count})',
      emptyExercises: 'Noch keine Übungen hinzugefügt',
      deleteTitle: 'Plan löschen',
      deleteMessage: 'Möchtest Du "{name}" wirklich löschen?',
      removeExerciseTitle: 'Übung entfernen',
      removeExerciseMessage: 'Möchtest Du "{name}" aus dem Plan entfernen?'
    }
  },
  workouts: {
    title: 'Workouts',
    subtitle: 'Deine Trainingshistorie',
    filters: {
      all: 'Alle',
      completed: 'Abgeschlossen',
      abandoned: 'Abgebrochen'
    },
    loading: 'Lade Workouts...',
    empty: 'Keine Workouts gefunden',
    loadMore: 'Mehr laden',
    loadingMore: 'Lade...',
    start: 'Workout starten',
    pause: 'Pausieren',
    resume: 'Fortsetzen',
    abandon: 'Abbrechen',
    finish: 'Beenden',
    notFound: 'Workout nicht gefunden',
    backToList: 'Zurück zur Übersicht',
    pauseLabel: 'PAUSIERT',
    rest: 'PAUSE',
    restSkip: 'Überspringen',
    summary: {
      duration: 'Dauer',
      sets: 'Sätze',
      personalRecords: 'Personal Records',
      volume: 'Volumen (kg)',
      exercises: 'Übungen',
      noSets: 'Keine Sätze abgeschlossen',
      completedTitle: 'Workout abgeschlossen!',
      abandonedTitle: 'Workout abgebrochen',
      personalRecordsTitle: 'Personal Records',
      personalRecordWeight: 'PR: +{value} {unit}',
      personalRecordReps: 'PR: +{value} Wdh'
    },
    abandonDialog: {
      title: 'Workout abbrechen?',
      text: 'Dein Fortschritt wird gespeichert, aber das Workout wird als abgebrochen markiert.',
      cancel: 'Zurück',
      confirm: 'Abbrechen'
    },
    finishWarning: {
      title: 'Workout wirklich beenden?',
      text: 'Nicht alle Sätze sind abgeschlossen. Wenn Du trotzdem beendest, werden die fehlenden Sätze mit 0 Wiederholungen gespeichert.',
      missingTitle: 'Fehlende Sätze',
      setLabel: 'Satz {number}',
      cancel: 'Zurück',
      confirm: 'Trotzdem beenden'
    },
    setItem: {
      weight: 'Gewicht',
      reps: 'Wdh',
      repetitions: 'Wiederholungen',
      target: 'Ziel'
    },
    pickers: {
      weight: 'Gewicht',
      number: 'Wdh'
    },
    planPicker: {
      subtitle: 'Wähle einen Trainingsplan',
      empty: 'Du hast noch keine Trainingspläne',
      error: 'Fehler beim Laden der Pläne',
      dayTypeTitle: 'Welchen Tag möchtest Du trainieren?',
      lastDayType: 'Zuletzt: Tag {dayType} am {date}',
      noLastDayType: 'Bisher kein abgeschlossenes Workout für diesen Plan'
    },
    notes: {
      label: 'Notiz',
      add: 'Notiz hinzufügen',
      edit: 'Notiz bearbeiten',
      title: 'Übungsnotiz',
      placeholder: 'Schreib hier Deine Notiz...',
      saving: 'Speichere...',
      saved: 'Gespeichert',
      error: 'Konnte Notiz nicht speichern',
      done: 'Fertig'
    }
  },
  errors: {
    notFoundTitle: 'Seite nicht gefunden',
    notFoundText: 'Die Seite existiert nicht.',
    goHome: 'Ab nach Hause!'
  },
  dev: {
    title: 'Developer Mode',
    subtitle: 'Authentifizierung für lokale Entwicklung konfigurieren',
    identity: 'Identität',
    permissions: 'Berechtigungen',
    activeSession: 'Aktive Session',
    saving: 'Speichere...',
    autosave: 'Auto-save',
    noEmail: 'Keine E-Mail',
    userId: 'User ID',
    roles: 'Rollen',
    noRoles: 'Keine Rollen vergeben',
    rolesAdmin: 'Admin',
    rolesAdminDesc: 'Vollzugriff auf das System',
    rolesUser: 'User',
    rolesUserDesc: 'Standard Benutzerzugang',
    unknownUser: 'Unbekannt',
    userLabel: 'User {id}',
    apply: 'Anwenden'
  },
  start: {
    subtitle: 'Projektbasis für neue Anwendungen',
    gettingStarted: 'Erste Schritte',
    gettingStartedText: 'Dies ist Dein Starter-Template für neue Express.js + Vue Projekte. Fork das Repository und starte mit der Entwicklung.',
    development: 'Entwicklung',
    devDesc: 'Lokale Auth-Konfiguration',
    stackTitle: 'Tech Stack'
  }
}
