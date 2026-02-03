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
      expect(title.text()).toBe('Plans')
    })

    it('renders library tab', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="tab-library"]').exists()).toBe(true)
    })

    it('renders my plans tab', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('[data-test="tab-my-plans"]').exists()).toBe(true)
    })

    it('applies dark theme classes', async () => {
      const wrapper = await mountComponent()
      expect(wrapper.find('.dark-page').exists()).toBe(true)
    })
  })
})
