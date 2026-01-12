import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExercisesIndexPage from 'src/pages/exercises/indexPage.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'
import { exerciseList, exerciseListSmall, emptyExerciseList } from '../fixtures/exercises.js'
import { server } from '../setup/server.js'
import { rest } from 'msw'

const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  }),
  useRoute: () => ({
    params: {}
  })
}))

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(ExercisesIndexPage, {
    attachTo: document.body,
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('ExercisesIndexPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('Loading State', () => {
    it('displays loading state during fetch', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.delay(100), ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()

      expect(wrapper.find('[data-test="loading-state"]').exists()).toBe(true)
    })

    it('hides loading state after fetch completes', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="loading-state"]').exists()).toBe(false)
    })
  })

  describe('Exercise List', () => {
    it('loads exercises on mount', async () => {
      let apiCalled = false
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          apiCalled = true
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(apiCalled).toBe(true)
    })

    it('displays exercises via ExerciseCard components', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="exercises-list"]').exists()).toBe(true)
      expect(wrapper.findAll('[data-test="exercise-card"]').length).toBeGreaterThan(0)
    })

    it('displays empty state when no exercises', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(emptyExerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="empty-state"]').exists()).toBe(true)
    })
  })

  describe('Search', () => {
    it('debounces search input (500ms)', async () => {
      let searchQuery = ''
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          searchQuery = req.url.searchParams.get('search') || ''
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const searchInput = wrapper.find('[data-test="search-input"]')
      await searchInput.setValue('Bank')

      // Should not have triggered yet
      expect(searchQuery).toBe('')

      // Advance timers by 500ms
      vi.advanceTimersByTime(500)
      await flushPromises()

      expect(searchQuery).toBe('Bank')
    })

    it('clears search and reloads list', async () => {
      let callCount = 0
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          callCount++
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const initialCallCount = callCount

      const searchInput = wrapper.find('[data-test="search-input"]')
      await searchInput.setValue('Bank')
      vi.advanceTimersByTime(500)
      await flushPromises()

      const clearBtn = wrapper.find('[data-test="clear-search-btn"]')
      await clearBtn.trigger('click')
      await flushPromises()

      expect(callCount).toBeGreaterThan(initialCallCount)
    })
  })

  describe('Filters', () => {
    it('opens filter dialog on filter button click', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const filterBtn = wrapper.find('[data-test="filter-btn"]')
      await filterBtn.trigger('click')
      await flushPromises()

      expect(document.querySelector('.filter-dialog')).not.toBeNull()
    })

    it('has filter button', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="filter-btn"]').exists()).toBe(true)
    })

    it('renders filter options in dialog', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const filterBtn = wrapper.find('[data-test="filter-btn"]')
      await filterBtn.trigger('click')
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      expect(chestFilter).not.toBeNull()

      const applyBtn = document.querySelector('[data-test="apply-btn"]')
      expect(applyBtn).not.toBeNull()
    })

    it('toggles filter selection in dialog', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const filterBtn = wrapper.find('[data-test="filter-btn"]')
      await filterBtn.trigger('click')
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      chestFilter.click()
      await flushPromises()

      expect(chestFilter.classList.contains('active')).toBe(true)

      chestFilter.click()
      await flushPromises()

      expect(chestFilter.classList.contains('active')).toBe(false)
    })
  })

  describe('Pagination', () => {
    it('shows load more button when more items available', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList)) // 30 items
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="load-more-btn"]').exists()).toBe(true)
    })

    it('hides load more button when no more items', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseListSmall)) // < 30 items
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      expect(wrapper.find('[data-test="load-more-btn"]').exists()).toBe(false)
    })

    it('loads more exercises on load more button click', async () => {
      let skipValue = null
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          skipValue = req.url.searchParams.get('skip')
          if (skipValue === '30') {
            return res(ctx.status(200), ctx.json(exerciseListSmall))
          }
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const loadMoreBtn = wrapper.find('[data-test="load-more-btn"]')
      await loadMoreBtn.trigger('click')
      await flushPromises()

      expect(skipValue).toBe('30')
    })
  })

  describe('Create Exercise', () => {
    it('opens create form on add button click', async () => {
      server.use(
        rest.get('http://localhost:4004/api/exercises', (req, res, ctx) => {
          return res(ctx.status(200), ctx.json(exerciseList))
        })
      )

      const wrapper = await mountComponent()
      await flushPromises()

      const addBtn = wrapper.find('[data-test="add-btn"]')
      await addBtn.trigger('click')
      await flushPromises()

      expect(document.querySelector('.form-dialog')).not.toBeNull()
    })
  })
})
