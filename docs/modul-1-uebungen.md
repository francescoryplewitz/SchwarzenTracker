# Modul 1: Uebungen - Umsetzungsplan

## Uebersicht

Technische Umsetzung des Uebungen-Moduls basierend auf der fachlichen Spezifikation in SchwarzenTracker.md.

---

## 0. Projekt-Regeln (aus CLAUDE.md + Guidance-Dateien)

### Code Style
- **Keine Semicolons**
- **Single Quotes** fuer Strings
- **camelCase** fuer Frontend-Dateinamen: `exerciseCard.vue`, `exerciseFilter.vue`
- **kebab-case** fuer Backend-Dateinamen: `exercises.js`
- **Deutsche Texte** mit "Du" (nicht "Sie")
- **Keine defensiven Checks** in internem Code
- **Keine nested try-catch Bloecke**

### Mobile-First (PROJECT-SPECIFIC.md)
- App wird hauptsaechlich auf Smartphones genutzt
- Layouts muessen responsive sein
- **Design-Vorlage**: `frontend/src/components/start-welcome.vue`
  - Glass-morphism Cards
  - Dark Theme (#040d16 Background, #00ffc2 Accent)
  - Backdrop-blur Effekte

### Vue Patterns (vue-guidance.md)
- **Composition API** verwenden
- **Pages als thin orchestration layer** - halten Daten, delegieren UI
- **Direct Mutation** - Components erhalten Referenzen und mutieren direkt
- **Kein Cloning** von Props
- **Nach POST**: Response direkt ins Array pushen
- **Nach PATCH**: Kein Reload, Object.assign fuer computed fields
- **Autosave**: Debounced Watch (500ms), NICHT blur events
- **Loading**: `showLoader()` / `hideLoader()` aus `common/loading.js`
- **Tooltips**: `q-tooltip` verwenden, NICHT `title` Attribut

### Backend Patterns (crud-operations.md)
- **Input Validation**: `srv/server/input-validation-v2.js` Middleware
- **Logging**: Meaningful logs mit IDs
- **Try/Catch**: Nur fuer DB-Operationen mit User-Input
- **Status Codes**:
  - POST → 201 + created entity
  - GET → 200 + data
  - PATCH → 200 + updated entity
  - DELETE → 204 (empty body)
  - Not found → 404
- **buildWhere/buildQuery Pattern** fuer List-Endpoints
- **Pagination**: skip, take Parameter

---

## 1. Datenbankschema

### Neue Models fuer prisma/schema.prisma

```prisma
// ============================================
// UEBUNGEN MODULE
// ============================================

model Exercise {
  id            String   @id @default(cuid())
  name          String
  description   String   @db.Text

  // Kategorisierung
  muscleGroups  MuscleGroup[]    // Array von Enums
  category      ExerciseCategory
  equipment     Equipment?

  // Medien
  images        ExerciseImage[]
  videoUrl      String?

  // Varianten-System (Self-Relation)
  parentId      String?
  parent        Exercise?  @relation("ExerciseVariants", fields: [parentId], references: [id])
  variants      Exercise[] @relation("ExerciseVariants")

  // Herkunft
  isSystem      Boolean  @default(false)
  forkedFromId  String?
  forkedFrom    Exercise? @relation("ExerciseForks", fields: [forkedFromId], references: [id])
  forks         Exercise[] @relation("ExerciseForks")
  createdById   Int?
  createdBy     User?     @relation(fields: [createdById], references: [id])

  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relations
  userFavorites UserExerciseFavorite[]
  userNotes     UserExerciseNote[]
}

model ExerciseImage {
  id         String   @id @default(cuid())
  exerciseId String
  url        String
  sortOrder  Int      @default(0)
  altText    String?

  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
}

model UserExerciseFavorite {
  userId      Int
  exerciseId  String
  createdAt   DateTime @default(now())

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@id([userId, exerciseId])
}

model UserExerciseNote {
  id          String   @id @default(cuid())
  userId      Int
  exerciseId  String
  content     String   @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercise    Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@unique([userId, exerciseId])
}

// Enums
enum MuscleGroup {
  CHEST
  BACK
  SHOULDERS
  BICEPS
  TRICEPS
  FOREARMS
  ABS
  OBLIQUES
  QUADS
  HAMSTRINGS
  GLUTES
  CALVES
}

enum ExerciseCategory {
  COMPOUND
  ISOLATION
  CARDIO
  STRETCHING
}

enum Equipment {
  BARBELL
  DUMBBELL
  MACHINE
  CABLE
  BODYWEIGHT
  KETTLEBELL
  BAND
  OTHER
}
```

### User-Model Erweiterung

```prisma
model User {
  // ... bestehende Felder ...

  // Neue Relations
  createdExercises  Exercise[]
  exerciseFavorites UserExerciseFavorite[]
  exerciseNotes     UserExerciseNote[]
}
```

---

## 2. Backend-Services

### Dateistruktur

```
srv/
├── routes/
│   └── exercises.js         # Exercise CRUD Routes
├── services/
│   └── exercises.js         # Exercise Business Logic
└── data/
    └── seed/
        └── exercises.js     # Seed-Data fuer System-Uebungen
```

### API-Endpoints

| Methode | Endpoint | Handler | Beschreibung |
|---------|----------|---------|--------------|
| GET | `/exercises` | getExercises | Liste mit Filter/Suche |
| GET | `/exercises/:id` | getExercise | Einzelne Uebung + Varianten |
| POST | `/exercises` | createExercise | Neue Uebung erstellen |
| PATCH | `/exercises/:id` | updateExercise | Uebung bearbeiten |
| DELETE | `/exercises/:id` | deleteExercise | Uebung loeschen |
| POST | `/exercises/:id/fork` | forkExercise | System-Uebung kopieren |
| POST | `/exercises/:id/variants` | addVariant | Variante hinzufuegen |
| POST | `/exercises/:id/favorite` | addFavorite | Favorit setzen |
| DELETE | `/exercises/:id/favorite` | removeFavorite | Favorit entfernen |
| PUT | `/exercises/:id/note` | saveNote | Notiz speichern |
| DELETE | `/exercises/:id/note` | deleteNote | Notiz loeschen |

### Service-Funktionen (srv/services/exercises.js)

```javascript
const LOG = require('../server/logger')('exercises')

// Helper: buildWhere fuer Filter
const buildExerciseWhere = (req) => {
  const { search, muscleGroup, equipment, category } = req.query
  const where = {}
  if (search) {
    where.name = { contains: search, mode: 'insensitive' }
  }
  if (muscleGroup) {
    where.muscleGroups = { has: muscleGroup }
  }
  if (equipment) where.equipment = equipment
  if (category) where.category = category
  return where
}

// Helper: buildQuery fuer Pagination
const buildExerciseQuery = (req) => {
  const { skip } = req.query
  const where = buildExerciseWhere(req)
  return {
    where,
    orderBy: { name: 'asc' },
    take: 30,
    skip: isNaN(parseInt(skip)) ? 0 : parseInt(skip),
    include: { variants: { select: { id: true } } }
  }
}

// GET /exercises - Liste
const getExercises = async (req, res) => {
  try {
    const query = buildExerciseQuery(req)
    const exercises = await prisma.exercise.findMany(query)
    LOG.info(`Fetched ${exercises.length} exercises`)
    return res.status(200).send(exercises)
  } catch (e) {
    LOG.error(`Could not get exercises: ${e}`)
    return res.status(400).send()
  }
}

// GET /exercises/:id - Detail
const getExercise = async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id },
      include: { variants: true, images: true }
    })
    if (!exercise) return res.status(404).send()
    return res.status(200).send(exercise)
  } catch (e) {
    LOG.error(`Could not get exercise ${req.params.id}: ${e}`)
    return res.status(400).send()
  }
}

// POST /exercises - Erstellen
const createExercise = async (req, res) => {
  try {
    const userId = req.session?.user?.id
    const exercise = await prisma.exercise.create({
      data: { ...req.body, createdById: userId, isSystem: false }
    })
    LOG.info(`Created exercise ${exercise.id}`)
    return res.status(201).send(exercise)
  } catch (e) {
    LOG.error(`Could not create exercise: ${e}`)
    return res.status(400).send()
  }
}

// PATCH /exercises/:id - Update
const updateExercise = async (req, res) => {
  try {
    const existing = await prisma.exercise.findUnique({ where: { id: req.params.id } })
    if (!existing) return res.status(404).send()
    const updated = await prisma.exercise.update({
      where: { id: req.params.id },
      data: req.body
    })
    LOG.info(`Updated exercise ${req.params.id}`)
    return res.status(200).send(updated)
  } catch (e) {
    LOG.error(`Could not update exercise ${req.params.id}: ${e}`)
    return res.status(400).send()
  }
}

// DELETE /exercises/:id
const deleteExercise = async (req, res) => {
  try {
    await prisma.exercise.delete({ where: { id: req.params.id } })
    LOG.info(`Deleted exercise ${req.params.id}`)
    return res.status(204).send()
  } catch (e) {
    return res.status(404).send()
  }
}
```

### Route-Datei (srv/routes/exercises.js)

```javascript
const { validate, validateQuery } = require('../server/input-validation')
const service = require('../services/exercises')

module.exports = (app) => {
  app.get('/exercises', validateQuery({
    search: { type: 'STRING' },
    muscleGroup: { type: 'STRING' },
    equipment: { type: 'STRING' },
    category: { type: 'STRING' },
    skip: { type: 'NUMBER' }
  }), service.getExercises)
  app.get('/exercises/:id', service.getExercise)

  app.post('/exercises', validate({
    name: { type: 'STRING', required: true },
    description: { type: 'STRING' },
    muscleGroups: { type: 'ARRAY' },
    category: { type: 'STRING', required: true },
    equipment: { type: 'STRING' }
  }), service.createExercise)

  app.patch('/exercises/:id', validate({
    name: { type: 'STRING' },
    description: { type: 'STRING' },
    muscleGroups: { type: 'ARRAY' },
    category: { type: 'STRING' },
    equipment: { type: 'STRING' }
  }), service.updateExercise)

  app.delete('/exercises/:id', service.deleteExercise)
}
```

---

## 3. Frontend-Struktur

### Navigation & Routing

```
App-Navigation (navbarBase.vue)
├── Dashboard (/)           # Spaeter: Workout starten, Statistik
├── Uebungen (/exercises)   # Uebungsliste
├── Plaene (/plans)         # Trainingsplaene (Modul 2)
└── Profil (/profile)       # Einstellungen (spaeter)
```

### Seitenstruktur

```
frontend/src/
├── pages/
│   └── exercises/
│       ├── indexPage.vue        # /exercises - Uebungsliste
│       └── detailPage.vue       # /exercises/:id - Detailansicht
├── components/
│   └── exercises/
│       ├── exerciseCard.vue     # Karte in der Liste
│       ├── exerciseFilter.vue   # Filter-Leiste
│       ├── exerciseForm.vue     # Create/Edit Dialog
│       ├── exerciseVariantTabs.vue  # Tab-Panel fuer Varianten
│       ├── exerciseGallery.vue  # Bildergalerie
│       ├── exerciseNote.vue     # Notiz-Sektion
│       └── muscleGroupChip.vue  # Muskelgruppen-Tag
└── router/
    └── routes.js            # Route-Definitionen erweitern
```

### Routes (frontend/src/router/routes.js)

```javascript
{
  path: '/exercises',
  component: () => import('layouts/baseLayout.vue'),
  children: [
    {
      path: '',
      name: 'exercises',
      component: () => import('pages/exercises/indexPage.vue')
    },
    {
      path: ':id',
      name: 'exercise-detail',
      component: () => import('pages/exercises/detailPage.vue')
    }
  ]
}
```

---

## 4. UI-Design

### Farbschema (bestehend)
- Background: #040d16
- Cards: rgba(255,255,255,0.03) mit Glasmorphism
- Accent: #00ffc2 (Cyan)
- Primary: #23a0df

### Uebungsliste (/exercises)

```
┌─────────────────────────────────────────────────┐
│  HEADER (bestehend)                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ 🔍 Uebung suchen...              [Filter]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Aktive Filter:  [Brust ×] [Langhantel ×]      │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │ ☆ Bankdruecken                          │   │
│  │    Brust • Langhantel • Compound        │   │
│  │    ──────────────────────────────       │   │
│  │    3 Varianten                      →   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │    Kniebeuge                            │   │
│  │    Beine • Langhantel • Compound        │   │
│  │    ──────────────────────────────       │   │
│  │    2 Varianten                      →   │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│                    ...                          │
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │          + Neue Uebung erstellen        │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│  NAVBAR: [Dashboard] [Uebungen*] [Plaene]      │
└─────────────────────────────────────────────────┘
```

### Filter-Dialog

```
┌─────────────────────────────────────────┐
│  Filter                           [×]   │
├─────────────────────────────────────────┤
│                                         │
│  Muskelgruppe                           │
│  [○ Alle] [○ Brust] [○ Ruecken]        │
│  [○ Schultern] [○ Arme] [○ Beine]      │
│  [○ Core]                               │
│                                         │
│  Equipment                              │
│  [○ Alle] [○ Langhantel] [○ Kurzhantel]│
│  [○ Maschine] [○ Koerpergewicht]       │
│                                         │
│  Kategorie                              │
│  [○ Alle] [○ Compound] [○ Isolation]   │
│                                         │
│  [☐ Nur Favoriten]                      │
│  [☐ Nur eigene Uebungen]                │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │         Filter anwenden             ││
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

### Detailansicht (/exercises/:id)

```
┌─────────────────────────────────────────────────┐
│  ← Zurueck                    [☆ Favorit]       │
├─────────────────────────────────────────────────┤
│                                                 │
│  BANKDRUECKEN                                   │
│  System-Uebung                                  │
│                                                 │
│  ┌──────────┬────────────┬─────────────┐       │
│  │ Standard │ Schraegbank│ Negativ     │       │
│  ├──────────┴────────────┴─────────────┤       │
│  │                                     │       │
│  │  ┌───────────────────────────────┐  │       │
│  │  │                               │  │       │
│  │  │      [ Bildergalerie ]        │  │       │
│  │  │                               │  │       │
│  │  │         ● ○ ○ ○               │  │       │
│  │  └───────────────────────────────┘  │       │
│  │                                     │       │
│  │  Primaer: Brust                     │       │
│  │  Sekundaer: Trizeps, Schultern      │       │
│  │  Equipment: Langhantel              │       │
│  │  Kategorie: Compound                │       │
│  │                                     │       │
│  │  ─────────────────────────────────  │       │
│  │  AUSFUEHRUNG                        │       │
│  │                                     │       │
│  │  1. Lege dich flach auf die Bank    │       │
│  │  2. Greife die Stange schulterbreit │       │
│  │  3. Senke kontrolliert zur Brust    │       │
│  │  4. Druecke explosiv nach oben      │       │
│  │                                     │       │
│  └─────────────────────────────────────┘       │
│                                                 │
│  ─────────────────────────────────────────────  │
│  DEINE NOTIZ                                    │
│  ┌─────────────────────────────────────────┐   │
│  │ Auf Schulterposition achten...          │   │
│  │                                     [✏️]│   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  ─────────────────────────────────────────────  │
│  [🔀 Uebung forken]   [+ Variante hinzufuegen] │
│                                                 │
├─────────────────────────────────────────────────┤
│  NAVBAR                                         │
└─────────────────────────────────────────────────┘
```

---

## 5. Umsetzungsreihenfolge

### Phase 1: Basis-Infrastruktur
1. **Prisma Schema erweitern**
   - Exercise Model mit muscleGroups Array
   - Enums (MuscleGroup, ExerciseCategory, Equipment)
   - User-Relations hinzufuegen
   - Migration erstellen

2. **Seed-Data**
   - 10-15 Basis-Uebungen als System-Uebungen

3. **Navigation erweitern**
   - navbarBase.vue: menuItems befuellen
   - Routes fuer /exercises anlegen

### Phase 2: Backend CRUD
4. **GET /exercises**
   - Liste mit Pagination
   - Filter: muscleGroup, equipment, category
   - Suche nach Name

5. **GET /exercises/:id**
   - Volle Details inkl. Varianten
   - User-spezifisch: Favorit-Status, Notiz

6. **POST /exercises**
   - Neue Uebung erstellen
   - MuscleGroups zuweisen

7. **PATCH /exercises/:id**
   - Nur eigene Uebungen editierbar

8. **DELETE /exercises/:id**
   - Nur eigene Uebungen loeschbar

### Phase 3: Frontend Liste
9. **exerciseCard.vue**
   - Karte mit Name, Muskelgruppen, Equipment
   - Favorit-Stern (q-tooltip, nicht title)
   - Varianten-Anzahl
   - Glass-morphism Style (wie start-welcome.vue)

10. **exerciseFilter.vue**
    - Filter-Dialog
    - Chip-Anzeige aktiver Filter

11. **exercises/indexPage.vue** (thin orchestration layer)
    - Haelt exercises Array (single source of truth)
    - Delegiert UI an Components
    - Fetch on mount mit Loading-State:
    ```javascript
    import { showLoader, hideLoader } from 'src/components/common/loading'

    onMounted(async () => {
      showLoader('Lade Übungen...')
      const { data } = await api.get('/exercises')
      exercises.value = data
      hideLoader()
    })
    ```

### Phase 4: Frontend Detail
12. **exercises/detailPage.vue**
    - Haelt exercise Referenz
    - Delegiert an Child-Components

13. **exerciseVariantTabs.vue**
    - Tab-Navigation zwischen Varianten
    - Erhaelt Referenz, mutiert direkt

14. **exerciseGallery.vue**
    - Bild-Slider (falls Bilder vorhanden)

15. **exerciseNote.vue**
    - Notiz anzeigen/bearbeiten
    - Autosave: `watch(() => note, debounce(...), { deep: true })`
    - NICHT blur events

### Phase 5: Erweiterte Features
16. **Favoriten**
    - POST/DELETE /exercises/:id/favorite
    - Toggle im Frontend (direct mutation)

17. **Fork-Funktion**
    - POST /exercises/:id/fork
    - Response direkt ins Array pushen

18. **Varianten hinzufuegen**
    - POST /exercises/:id/variants
    - Form fuer neue Variante

19. **exerciseForm.vue**
    - Create/Edit Dialog (q-dialog)
    - Erhaelt Referenz, mutiert direkt
    - Validierung mit q-form

### Phase 6: Verfeinerung
20. **Responsive Optimierung**
21. **Loading States**
22. **Error Handling**
23. **Tests**

---

## 6. Kritische Dateien

| Datei | Aktion |
|-------|--------|
| prisma/schema.prisma | Erweitern |
| srv/routes/exercises.js | Neu |
| srv/services/exercises.js | Neu |
| srv/data/seed/exercises.js | Neu |
| frontend/src/router/routes.js | Erweitern |
| frontend/src/components/navbarBase.vue | Erweitern |
| frontend/src/pages/exercises/indexPage.vue | Neu |
| frontend/src/pages/exercises/detailPage.vue | Neu |
| frontend/src/components/exercises/exerciseCard.vue | Neu |
| frontend/src/components/exercises/exerciseFilter.vue | Neu |
| frontend/src/components/exercises/exerciseForm.vue | Neu |
| frontend/src/components/exercises/exerciseVariantTabs.vue | Neu |
| frontend/src/components/exercises/exerciseGallery.vue | Neu |
| frontend/src/components/exercises/exerciseNote.vue | Neu |
| frontend/src/components/exercises/muscleGroupChip.vue | Neu |

---

## 7. Verifikation

### Backend-Tests (test/exercises.js)

Integration-Tests fuer alle Endpoints:

| Endpoint | Erfolgsfall | Fehlerfall |
|----------|-------------|------------|
| GET /exercises | Liste mit Pagination | - |
| GET /exercises/:id | Einzelne Uebung | 404 bei unbekannter ID |
| POST /exercises | 201 + created entity | 400 bei DB-Fehler |
| PATCH /exercises/:id | 200 + updated entity | 404 bei unbekannter ID |
| DELETE /exercises/:id | 204 | 404 bei unbekannter ID |

Ausfuehren:
```bash
npm run test:ci
```

### Frontend-Tests

**Fixtures erstellen** (frontend/tests/fixtures/):
- `exercises-list.json` - GET /exercises Response
- `exercise-detail.json` - GET /exercises/:id Response

**Provider-Tests** (test/provider/):
- Matcher fuer exercises Response-Struktur
- Ausfuehren: `npm run test:provider`

**Component-Tests** (frontend/tests/):
- `indexPage.spec.js` - Liste, Filter, Infinite Scroll
- `detailPage.spec.js` - Detail, Varianten-Tabs, Notiz
- `exerciseCard.spec.js` - Favorit-Toggle, Navigation
- `exerciseForm.spec.js` - Create/Edit Dialog
- `exerciseNote.spec.js` - Autosave-Verhalten

Ausfuehren:
```bash
npm run test:frontend
```

### Manuelle Verifikation
1. Uebungsliste aufrufen → Seed-Daten sichtbar
2. Filter anwenden → Liste wird gefiltert
3. Uebung anklicken → Detailseite oeffnet
4. Zwischen Varianten wechseln → Tab-Panel funktioniert
5. Notiz hinzufuegen → Wird gespeichert (Autosave)
6. Favorit togglen → Stern aendert sich
7. Neue Uebung erstellen → Erscheint in Liste
8. System-Uebung forken → Kopie wird erstellt
