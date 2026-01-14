import { describe, expect, it, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExerciseVariantDialog from 'src/components/exercises/exerciseVariantDialog.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'
import { createdVariant } from '../fixtures/exercises.js'
import { server } from '../setup/server.js'
import { rest } from 'msw'

const mountComponent = async (exerciseId = 'ex-1', options = {}) => {
  const { wrapper } = mountWithQuasar(ExerciseVariantDialog, {
    props: {
      exerciseId
    },
    attachTo: document.body,
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('ExerciseVariantDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Dialog Visibility', () => {
    it('dialog is not visible initially', async () => {
      const wrapper = await mountComponent()
      expect(document.querySelector('.form-dialog')).toBeNull()
    })

    it('opens dialog when open() is called', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      expect(document.querySelector('.form-dialog')).not.toBeNull()
    })

    it('shows empty form when opening', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const titleInput = document.querySelector('[data-test="title-input"]')
      expect(titleInput.value).toBe('')

      const descInput = document.querySelector('[data-test="description-input"]')
      expect(descInput.value).toBe('')
    })
  })

  describe('Form Validation', () => {
    it('shows error message when saving with empty title', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const createBtn = document.querySelector('[data-test="create-btn"]')
      createBtn.click()
      await flushPromises()

      const errorText = document.querySelector('[data-test="error-text"]')
      expect(errorText).not.toBeNull()
      expect(errorText.textContent).toContain('Bitte gib einen Namen ein')
    })

    it('shows error styling on title input when validation fails', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const createBtn = document.querySelector('[data-test="create-btn"]')
      createBtn.click()
      await flushPromises()

      const titleInput = document.querySelector('[data-test="title-input"]')
      expect(titleInput.classList.contains('error')).toBe(true)
    })

    it('has title input field', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const titleInput = document.querySelector('[data-test="title-input"]')
      expect(titleInput).not.toBeNull()
    })
  })

  describe('Equipment Selection', () => {
    it('allows single-select for equipment', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const barbellBtn = document.querySelector('[data-test="equipment-btn-BARBELL"]')
      const dumbbellBtn = document.querySelector('[data-test="equipment-btn-DUMBBELL"]')

      barbellBtn.click()
      await flushPromises()
      expect(barbellBtn.classList.contains('active')).toBe(true)

      dumbbellBtn.click()
      await flushPromises()
      expect(barbellBtn.classList.contains('active')).toBe(false)
      expect(dumbbellBtn.classList.contains('active')).toBe(true)
    })

    it('toggles equipment on second click', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const barbellBtn = document.querySelector('[data-test="equipment-btn-BARBELL"]')

      barbellBtn.click()
      await flushPromises()
      expect(barbellBtn.classList.contains('active')).toBe(true)

      barbellBtn.click()
      await flushPromises()
      expect(barbellBtn.classList.contains('active')).toBe(false)
    })
  })

  describe('Create Variant', () => {
    it('creates variant via POST', async () => {
      let postCalled = false
      let postUrl = ''
      server.use(
        rest.post('http://localhost:5001/api/exercises/:id/variants', async (req, res, ctx) => {
          postCalled = true
          postUrl = req.url.pathname
          return res(ctx.status(201), ctx.json(createdVariant))
        })
      )

      const wrapper = await mountComponent('ex-1')

      wrapper.vm.open()
      await flushPromises()

      const titleInput = document.querySelector('[data-test="title-input"]')
      titleInput.value = 'Neue Variante'
      titleInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const createBtn = document.querySelector('[data-test="create-btn"]')
      createBtn.click()
      await flushPromises()

      expect(postCalled).toBe(true)
      expect(postUrl).toBe('/api/exercises/ex-1/variants')
    })

    it('sends correct data on create', async () => {
      let receivedBody = null
      server.use(
        rest.post('http://localhost:5001/api/exercises/:id/variants', async (req, res, ctx) => {
          receivedBody = await req.json()
          return res(ctx.status(201), ctx.json(createdVariant))
        })
      )

      const wrapper = await mountComponent('ex-1')

      wrapper.vm.open()
      await flushPromises()

      const titleInput = document.querySelector('[data-test="title-input"]')
      titleInput.value = 'Neue Variante'
      titleInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const createBtn = document.querySelector('[data-test="create-btn"]')
      createBtn.click()
      await flushPromises()

      expect(receivedBody).toMatchObject({
        title: 'Neue Variante'
      })
    })

    it('has create button in dialog', async () => {
      const wrapper = await mountComponent('ex-1')

      wrapper.vm.open()
      await flushPromises()

      const createBtn = document.querySelector('[data-test="create-btn"]')
      expect(createBtn).not.toBeNull()
    })

    it('has description input', async () => {
      const wrapper = await mountComponent('ex-1')

      wrapper.vm.open()
      await flushPromises()

      const descInput = document.querySelector('[data-test="description-input"]')
      expect(descInput).not.toBeNull()
    })
  })

  describe('Dialog Actions', () => {
    it('has cancel button', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const cancelBtn = document.querySelector('[data-test="cancel-btn"]')
      expect(cancelBtn).not.toBeNull()
    })

    it('has close button', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const closeBtn = document.querySelector('[data-test="close-btn"]')
      expect(closeBtn).not.toBeNull()
    })
  })
})
