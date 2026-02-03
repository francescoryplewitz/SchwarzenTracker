import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import ExerciseForm from 'src/components/exercises/exerciseForm.vue'
import { mountWithQuasar } from '../setup/mount-with-quasar.js'
import { singleExercise, createdExercise } from '../fixtures/exercises.js'
import { server } from '../setup/server.js'
import { rest } from 'msw'

const mountComponent = async (exercises = [], options = {}) => {
  const { wrapper } = mountWithQuasar(ExerciseForm, {
    props: {
      exercises
    },
    attachTo: document.body,
    ...options
  })
  await flushPromises()
  return wrapper
}

describe('ExerciseForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    // Clean up any dialogs left in the DOM
    document.body.innerHTML = ''
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
  })

  describe('Create Mode', () => {
    it('opens dialog in create mode with empty form', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      expect(nameInput.value).toBe('')

      const descInput = document.querySelector('[data-test="description-input"]')
      expect(descInput.value).toBe('')
    })

    it('shows correct title for create mode', async () => {
      const wrapper = await mountComponent()

      wrapper.vm.open()
      await flushPromises()

      const title = document.querySelector('[data-test="dialog-title"]')
      expect(title.textContent).toBe('Create exercise')
    })

    it('has save button in create mode', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      expect(saveBtn).not.toBeNull()
    })
  })

  describe('Edit Mode', () => {
    it('has form fields for editing', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      expect(nameInput).not.toBeNull()

      const descInput = document.querySelector('[data-test="description-input"]')
      expect(descInput).not.toBeNull()
    })
  })

  describe('Form Validation', () => {
    it('has required field markers', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      expect(nameInput).not.toBeNull()
    })
  })

  describe('Muscle Groups Multi-Select', () => {
    it('allows multi-select for muscle groups', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const chestBtn = document.querySelector('[data-test="muscle-btn-CHEST"]')
      const backBtn = document.querySelector('[data-test="muscle-btn-BACK"]')

      chestBtn.click()
      await flushPromises()
      backBtn.click()
      await flushPromises()

      expect(chestBtn.classList.contains('active')).toBe(true)
      expect(backBtn.classList.contains('active')).toBe(true)
    })

    it('has muscle group buttons', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const chestBtn = document.querySelector('[data-test="muscle-btn-CHEST"]')
      expect(chestBtn).not.toBeNull()
    })
  })

  describe('Single-Select Fields', () => {
    it('allows single-select for equipment', async () => {
      const wrapper = await mountComponent([])

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

    it('allows single-select for category', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const compoundBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      const isolationBtn = document.querySelector('[data-test="category-btn-ISOLATION"]')

      compoundBtn.click()
      await flushPromises()
      expect(compoundBtn.classList.contains('active')).toBe(true)

      isolationBtn.click()
      await flushPromises()
      expect(compoundBtn.classList.contains('active')).toBe(false)
      expect(isolationBtn.classList.contains('active')).toBe(true)
    })
  })

  describe('Dialog Actions', () => {
    it('has cancel button', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const cancelBtn = document.querySelector('[data-test="cancel-btn"]')
      expect(cancelBtn).not.toBeNull()
    })

    it('has close button', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const closeBtn = document.querySelector('[data-test="close-btn"]')
      expect(closeBtn).not.toBeNull()
    })
  })

  describe('Form Validation', () => {
    it('does not submit when name is empty', async () => {
      let apiCalled = false
      server.use(
        rest.post('http://localhost:5001/api/exercises', (req, res, ctx) => {
          apiCalled = true
          return res(ctx.status(201), ctx.json(createdExercise))
        })
      )

      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const categoryBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      categoryBtn.click()
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(apiCalled).toBe(false)
    })

    it('does not submit when category is not selected', async () => {
      let apiCalled = false
      server.use(
        rest.post('http://localhost:5001/api/exercises', (req, res, ctx) => {
          apiCalled = true
          return res(ctx.status(201), ctx.json(createdExercise))
        })
      )

      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      nameInput.value = 'Test Exercise'
      nameInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(apiCalled).toBe(false)
    })
  })

  describe('Create Exercise API', () => {
    it('calls POST API when creating new exercise', async () => {
      let postCalled = false
      server.use(
        rest.post('http://localhost:5001/api/exercises', (req, res, ctx) => {
          postCalled = true
          return res(ctx.status(201), ctx.json(createdExercise))
        })
      )

      const exercises = []
      const wrapper = await mountComponent(exercises)

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      nameInput.value = 'Neue Übung'
      nameInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const categoryBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      categoryBtn.click()
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(postCalled).toBe(true)
    })

    it('sends correct payload on create', async () => {
      let receivedBody = null
      server.use(
        rest.post('http://localhost:5001/api/exercises', async (req, res, ctx) => {
          receivedBody = await req.json()
          return res(ctx.status(201), ctx.json(createdExercise))
        })
      )

      const wrapper = await mountComponent([])

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      nameInput.value = 'Test Exercise'
      nameInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const descInput = document.querySelector('[data-test="description-input"]')
      descInput.value = 'Test Description'
      descInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const chestBtn = document.querySelector('[data-test="muscle-btn-CHEST"]')
      chestBtn.click()
      await flushPromises()

      const categoryBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      categoryBtn.click()
      await flushPromises()

      const equipmentBtn = document.querySelector('[data-test="equipment-btn-BARBELL"]')
      equipmentBtn.click()
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(receivedBody).toMatchObject({
        name: 'Test Exercise',
        description: 'Test Description',
        muscleGroups: ['CHEST'],
        category: 'COMPOUND',
        equipment: 'BARBELL'
      })
    })

    it('adds created exercise to exercises array', async () => {
      server.use(
        rest.post('http://localhost:5001/api/exercises', (req, res, ctx) => {
          return res(ctx.status(201), ctx.json(createdExercise))
        })
      )

      const exercises = []
      const wrapper = await mountComponent(exercises)

      wrapper.vm.open()
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      nameInput.value = 'Neue Übung'
      nameInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const categoryBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      categoryBtn.click()
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(exercises.length).toBe(1)
      expect(exercises[0].id).toBe('ex-new-1')
    })

  })

  describe('Edit Exercise API', () => {
    it('pre-fills form when opening in edit mode', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open(singleExercise)
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      expect(nameInput.value).toBe('Bankdrücken')

      const descInput = document.querySelector('[data-test="description-input"]')
      expect(descInput.value).toContain('Flach auf der Bank')

      const compoundBtn = document.querySelector('[data-test="category-btn-COMPOUND"]')
      expect(compoundBtn.classList.contains('active')).toBe(true)

      const barbellBtn = document.querySelector('[data-test="equipment-btn-BARBELL"]')
      expect(barbellBtn.classList.contains('active')).toBe(true)
    })

    it('shows correct title for edit mode', async () => {
      const wrapper = await mountComponent([])

      wrapper.vm.open(singleExercise)
      await flushPromises()

      const title = document.querySelector('[data-test="dialog-title"]')
      expect(title.textContent).toBe('Edit exercise')
    })

    it('calls PATCH API when editing exercise', async () => {
      let patchCalled = false
      let patchUrl = ''
      server.use(
        rest.patch('http://localhost:5001/api/exercises/:id', (req, res, ctx) => {
          patchCalled = true
          patchUrl = req.url.pathname
          return res(ctx.status(200), ctx.json({ ...singleExercise, name: 'Updated Name' }))
        })
      )

      const wrapper = await mountComponent([])

      wrapper.vm.open(singleExercise)
      await flushPromises()

      const nameInput = document.querySelector('[data-test="name-input"]')
      nameInput.value = 'Updated Name'
      nameInput.dispatchEvent(new Event('input'))
      await flushPromises()

      const saveBtn = document.querySelector('[data-test="save-btn"]')
      saveBtn.click()
      await flushPromises()

      expect(patchCalled).toBe(true)
      expect(patchUrl).toBe('/api/exercises/ex-1')
    })
  })
})
