const {
  exerciseListItemMatcher,
  exerciseDetailMatcher,
  variantMatcher,
  exerciseMutationMatcher,
  forkedExerciseMatcher,
  validateAgainstMatcher
} = require('./matchers/exercises')

const { GET, POST, PATCH, DELETE } = server.httpOperations()

describe('Exercise API Contract Tests', () => {
  let createdExerciseId
  let systemExerciseId
  let createdVariantId

  before(async function () {
    await server.checkConnection()
    await server.reset()
    server.setService('/api')
    await server.setAuth('admin')
  })

  describe('GET /exercises - List Response Structure', () => {
    it('should return array of exercises matching list item structure', async () => {
      const result = await GET('/exercises')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data.length).to.be.greaterThan(0)

      // Validate first exercise matches expected structure
      const exercise = result.data[0]
      const errors = validateAgainstMatcher(exercise, exerciseListItemMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty

      // Store for later tests
      systemExerciseId = exercise.id
    })

    it('should include _count.variants in list response', async () => {
      const result = await GET('/exercises')
      expect(result.status).to.equal(200)

      const exercise = result.data[0]
      expect(exercise).to.have.property('_count')
      expect(exercise._count).to.have.property('variants')
      expect(exercise._count.variants).to.be.a('number')
    })

    it('should have muscleGroups as array of strings', async () => {
      const result = await GET('/exercises')
      const exercise = result.data[0]

      expect(exercise.muscleGroups).to.be.an('array')
      exercise.muscleGroups.forEach(mg => {
        expect(mg).to.be.a('string')
      })
    })
  })

  describe('GET /exercises/:id - Detail Response Structure', () => {
    it('should return exercise matching detail structure', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.status).to.equal(200)

      const errors = validateAgainstMatcher(result.data, exerciseDetailMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty
    })

    it('should include variants array in detail response', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.data).to.have.property('variants')
      expect(result.data.variants).to.be.an('array')
    })

    it('should include images array in detail response', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.data).to.have.property('images')
      expect(result.data.images).to.be.an('array')
    })

    it('should include isFavorite boolean in detail response', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.data).to.have.property('isFavorite')
      expect(result.data.isFavorite).to.be.a('boolean')
    })
  })

  describe('POST /exercises - Create Response Structure', () => {
    it('should return created exercise matching mutation structure', async () => {
      const newExercise = {
        name: 'Provider Test Exercise',
        description: 'Test description for provider test',
        muscleGroups: ['CHEST', 'TRICEPS'],
        category: 'COMPOUND',
        equipment: 'BARBELL'
      }

      const result = await POST('/exercises', newExercise)
      expect(result.status).to.equal(201)

      const errors = validateAgainstMatcher(result.data, exerciseMutationMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty

      createdExerciseId = result.data.id
    })

    it('should set isSystem to false for user-created exercises', async () => {
      const result = await GET(`/exercises/${createdExerciseId}`)
      expect(result.data.isSystem).to.equal(false)
    })
  })

  describe('PATCH /exercises/:id - Update Response Structure', () => {
    it('should return updated exercise matching mutation structure', async () => {
      const result = await PATCH(`/exercises/${createdExerciseId}`, {
        name: 'Updated Provider Test Exercise'
      })
      expect(result.status).to.equal(200)

      const errors = validateAgainstMatcher(result.data, exerciseMutationMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty
    })
  })

  describe('POST /exercises/:id/fork - Fork Response Structure', () => {
    it('should return forked exercise with forkedFromId', async () => {
      const result = await POST(`/exercises/${systemExerciseId}/fork`)
      expect(result.status).to.equal(201)

      const errors = validateAgainstMatcher(result.data, forkedExerciseMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty

      expect(result.data.forkedFromId).to.equal(systemExerciseId)
    })
  })

  describe('POST /exercises/:id/variants - Variant Response Structure', () => {
    it('should return created variant matching variant structure', async () => {
      const variant = {
        title: 'Provider Test Variant',
        description: 'Test variant for provider test',
        equipment: 'DUMBBELL'
      }

      const result = await POST(`/exercises/${systemExerciseId}/variants`, variant)
      expect(result.status).to.equal(201)

      const errors = validateAgainstMatcher(result.data, variantMatcher)
      expect(errors, `Structure validation failed: ${errors.join(', ')}`).to.be.empty

      createdVariantId = result.data.id
    })

    it('should include exerciseId in variant response', async () => {
      const variant = {
        title: 'Another Variant',
        description: 'Another test variant'
      }

      const result = await POST(`/exercises/${systemExerciseId}/variants`, variant)
      expect(result.data.exerciseId).to.equal(systemExerciseId)
    })
  })

  describe('POST/DELETE /exercises/:id/favorite - Favorite Response Structure', () => {
    it('should return 201 with empty body on favorite add', async () => {
      const result = await POST(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(201)
    })

    it('should update isFavorite in detail response after adding', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.data.isFavorite).to.equal(true)
    })

    it('should return 204 on favorite removal', async () => {
      const result = await DELETE(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(204)
    })
  })

  describe('DELETE /exercises/:id - Delete Response Structure', () => {
    it('should return 204 on successful deletion', async () => {
      const result = await DELETE(`/exercises/${createdExerciseId}`)
      expect(result.status).to.equal(204)
    })
  })
})
