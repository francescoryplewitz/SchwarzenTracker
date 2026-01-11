import { describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import StartWelcome from 'src/components/start-welcome.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'

// Mock vue-router
const mockPush = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

const mountComponent = async (options = {}) => {
  const { wrapper } = mountWithQuasar(StartWelcome, {
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('StartWelcome', () => {
  it('renders the start page container', async () => {
    const wrapper = await mountComponent()
    expect(wrapper.find('[data-test="start-page"]').exists()).toBe(true)
  })

  it('displays the page title Ryplewitz Consulting', async () => {
    const wrapper = await mountComponent()
    const title = wrapper.find('[data-test="page-title"]')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Ryplewitz Consulting')
  })

  it('displays the page subtitle', async () => {
    const wrapper = await mountComponent()
    const subtitle = wrapper.find('[data-test="page-subtitle"]')
    expect(subtitle.exists()).toBe(true)
    expect(subtitle.text()).toContain('Project base')
  })

  it('renders the info card with getting started content', async () => {
    const wrapper = await mountComponent()
    const infoCard = wrapper.find('[data-test="info-card"]')
    expect(infoCard.exists()).toBe(true)
    expect(infoCard.text()).toContain('Getting Started')
    expect(infoCard.text()).toContain('Express.js + Vue')
  })

  it('renders the dev card', async () => {
    const wrapper = await mountComponent()
    const devCard = wrapper.find('[data-test="dev-card"]')
    expect(devCard.exists()).toBe(true)
    expect(devCard.text()).toContain('/dev')
  })

  it('navigates to /dev when dev card is clicked', async () => {
    const wrapper = await mountComponent()
    const devCard = wrapper.find('[data-test="dev-card"]')

    await devCard.trigger('click')
    await flushPromises()

    expect(mockPush).toHaveBeenCalledWith('/dev')
  })

  it('renders the tech stack card with all technologies', async () => {
    const wrapper = await mountComponent()
    const stackCard = wrapper.find('[data-test="stack-card"]')
    expect(stackCard.exists()).toBe(true)
    expect(stackCard.text()).toContain('Vue 3')
    expect(stackCard.text()).toContain('Quasar')
    expect(stackCard.text()).toContain('Express.js')
    expect(stackCard.text()).toContain('Prisma')
  })
})
