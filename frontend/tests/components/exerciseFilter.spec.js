import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExerciseFilter from 'src/components/exercises/exerciseFilter.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(ExerciseFilter, {
    attachTo: document.body,
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('ExerciseFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  describe('Dialog Visibility', () => {
    it('dialog is not visible initially', async () => {
      const wrapper = await mountComponent()
      expect(document.querySelector('.filter-dialog')).toBeNull()
    })

    it('opens dialog when open() is called', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      expect(document.querySelector('.filter-dialog')).not.toBeNull()
    })

    it('has close button', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const closeBtn = document.querySelector('[data-test="close-btn"]')
      expect(closeBtn).not.toBeNull()
    })
  })

  describe('Filter Selection', () => {
    it('renders all filter option buttons', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      expect(chestFilter).not.toBeNull()

      const barbellFilter = document.querySelector('[data-test="equipment-filter-BARBELL"]')
      expect(barbellFilter).not.toBeNull()

      const compoundFilter = document.querySelector('[data-test="category-filter-COMPOUND"]')
      expect(compoundFilter).not.toBeNull()
    })

    it('deselects muscle group filter on second click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      chestFilter.click()
      await flushPromises()
      expect(chestFilter.classList.contains('active')).toBe(true)

      chestFilter.click()
      await flushPromises()
      expect(chestFilter.classList.contains('active')).toBe(false)
    })

    it('selects equipment filter on click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const barbellFilter = document.querySelector('[data-test="equipment-filter-BARBELL"]')
      barbellFilter.click()
      await flushPromises()

      expect(barbellFilter.classList.contains('active')).toBe(true)
    })

    it('selects category filter on click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const compoundFilter = document.querySelector('[data-test="category-filter-COMPOUND"]')
      compoundFilter.click()
      await flushPromises()

      expect(compoundFilter.classList.contains('active')).toBe(true)
    })

    it('toggles onlyFavorites checkbox', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const favoritesToggle = document.querySelector('[data-test="favorites-toggle"] input')
      expect(favoritesToggle.checked).toBe(false)

      favoritesToggle.click()
      await flushPromises()

      expect(favoritesToggle.checked).toBe(true)
    })

    it('toggles onlyOwn checkbox', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const ownToggle = document.querySelector('[data-test="own-toggle"] input')
      expect(ownToggle.checked).toBe(false)

      ownToggle.click()
      await flushPromises()

      expect(ownToggle.checked).toBe(true)
    })
  })

  describe('Reset Filters', () => {
    it('resets all filters on reset button click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open({
        muscleGroup: 'CHEST',
        equipment: 'BARBELL',
        category: 'COMPOUND',
        onlyFavorites: true,
        onlyOwn: true
      })
      await flushPromises()

      const resetBtn = document.querySelector('[data-test="reset-btn"]')
      resetBtn.click()
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      expect(chestFilter.classList.contains('active')).toBe(false)

      const barbellFilter = document.querySelector('[data-test="equipment-filter-BARBELL"]')
      expect(barbellFilter.classList.contains('active')).toBe(false)

      const compoundFilter = document.querySelector('[data-test="category-filter-COMPOUND"]')
      expect(compoundFilter.classList.contains('active')).toBe(false)

      const favoritesToggle = document.querySelector('[data-test="favorites-toggle"] input')
      expect(favoritesToggle.checked).toBe(false)

      const ownToggle = document.querySelector('[data-test="own-toggle"] input')
      expect(ownToggle.checked).toBe(false)
    })
  })

  describe('Apply Filters', () => {
    it('has apply button', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const applyBtn = document.querySelector('[data-test="apply-btn"]')
      expect(applyBtn).not.toBeNull()
    })

    it('emits apply event with selected filters on apply click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const chestFilter = document.querySelector('[data-test="muscle-filter-CHEST"]')
      chestFilter.click()
      await flushPromises()

      const barbellFilter = document.querySelector('[data-test="equipment-filter-BARBELL"]')
      barbellFilter.click()
      await flushPromises()

      const compoundFilter = document.querySelector('[data-test="category-filter-COMPOUND"]')
      compoundFilter.click()
      await flushPromises()

      const favoritesToggle = document.querySelector('[data-test="favorites-toggle"] input')
      favoritesToggle.click()
      await flushPromises()

      const applyBtn = document.querySelector('[data-test="apply-btn"]')
      applyBtn.click()
      await flushPromises()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')[0][0]).toMatchObject({
        muscleGroup: 'CHEST',
        equipment: 'BARBELL',
        category: 'COMPOUND',
        onlyFavorites: true,
        onlyOwn: false
      })
    })

    it('emits empty filters when none selected', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const applyBtn = document.querySelector('[data-test="apply-btn"]')
      applyBtn.click()
      await flushPromises()

      expect(wrapper.emitted('apply')).toBeTruthy()
      expect(wrapper.emitted('apply')[0][0]).toMatchObject({
        muscleGroup: null,
        equipment: null,
        category: null,
        onlyFavorites: false,
        onlyOwn: false
      })
    })
  })
})
