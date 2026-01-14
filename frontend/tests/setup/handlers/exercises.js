import { rest } from 'msw'
import {
  exerciseList,
  singleExercise,
  createdExercise,
  updatedExercise,
  createdVariant,
  forkedExercise
} from '../../fixtures/exercises.js'

const BASE_URL = 'http://localhost:5001'

// Store to track state changes during tests
let exerciseStore = [...exerciseList]
let favoriteState = {}

export const resetExerciseStore = () => {
  exerciseStore = [...exerciseList]
  favoriteState = {}
}

export const handlers = [
  // GET /api/exercises - List exercises
  rest.get(`${BASE_URL}/api/exercises`, (req, res, ctx) => {
    const search = req.url.searchParams.get('search')
    const muscleGroup = req.url.searchParams.get('muscleGroup')
    const equipment = req.url.searchParams.get('equipment')
    const category = req.url.searchParams.get('category')
    const onlyFavorites = req.url.searchParams.get('onlyFavorites') === 'true'
    const onlyOwn = req.url.searchParams.get('onlyOwn') === 'true'
    const skip = parseInt(req.url.searchParams.get('skip') || '0', 10)

    let result = [...exerciseStore]

    if (search) {
      result = result.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    }
    if (muscleGroup) {
      result = result.filter(e => e.muscleGroups.includes(muscleGroup))
    }
    if (equipment) {
      result = result.filter(e => e.equipment === equipment)
    }
    if (category) {
      result = result.filter(e => e.category === category)
    }
    if (onlyFavorites) {
      result = result.filter(e => e.isFavorite)
    }
    if (onlyOwn) {
      result = result.filter(e => !e.isSystem)
    }

    result = result.slice(skip, skip + 30)

    return res(ctx.status(200), ctx.json(result))
  }),

  // GET /api/exercises/:id - Get single exercise
  rest.get(`${BASE_URL}/api/exercises/:id`, (req, res, ctx) => {
    const { id } = req.params
    const exercise = exerciseStore.find(e => e.id === id)

    if (!exercise) {
      return res(ctx.status(404), ctx.json({ error: 'Exercise not found' }))
    }

    return res(ctx.status(200), ctx.json({
      ...exercise,
      isFavorite: favoriteState[id] ?? exercise.isFavorite,
      variants: exercise.variants || []
    }))
  }),

  // POST /api/exercises - Create exercise
  rest.post(`${BASE_URL}/api/exercises`, async (req, res, ctx) => {
    const body = await req.json()

    const newExercise = {
      ...createdExercise,
      ...body,
      id: `ex-new-${Date.now()}`
    }

    exerciseStore.push(newExercise)

    return res(ctx.status(201), ctx.json(newExercise))
  }),

  // PATCH /api/exercises/:id - Update exercise
  rest.patch(`${BASE_URL}/api/exercises/:id`, async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()
    const index = exerciseStore.findIndex(e => e.id === id)

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Exercise not found' }))
    }

    exerciseStore[index] = { ...exerciseStore[index], ...body }

    return res(ctx.status(200), ctx.json(exerciseStore[index]))
  }),

  // DELETE /api/exercises/:id - Delete exercise
  rest.delete(`${BASE_URL}/api/exercises/:id`, (req, res, ctx) => {
    const { id } = req.params
    const index = exerciseStore.findIndex(e => e.id === id)

    if (index === -1) {
      return res(ctx.status(404), ctx.json({ error: 'Exercise not found' }))
    }

    exerciseStore.splice(index, 1)

    return res(ctx.status(204))
  }),

  // POST /api/exercises/:id/favorite - Add favorite
  rest.post(`${BASE_URL}/api/exercises/:id/favorite`, (req, res, ctx) => {
    const { id } = req.params
    favoriteState[id] = true

    return res(ctx.status(201), ctx.json({ success: true }))
  }),

  // DELETE /api/exercises/:id/favorite - Remove favorite
  rest.delete(`${BASE_URL}/api/exercises/:id/favorite`, (req, res, ctx) => {
    const { id } = req.params
    favoriteState[id] = false

    return res(ctx.status(204))
  }),

  // POST /api/exercises/:id/variants - Create variant
  rest.post(`${BASE_URL}/api/exercises/:id/variants`, async (req, res, ctx) => {
    const { id } = req.params
    const body = await req.json()

    const newVariant = {
      ...createdVariant,
      ...body,
      id: `var-new-${Date.now()}`
    }

    return res(ctx.status(201), ctx.json(newVariant))
  }),

  // POST /api/exercises/:id/fork - Fork exercise
  rest.post(`${BASE_URL}/api/exercises/:id/fork`, (req, res, ctx) => {
    const { id } = req.params
    const original = exerciseStore.find(e => e.id === id)

    if (!original) {
      return res(ctx.status(404), ctx.json({ error: 'Exercise not found' }))
    }

    const forked = {
      ...forkedExercise,
      name: `${original.name} (Kopie)`,
      forkedFromId: id,
      id: `ex-forked-${Date.now()}`
    }

    exerciseStore.push(forked)

    return res(ctx.status(201), ctx.json(forked))
  })
]

export default handlers
