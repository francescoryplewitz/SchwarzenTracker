# Modul 2: Trainingsplan

## Konzept-Uebersicht

Ein Trainingsplan ist eine strukturierte Zusammenstellung von Uebungen fuer eine einzelne Trainingseinheit. User koennen mehrere Plaene fuer verschiedene Trainingstage erstellen (z.B. "Brust-Tag", "Ruecken-Tag", "Bein-Tag").

### Kernkonzepte
- **Ein Plan = eine Trainingseinheit** (nicht Wochenplan)
- **System-Plaene**: Vorgefertigte Starter-Plaene (schreibgeschuetzt)
- **User-Plaene**: Eigene Plaene erstellen oder System-Plaene kopieren
- **Kopier-Funktion**: Jeder Plan kann kopiert werden (eigene + System)

---

## 0. Projekt-Regeln (aus CLAUDE.md + Guidance-Dateien)

Gleiche Regeln wie in Modul 1 - siehe `modul-1-uebungen.md` Abschnitt 0.

---

## 1. Datenbankschema

### Neue Models fuer prisma/schema.prisma

```prisma
// ============================================
// TRAININGSPLAN MODULE
// ============================================

model TrainingPlan {
  id          String   @id @default(cuid())
  name        String
  description String?  @db.Text

  isSystem    Boolean  @default(false)
  createdById Int?
  createdBy   User?    @relation(fields: [createdById], references: [id])

  exercises   PlanExercise[]
  favorites   UserPlanFavorite[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model PlanExercise {
  id           String   @id @default(cuid())
  planId       String
  plan         TrainingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  exerciseId   String
  exercise     Exercise @relation(fields: [exerciseId], references: [id])

  sortOrder    Int      @default(0)
  sets         Int      @default(3)
  minReps      Int      @default(8)
  maxReps      Int      @default(12)
  targetWeight Float?
  restSeconds  Int?
  notes        String?  @db.Text

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([planId, exerciseId])
}

model UserPlanFavorite {
  userId    Int
  planId    String
  createdAt DateTime @default(now())

  user      User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan      TrainingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)

  @@id([userId, planId])
}
```

### Exercise-Model Erweiterung

```prisma
model Exercise {
  // ... bestehende Felder ...

  // Neue Relation
  planExercises PlanExercise[]
}
```

### User-Model Erweiterung

```prisma
model User {
  // ... bestehende Felder ...

  // Neue Relations
  createdPlans   TrainingPlan[]
  planFavorites  UserPlanFavorite[]
}
```

---

## 2. Backend-Services

### Dateistruktur

```
srv/
├── routes/
│   └── plans.js              # Plan CRUD Routes
├── services/
│   └── plans.js              # Plan Business Logic
└── data/
    └── seed/
        └── plans.js          # Seed-Data fuer System-Plaene
```

### API-Endpoints

| Methode | Endpoint | Handler | Beschreibung |
|---------|----------|---------|--------------|
| GET | `/plans` | getPlans | Liste mit Filter/Suche |
| GET | `/plans/:id` | getPlan | Einzelner Plan + Uebungen |
| POST | `/plans` | createPlan | Neuen Plan erstellen |
| PATCH | `/plans/:id` | updatePlan | Plan bearbeiten |
| DELETE | `/plans/:id` | deletePlan | Plan loeschen (nur eigene) |
| POST | `/plans/:id/copy` | copyPlan | Plan kopieren |
| POST | `/plans/:id/exercises` | addExercise | Uebung hinzufuegen |
| PATCH | `/plans/:id/exercises/:exerciseId` | updatePlanExercise | Uebung im Plan bearbeiten |
| DELETE | `/plans/:id/exercises/:exerciseId` | removeExercise | Uebung entfernen |
| PATCH | `/plans/:id/exercises/reorder` | reorderExercises | Reihenfolge aendern |
| POST | `/plans/:id/favorite` | addFavorite | Favorit setzen |
| DELETE | `/plans/:id/favorite` | removeFavorite | Favorit entfernen |

### Service-Funktionen (srv/services/plans.js)

```javascript
const LOG = require('../server/logger')('plans')

// Helper: buildWhere fuer Filter
const buildPlanWhere = (req) => {
  const { search, onlyFavorites, onlyOwn, onlySystem } = req.query
  const userId = req.session?.user?.id
  const where = {}

  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  if (onlySystem === 'true') {
    where.isSystem = true
  }
  if (onlyOwn === 'true') {
    where.createdById = userId
  }
  if (onlyFavorites === 'true') {
    where.favorites = { some: { userId } }
  }
  return where
}

// GET /plans - Liste
const getPlans = async (req, res) => {
  const userId = req.session?.user?.id
  const { skip } = req.query
  const where = buildPlanWhere(req)

  const plans = await prisma.trainingPlan.findMany({
    where,
    orderBy: { name: 'asc' },
    take: 30,
    skip: isNaN(parseInt(skip)) ? 0 : parseInt(skip),
    include: {
      exercises: { select: { id: true } },
      favorites: { where: { userId }, select: { userId: true } }
    }
  })

  const result = plans.map(p => ({
    ...p,
    isFavorite: p.favorites.length > 0,
    exerciseCount: p.exercises.length,
    favorites: undefined,
    exercises: undefined
  }))

  LOG.info(`Fetched ${result.length} plans`)
  return res.status(200).send(result)
}

// GET /plans/:id - Detail mit allen Uebungen
const getPlan = async (req, res) => {
  const userId = req.session?.user?.id

  const plan = await prisma.trainingPlan.findUnique({
    where: { id: req.params.id },
    include: {
      exercises: {
        orderBy: { sortOrder: 'asc' },
        include: { exercise: true }
      },
      favorites: { where: { userId }, select: { userId: true } }
    }
  })

  if (!plan) return res.status(404).send()

  return res.status(200).send({
    ...plan,
    isFavorite: plan.favorites.length > 0,
    favorites: undefined
  })
}

// POST /plans - Neuen Plan erstellen
const createPlan = async (req, res) => {
  const userId = req.session?.user?.id

  const plan = await prisma.trainingPlan.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      createdById: userId,
      isSystem: false
    }
  })

  LOG.info(`Created plan ${plan.id}`)
  return res.status(201).send(plan)
}

// POST /plans/:id/copy - Plan kopieren
const copyPlan = async (req, res) => {
  const userId = req.session?.user?.id

  const original = await prisma.trainingPlan.findUnique({
    where: { id: req.params.id },
    include: { exercises: true }
  })

  if (!original) return res.status(404).send()

  const copy = await prisma.trainingPlan.create({
    data: {
      name: `${original.name} (Kopie)`,
      description: original.description,
      createdById: userId,
      isSystem: false,
      exercises: {
        create: original.exercises.map(e => ({
          exerciseId: e.exerciseId,
          sortOrder: e.sortOrder,
          sets: e.sets,
          minReps: e.minReps,
          maxReps: e.maxReps,
          targetWeight: e.targetWeight,
          restSeconds: e.restSeconds,
          notes: e.notes
        }))
      }
    },
    include: { exercises: true }
  })

  LOG.info(`Copied plan ${req.params.id} to ${copy.id}`)
  return res.status(201).send(copy)
}

// POST /plans/:id/exercises - Uebung hinzufuegen
const addExercise = async (req, res) => {
  const { exerciseId, sets, minReps, maxReps, targetWeight, restSeconds, notes } = req.body

  const maxOrder = await prisma.planExercise.aggregate({
    where: { planId: req.params.id },
    _max: { sortOrder: true }
  })

  const planExercise = await prisma.planExercise.create({
    data: {
      planId: req.params.id,
      exerciseId,
      sortOrder: (maxOrder._max.sortOrder || 0) + 1,
      sets: sets || 3,
      minReps: minReps || 8,
      maxReps: maxReps || 12,
      targetWeight,
      restSeconds,
      notes
    },
    include: { exercise: true }
  })

  LOG.info(`Added exercise ${exerciseId} to plan ${req.params.id}`)
  return res.status(201).send(planExercise)
}

// PATCH /plans/:id/exercises/reorder - Reihenfolge aendern
const reorderExercises = async (req, res) => {
  const { order } = req.body // Array von { id, sortOrder }

  await prisma.$transaction(
    order.map(item =>
      prisma.planExercise.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder }
      })
    )
  )

  LOG.info(`Reordered exercises in plan ${req.params.id}`)
  return res.status(200).send({ success: true })
}
```

### Route-Datei (srv/routes/plans.js)

```javascript
const { validate, validateQuery } = require('../server/input-validation')
const service = require('../services/plans')

module.exports = (app) => {
  app.get('/api/plans', validateQuery({
    search: { type: 'STRING' },
    onlyFavorites: { type: 'BOOLEAN' },
    onlyOwn: { type: 'BOOLEAN' },
    onlySystem: { type: 'BOOLEAN' },
    skip: { type: 'NUMBER' }
  }), service.getPlans)

  app.get('/api/plans/:id', service.getPlan)

  app.post('/api/plans', validate({
    name: { type: 'STRING', required: true },
    description: { type: 'STRING' }
  }), service.createPlan)

  app.patch('/api/plans/:id', validate({
    name: { type: 'STRING' },
    description: { type: 'STRING' }
  }), service.updatePlan)

  app.delete('/api/plans/:id', service.deletePlan)

  app.post('/api/plans/:id/copy', service.copyPlan)

  app.post('/api/plans/:id/exercises', validate({
    exerciseId: { type: 'STRING', required: true },
    sets: { type: 'NUMBER' },
    minReps: { type: 'NUMBER' },
    maxReps: { type: 'NUMBER' },
    targetWeight: { type: 'NUMBER' },
    restSeconds: { type: 'NUMBER' },
    notes: { type: 'STRING' }
  }), service.addExercise)

  app.patch('/api/plans/:id/exercises/:exerciseId', validate({
    sets: { type: 'NUMBER' },
    minReps: { type: 'NUMBER' },
    maxReps: { type: 'NUMBER' },
    targetWeight: { type: 'NUMBER' },
    restSeconds: { type: 'NUMBER' },
    notes: { type: 'STRING' }
  }), service.updatePlanExercise)

  app.delete('/api/plans/:id/exercises/:exerciseId', service.removeExercise)

  app.patch('/api/plans/:id/exercises/reorder', validate({
    order: { type: 'ARRAY', required: true }
  }), service.reorderExercises)

  app.post('/api/plans/:id/favorite', service.addFavorite)
  app.delete('/api/plans/:id/favorite', service.removeFavorite)
}
```

---

## 3. Seed-Data (System-Plaene)

### srv/data/seed/plans.js

```javascript
const systemPlans = [
  {
    name: 'Ganzkoerper Anfaenger',
    description: 'Perfekt fuer den Einstieg ins Krafttraining. 3x pro Woche.',
    exercises: [
      { name: 'Kniebeuge', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Bankdruecken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Rudern', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Kreuzheben', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Bizeps Curls', sets: 2, minReps: 10, maxReps: 15 }
    ]
  },
  {
    name: 'Push Day',
    description: 'Brust, Schultern, Trizeps. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Bankdruecken', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Schraegbankdruecken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Seitheben', sets: 3, minReps: 12, maxReps: 15 },
      { name: 'Trizeps Dips', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Trizeps Pushdown', sets: 3, minReps: 10, maxReps: 15 }
    ]
  },
  {
    name: 'Pull Day',
    description: 'Ruecken, Bizeps. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Klimmzuege', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Rudern', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Latziehen', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Face Pulls', sets: 3, minReps: 12, maxReps: 15 },
      { name: 'Bizeps Curls', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Hammer Curls', sets: 3, minReps: 10, maxReps: 12 }
    ]
  },
  {
    name: 'Leg Day',
    description: 'Beine und Gesaess. Teil eines PPL-Splits.',
    exercises: [
      { name: 'Kniebeuge', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Rumaenisches Kreuzheben', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Beinpresse', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Beinbeuger', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Beinstrecker', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Wadenheben', sets: 4, minReps: 12, maxReps: 15 }
    ]
  },
  {
    name: 'Upper Body',
    description: 'Kompletter Oberkoerper. Fuer Upper/Lower Split.',
    exercises: [
      { name: 'Bankdruecken', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Rudern', sets: 4, minReps: 8, maxReps: 12 },
      { name: 'Schulterdrücken', sets: 3, minReps: 8, maxReps: 12 },
      { name: 'Latziehen', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Bizeps Curls', sets: 2, minReps: 10, maxReps: 12 },
      { name: 'Trizeps Pushdown', sets: 2, minReps: 10, maxReps: 12 }
    ]
  },
  {
    name: 'Lower Body',
    description: 'Kompletter Unterkoerper. Fuer Upper/Lower Split.',
    exercises: [
      { name: 'Kniebeuge', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Kreuzheben', sets: 4, minReps: 6, maxReps: 10 },
      { name: 'Ausfallschritte', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Beinbeuger', sets: 3, minReps: 10, maxReps: 12 },
      { name: 'Wadenheben', sets: 4, minReps: 12, maxReps: 15 }
    ]
  }
]
```

---

## 4. Frontend-Struktur

### Seitenstruktur

```
frontend/src/
├── pages/
│   └── plans/
│       ├── indexPage.vue         # /plans - Planuebersicht
│       └── detailPage.vue        # /plans/:id - Plan-Detail
├── components/
│   └── plans/
│       ├── planCard.vue          # Karte in der Liste
│       ├── planFilter.vue        # Filter-Dialog
│       ├── planForm.vue          # Create/Edit Dialog
│       ├── planExerciseItem.vue  # Uebung im Plan (Drag & Drop)
│       └── exercisePicker.vue    # Uebung zum Plan hinzufuegen
└── router/
    └── routes.js                 # Route-Definitionen erweitern
```

### Routes (frontend/src/router/routes.js)

```javascript
{
  path: '/plans',
  component: () => import('layouts/baseLayout.vue'),
  children: [
    {
      path: '',
      name: 'plans',
      component: () => import('pages/plans/indexPage.vue')
    },
    {
      path: ':id',
      name: 'plan-detail',
      component: () => import('pages/plans/detailPage.vue')
    }
  ]
}
```

---

## 5. UI-Design

### Planuebersicht (/plans)

```
┌─────────────────────────────────────────────────┐
│  HEADER                                          │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 🔍 Plan suchen...               [Filter]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Aktive Filter:  [System ×] [Favoriten ×]      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ⭐ Push Day                     SYSTEM   │   │
│  │    Brust, Schultern, Trizeps             │   │
│  │    ──────────────────────────────        │   │
│  │    6 Uebungen                        →   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │    Mein Brust-Tag                        │   │
│  │    Fokus auf Masse                       │   │
│  │    ──────────────────────────────        │   │
│  │    5 Uebungen                        →   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          + Neuen Plan erstellen         │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  NAVBAR: [Dashboard] [Uebungen] [Plaene*]      │
└─────────────────────────────────────────────────┘
```

### Plan-Detail (/plans/:id)

```
┌─────────────────────────────────────────────────┐
│  ← Zurueck            [⭐] [📋 Kopieren] [🗑️]  │
├─────────────────────────────────────────────────┤
│                                                 │
│  PUSH DAY                                       │
│  System-Plan                                    │
│  ─────────────────────────────────────────      │
│  Brust, Schultern, Trizeps. Teil eines         │
│  PPL-Splits.                                    │
│                                                 │
│  ─────────────────────────────────────────      │
│  UEBUNGEN (6)                                   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ≡  1. Bankdruecken                      │   │
│  │     4 Saetze × 6-10 Wdh                 │   │
│  │     Ziel: 80kg | Pause: 90s         [✏️]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ≡  2. Schraegbankdruecken               │   │
│  │     3 Saetze × 8-12 Wdh                 │   │
│  │     Ziel: 60kg | Pause: 60s         [✏️]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ... (Drag & Drop zum Sortieren)               │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          + Uebung hinzufuegen           │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  NAVBAR                                         │
└─────────────────────────────────────────────────┘
```

### Uebung-hinzufuegen Dialog (exercisePicker.vue)

```
┌─────────────────────────────────────────┐
│  Uebung hinzufuegen                [×]   │
├─────────────────────────────────────────┤
│                                         │
│  🔍 Uebung suchen...                    │
│                                         │
│  [○] Bankdruecken (bereits im Plan)     │
│  [●] Fliegende                          │
│  [○] Cable Crossover                    │
│  [○] Dips                               │
│                                         │
│  ─────────────────────────────────────  │
│  Saetze:        [ 3 ]                   │
│  Wiederholungen: [ 8 ] - [ 12 ]         │
│  Zielgewicht:   [ ___ ] kg (optional)   │
│  Pausenzeit:    [ 60 ] Sekunden         │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         Uebung hinzufuegen          ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## 6. Umsetzungsreihenfolge

### Phase 1: Basis-Infrastruktur
1. **Prisma Schema erweitern**
   - TrainingPlan, PlanExercise, UserPlanFavorite Models
   - Exercise Relation hinzufuegen
   - User Relations hinzufuegen
   - Migration erstellen (User macht das)

2. **Seed-Data**
   - 6 System-Plaene (siehe Abschnitt 3)

### Phase 2: Backend CRUD
3. **GET /plans**
   - Liste mit Pagination
   - Filter: onlyFavorites, onlyOwn, onlySystem
   - Suche nach Name

4. **GET /plans/:id**
   - Plan mit allen PlanExercises
   - Exercises inkludiert

5. **POST /plans**
   - Neuen Plan erstellen

6. **PATCH /plans/:id**
   - Nur eigene Plaene editierbar

7. **DELETE /plans/:id**
   - Nur eigene Plaene loeschbar

8. **POST /plans/:id/copy**
   - Plan komplett kopieren (mit Uebungen)

### Phase 3: Plan-Uebungen API
9. **POST /plans/:id/exercises**
   - Uebung zum Plan hinzufuegen

10. **PATCH /plans/:id/exercises/:exerciseId**
    - Sets, Reps, Weight, Rest bearbeiten

11. **DELETE /plans/:id/exercises/:exerciseId**
    - Uebung aus Plan entfernen

12. **PATCH /plans/:id/exercises/reorder**
    - Reihenfolge aendern (Drag & Drop)

### Phase 4: Frontend Liste
13. **planCard.vue**
    - Name, Beschreibung, Uebungsanzahl
    - System/User Badge
    - Favorit-Stern
    - Glass-morphism Style

14. **planFilter.vue**
    - Filter-Dialog
    - System/Eigene/Favoriten

15. **plans/indexPage.vue**
    - Haelt plans Array
    - Fetch on mount mit Loading-State

### Phase 5: Frontend Detail
16. **plans/detailPage.vue**
    - Plan-Header mit Aktionen
    - Liste der Uebungen

17. **planExerciseItem.vue**
    - Einzelne Uebung im Plan
    - Inline-Edit fuer Sets/Reps/Weight
    - Drag-Handle fuer Sortierung

18. **exercisePicker.vue**
    - Uebung auswaehlen und konfigurieren

### Phase 6: Favoriten + Kopieren
19. **POST/DELETE /plans/:id/favorite**
    - Favorit-Toggle

20. **Kopieren-Button**
    - In Detail-Seite
    - Response ins Array pushen

### Phase 7: Tests
21. **Integration-Tests** (test/integration/plans.js)
22. **Unit-Tests** (test/unit/plans.js)
23. **Frontend-Tests**

---

## 7. Kritische Dateien

| Datei | Aktion |
|-------|--------|
| prisma/schema.prisma | Erweitern |
| srv/routes/plans.js | Neu |
| srv/services/plans.js | Neu |
| srv/data/seed/plans.js | Neu |
| frontend/src/router/routes.js | Erweitern |
| frontend/src/pages/plans/indexPage.vue | Ersetzen (Placeholder) |
| frontend/src/pages/plans/detailPage.vue | Neu |
| frontend/src/components/plans/planCard.vue | Neu |
| frontend/src/components/plans/planFilter.vue | Neu |
| frontend/src/components/plans/planForm.vue | Neu |
| frontend/src/components/plans/planExerciseItem.vue | Neu |
| frontend/src/components/plans/exercisePicker.vue | Neu |

---

## 8. Verifikation

### Backend-Tests

| Endpoint | Erfolgsfall | Fehlerfall |
|----------|-------------|------------|
| GET /plans | Liste mit Pagination | - |
| GET /plans/:id | Plan mit Uebungen | 404 bei unbekannter ID |
| POST /plans | 201 + created plan | 400 bei fehlenden Feldern |
| PATCH /plans/:id | 200 + updated plan | 404/403 |
| DELETE /plans/:id | 204 | 404/403 |
| POST /plans/:id/copy | 201 + copied plan | 404 |
| POST /plans/:id/exercises | 201 + planExercise | 400 |
| PATCH /plans/:id/exercises/reorder | 200 | - |

Ausfuehren:
```bash
npm run test:ci
```

### Manuelle Verifikation
1. Planuebersicht aufrufen → System-Plaene sichtbar
2. Filter anwenden → Liste wird gefiltert
3. Plan anklicken → Detailseite mit Uebungen
4. Uebungen per Drag & Drop sortieren
5. Uebung hinzufuegen → Dialog oeffnet, Uebung erscheint
6. Sets/Reps bearbeiten → Autosave
7. Plan kopieren → Kopie erscheint in Liste
8. Favorit togglen → Stern aendert sich
9. Neuen Plan erstellen → Erscheint in Liste

---

## 9. Spaetere Erweiterungen (nicht MVP)

- **Supersets**: Gruppierung von Uebungen
- **Wochenplan-Ansicht**: Mehrere Plaene einem Wochentag zuordnen
- **Muskelgruppen-Analyse**: Visualisierung welche Muskeln wie stark beansprucht werden
- **Intensitaets-Empfehlungen**: Warnung bei zu hoher/niedriger Belastung
- **Alternative Uebungen**: Bei "Geraet besetzt" Alternativen vorschlagen
