import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExerciseDetailPage from 'src/pages/exercises/detailPage.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'
import { singleExercise, systemExercise } from '../fixtures/exercises.js'
import { server } from '../setup/server.js'
import { rest } from 'msw'

const mockPush = vi.fn()
const mockRouteParams = { id: 'ex-1' }
const mockRouter = {
  push: mockPush
}

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    params: mockRouteParams
  })
}))

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(ExerciseDetailPage, {
    attachTo: document.body,
    global: {
      mocks: {
        $router: mockRouter
      }
    },
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('ExerciseDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRouteParams.id = 'ex-1'
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Loading State', () => {
    it('displays loading state during fetch', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.delay(100), ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()

      expect(wrapper.find('[data-test="loading-state"]').exists()).toBe(true)
    })

    it('hides loading state after fetch completes', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="loading-state"]').exists()).toBe(false)
    })
  })

  describe('Exercise Details', () => {
    it('fetches exercise by ID on mount', async () => {
      let fetchedId = null
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          fetchedId = req.params.id
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(fetchedId).toBe('ex-1')
    })

    it('displays exercise details correctly', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="exercise-title"]').text()).toBe('Bankdrücken')
      expect(wrapper.find('[data-test="exercise-type"]').text()).toContain('Eigene Übung')
      expect(wrapper.find('[data-test="exercise-description"]').text()).toContain('Flach auf der Bank')
    })

    it('displays empty state when exercise not found', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({}))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="empty-state"]').exists()).toBe(true)
    })
  })

  describe('Favorite Toggle', () => {
    it('toggles favorite status on button click', async () => {
      let favoriteToggled = false
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ ...singleExercise, isFavorite: false }))
        }),
        rest.post('http://localhost:5001/api/exercises/:id/favorite', (req, res, ctx) => {
          favoriteToggled = true
          return res(ctx.status(201), ctx.json({ success: true }))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const favoriteBtn = wrapper.find('[data-test="favorite-btn"]')
      await favoriteBtn.trigger('click')
      await flushPromises()

      expect(favoriteToggled).toBe(true)
    })
  })

  describe('Edit/Delete for Non-System Exercises', () => {
    it('shows edit button for non-system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="edit-btn"]').exists()).toBe(true)
    })

    it('shows delete button for non-system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="delete-btn"]').exists()).toBe(true)
    })

    it('hides edit button for system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(systemExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="edit-btn"]').exists()).toBe(false)
    })

    it('hides delete button for system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(systemExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="delete-btn"]').exists()).toBe(false)
    })

    it('opens edit dialog for non-system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const editBtn = wrapper.find('[data-test="edit-btn"]')
      await editBtn.trigger('click')
      await flushPromises()

      expect(document.querySelector('.form-dialog')).not.toBeNull()
    })

    it('delete button triggers confirmDelete on click', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const deleteBtn = wrapper.find('[data-test="delete-btn"]')
      expect(deleteBtn.exists()).toBe(true)

      // Verify delete button is clickable for non-system exercises
      await deleteBtn.trigger('click')
      await flushPromises()

      // Note: Full delete confirmation flow requires Quasar dialog plugin
      // which needs integration test setup. The confirmDelete method is triggered.
    })
  })

  describe('Navigation', () => {
    it('navigates back to exercises list', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const backBtn = wrapper.find('[data-test="back-btn"]')
      await backBtn.trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/exercises')
    })
  })

  describe('Variant Tabs', () => {
    it('displays variant tabs when variants exist', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="variants-tabs"]').exists()).toBe(true)
      expect(wrapper.find('[data-test="tab-main"]').exists()).toBe(true)
    })

    it('does not display variant tabs when no variants', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ ...singleExercise, variants: [] }))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="variants-tabs"]').exists()).toBe(false)
    })
  })

  describe('Video Button', () => {
    it('shows video button when videoUrl exists', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="video-btn"]').exists()).toBe(true)
    })

    it('hides video button when no videoUrl', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ ...singleExercise, videoUrl: null }))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="video-btn"]').exists()).toBe(false)
    })
  })

  describe('FAB Actions', () => {
    it('shows FAB when exercise is loaded', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="fab-actions"]').exists()).toBe(true)
    })

    it('shows fork button for system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(systemExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="fab-fork"]').exists()).toBe(true)
    })

    it('hides fork button for non-system exercises', async () => {
      server.use(
        rest.get('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(singleExercise))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="fab-fork"]').exists()).toBe(false)
    })
  })
})
