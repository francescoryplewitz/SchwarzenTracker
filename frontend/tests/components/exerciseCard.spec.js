import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExerciseCard from 'src/components/exercises/exerciseCard.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'
import { singleExercise, exerciseWithoutVariants } from '../fixtures/exercises.js'
import { server } from '../setup/server.js'
import { rest } from 'msw'

const mockPush = vi.fn()
const mockRouter = {
  push: mockPush
}

const mountComponent = async (exercise, options = {}) => {
  const { wrapper } = mountWithQuasar(ExerciseCard, {
    props: {
      exercise: { ...exercise }
    },
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

describe('ExerciseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders exercise card container', async () => {
      const wrapper = await mountComponent(singleExercise)
      expect(wrapper.find('[data-test="exercise-card"]').exists()).toBe(true)
    })

    it('displays exercise name correctly', async () => {
      const wrapper = await mountComponent(singleExercise)
      const name = wrapper.find('[data-test="exercise-name"]')
      expect(name.exists()).toBe(true)
      expect(name.text()).toBe('Bankdrücken')
    })

    it('displays first 2 muscle groups as chips', async () => {
      const wrapper = await mountComponent(singleExercise)
      const chips = wrapper.findAll('[data-test="muscle-chip"]')
      expect(chips.length).toBe(2)
      expect(chips[0].text()).toBe('Brust')
      expect(chips[1].text()).toBe('Trizeps')
    })

    it('displays equipment label translated', async () => {
      const wrapper = await mountComponent(singleExercise)
      const equipment = wrapper.find('[data-test="equipment-label"]')
      expect(equipment.exists()).toBe(true)
      expect(equipment.text()).toBe('Langhantel')
    })

    it('does not display equipment label when not set', async () => {
      const exerciseNoEquipment = { ...singleExercise, equipment: null }
      const wrapper = await mountComponent(exerciseNoEquipment)
      expect(wrapper.find('[data-test="equipment-label"]').exists()).toBe(false)
    })

    it('displays category label translated', async () => {
      const wrapper = await mountComponent(singleExercise)
      const category = wrapper.find('[data-test="category-label"]')
      expect(category.exists()).toBe(true)
      expect(category.text()).toBe('Compound')
    })

    it('displays variants count with singular form', async () => {
      const exerciseOneVariant = { ...singleExercise, _count: { variants: 1 } }
      const wrapper = await mountComponent(exerciseOneVariant)
      const count = wrapper.find('[data-test="variants-count"]')
      expect(count.exists()).toBe(true)
      expect(count.text()).toBe('1 Variante')
    })

    it('displays variants count with plural form', async () => {
      const wrapper = await mountComponent(singleExercise)
      const count = wrapper.find('[data-test="variants-count"]')
      expect(count.exists()).toBe(true)
      expect(count.text()).toBe('2 Varianten')
    })

    it('does not display variants count when zero', async () => {
      const wrapper = await mountComponent(exerciseWithoutVariants)
      expect(wrapper.find('[data-test="variants-count"]').exists()).toBe(false)
    })
  })

  describe('Favorite Button', () => {
    it('shows filled star icon when exercise is favorite', async () => {
      const wrapper = await mountComponent(singleExercise)
      const btn = wrapper.find('[data-test="favorite-btn"]')
      expect(btn.classes()).toContain('active')
    })

    it('shows outline star icon when exercise is not favorite', async () => {
      const wrapper = await mountComponent(exerciseWithoutVariants)
      const btn = wrapper.find('[data-test="favorite-btn"]')
      expect(btn.classes()).not.toContain('active')
    })

    it('calls POST API when adding favorite', async () => {
      let apiCalled = false
      server.use(
        rest.post('http://localhost:5001/api/exercises/:id/favorite', (req, res, ctx) => {
          apiCalled = true
          return res(ctx.status(201), ctx.json({ success: true }))
        })
      )

      const exercise = { ...exerciseWithoutVariants, isFavorite: false }
      const wrapper = await mountComponent(exercise)
      const btn = wrapper.find('[data-test="favorite-btn"]')

      await btn.trigger('click')
      await flushPromises()

      expect(apiCalled).toBe(true)
    })

    it('calls DELETE API when removing favorite', async () => {
      let apiCalled = false
      server.use(
        rest.delete('http://localhost:5001/api/exercises/:id/favorite', (req, res, ctx) => {
          apiCalled = true
          return res(ctx.status(204))
        })
      )

      const exercise = { ...singleExercise, isFavorite: true }
      const wrapper = await mountComponent(exercise)
      const btn = wrapper.find('[data-test="favorite-btn"]')

      await btn.trigger('click')
      await flushPromises()

      expect(apiCalled).toBe(true)
    })
  })

  describe('Navigation', () => {
    it('navigates to detail page on card click', async () => {
      const wrapper = await mountComponent(singleExercise)
      const card = wrapper.find('[data-test="exercise-card"]')

      await card.trigger('click')
      await flushPromises()

      expect(mockPush).toHaveBeenCalledWith('/exercises/ex-1')
    })

    it('does not navigate when clicking favorite button', async () => {
      server.use(
        rest.post('http://localhost:5001/api/exercises/:id/favorite', (req, res, ctx) => {
          return res(ctx.status(201), ctx.json({ success: true }))
        })
      )

      const exercise = { ...exerciseWithoutVariants, isFavorite: false }
      const wrapper = await mountComponent(exercise)
      const btn = wrapper.find('[data-test="favorite-btn"]')

      await btn.trigger('click')
      await flushPromises()

      expect(mockPush).not.toHaveBeenCalled()
    })
  })
})
