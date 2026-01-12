import { describe, expect, it } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import DashboardIndexPage from 'src/pages/dashboard/indexPage.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(DashboardIndexPage, {
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('DashboardIndexPage', () => {
  describe('Rendering', () => {
    it('renders page container', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="dashboard-page"]').exists()).toBe(true)
    })

    it('displays page title', async () => {
      const wrapper = await mountComponent()
      const title = wrapper.find('[data-test="page-title"]')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Dashboard')
    })

    it('displays coming soon message', async () => {
      const wrapper = await mountComponent()
      const label = wrapper.find('[data-test="coming-soon-label"]')
      expect(label.exists()).toBe(true)
      expect(label.text()).toBe('Coming Soon')
    })

    it('displays placeholder card', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="placeholder-card"]').exists()).toBe(true)
    })

    it('applies dark theme classes', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.dark-page').exists()).toBe(true)
    })
  })
})
