import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import PlansIndexPage from 'src/pages/plans/indexPage.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(PlansIndexPage, {
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('PlansIndexPage', () => {
  describe('Rendering', () => {
    it('renders page container', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="plans-page"]').exists()).toBe(true)
    })

    it('displays page title', async () => {
      const wrapper = await mountComponent()
      const title = wrapper.find('[data-test="page-title"]')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Trainingspläne')
    })

    it('displays coming soon message for Module 2', async () => {
      const wrapper = await mountComponent()
      const label = wrapper.find('[data-test="coming-soon-label"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Coming Soon')
    })

    it('displays placeholder card', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="placeholder-card"]').exists()).toBe(true)
    })

    it('displays Module 2 reference in placeholder text', async () => {
      const wrapper = await mountComponent()
      const card = wrapper.find('[data-test="placeholder-card"]')
      expect(card.text()).toContain('Modul 2')
    })

    it('applies dark theme classes', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.dark-page').exists()).toBe(true)
    })
  })
})
