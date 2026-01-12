const { GET, POST, PATCH, DELETE } = server.httpOperations()

describe('Exercise endpoints', () => {
  let createdExerciseId
  let systemExerciseId

  before(async function () {
    await server.checkConnection()
    await server.reset()
    server.setService('/api')
    await server.setAuth('admin')
  })

  describe('GET /exercises', () => {
    it('should return list of exercises', async () => {
      const result = await GET('/exercises')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data.length).to.be.greaterThan(0)
      systemExerciseId = result.data[0].id
    })

    it('should filter by muscleGroup', async () => {
      const result = await GET('/exercises?muscleGroup=CHEST')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      result.data.forEach(exercise => {
        expect(exercise.muscleGroups).to.include('CHEST')
      })
    })

    it('should filter by equipment', async () => {
      const result = await GET('/exercises?equipment=BARBELL')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      result.data.forEach(exercise => {
        expect(exercise.equipment).to.equal('BARBELL')
      })
    })

    it('should filter by category', async () => {
      const result = await GET('/exercises?category=COMPOUND')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      result.data.forEach(exercise => {
        expect(exercise.category).to.equal('COMPOUND')
      })
    })

    it('should search by name', async () => {
      const result = await GET('/exercises?search=Bank')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      expect(result.data.length).to.be.greaterThan(0)
    })

    it('should return count when requested', async () => {
      const result = await GET('/exercises?count=true')
      expect(result.status).to.equal(200)
      expect(parseInt(result.data)).to.be.a('number')
    })

    it('should support pagination with skip', async () => {
      const firstPage = await GET('/exercises?skip=0')
      const secondPage = await GET('/exercises?skip=5')
      expect(firstPage.status).to.equal(200)
      expect(secondPage.status).to.equal(200)
      if (firstPage.data.length > 5 && secondPage.data.length > 0) {
        expect(firstPage.data[0].id).to.not.equal(secondPage.data[0].id)
      }
    })
  })

  describe('GET /exercises/:id', () => {
    it('should return single exercise with details', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.status).to.equal(200)
      expect(result.data).to.have.property('id', systemExerciseId)
      expect(result.data).to.have.property('name')
      expect(result.data).to.have.property('description')
      expect(result.data).to.have.property('muscleGroups')
      expect(result.data).to.have.property('category')
    })

    it('should return 404 for non-existent exercise', async () => {
      const result = await GET('/exercises/non-existent-id')
      expect(result.status).to.equal(404)
    })
  })

  describe('POST /exercises', () => {
    it('should create new exercise', async () => {
      const newExercise = {
        name: 'Test Exercise',
        description: 'Test description',
        muscleGroups: ['CHEST', 'TRICEPS'],
        category: 'COMPOUND',
        equipment: 'DUMBBELL'
      }
      const result = await POST('/exercises', newExercise)
      expect(result.status).to.equal(201)
      expect(result.data).to.have.property('id')
      expect(result.data.name).to.equal('Test Exercise')
      expect(result.data.isSystem).to.equal(false)
      createdExerciseId = result.data.id
    })

    it('should require name field', async () => {
      const result = await POST('/exercises', {
        category: 'COMPOUND'
      })
      expect(result.status).to.equal(400)
    })

    it('should require category field', async () => {
      const result = await POST('/exercises', {
        name: 'Test'
      })
      expect(result.status).to.equal(400)
    })
  })

  describe('PATCH /exercises/:id', () => {
    it('should update own exercise', async () => {
      const result = await PATCH(`/exercises/${createdExerciseId}`, {
        name: 'Updated Exercise Name'
      })
      expect(result.status).to.equal(200)
      expect(result.data.name).to.equal('Updated Exercise Name')
    })

    it('should return 404 for non-existent exercise', async () => {
      const result = await PATCH('/exercises/non-existent-id', {
        name: 'Test'
      })
      expect(result.status).to.equal(404)
    })

    it('should return 403 when editing system exercise', async () => {
      const result = await PATCH(`/exercises/${systemExerciseId}`, {
        name: 'Hacked Name'
      })
      expect(result.status).to.equal(403)
    })
  })

  describe('POST /exercises/:id/fork', () => {
    it('should fork existing exercise', async () => {
      const result = await POST(`/exercises/${systemExerciseId}/fork`)
      expect(result.status).to.equal(201)
      expect(result.data).to.have.property('id')
      expect(result.data.forkedFromId).to.equal(systemExerciseId)
      expect(result.data.isSystem).to.equal(false)
    })

    it('should return 404 for non-existent exercise', async () => {
      const result = await POST('/exercises/non-existent-id/fork')
      expect(result.status).to.equal(404)
    })
  })

  describe('POST /exercises/:id/variants', () => {
    it('should create variant for existing exercise', async () => {
      const variant = {
        title: 'Schrägbank Variante',
        description: 'Schrägbank Version'
      }
      const result = await POST(`/exercises/${systemExerciseId}/variants`, variant)
      expect(result.status).to.equal(201)
      expect(result.data.exerciseId).to.equal(systemExerciseId)
    })

    it('should return 404 for non-existent parent exercise', async () => {
      const result = await POST('/exercises/non-existent-id/variants', {
        title: 'Variant'
      })
      expect(result.status).to.equal(404)
    })
  })

  describe('POST/DELETE /exercises/:id/favorite', () => {
    it('should add exercise to favorites', async () => {
      const result = await POST(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(201)
    })

    it('should not fail when adding already favorited exercise', async () => {
      const result = await POST(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(201)
    })

    it('should show isFavorite in exercise detail', async () => {
      const result = await GET(`/exercises/${systemExerciseId}`)
      expect(result.status).to.equal(200)
      expect(result.data.isFavorite).to.equal(true)
    })

    it('should remove exercise from favorites', async () => {
      const result = await DELETE(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(204)
    })

    it('should return 404 when removing non-existent favorite', async () => {
      const result = await DELETE(`/exercises/${systemExerciseId}/favorite`)
      expect(result.status).to.equal(404)
    })

    it('should return 404 for non-existent exercise', async () => {
      const result = await POST('/exercises/non-existent-id/favorite')
      expect(result.status).to.equal(404)
    })
  })

  describe('DELETE /exercises/:id', () => {
    it('should return 403 when deleting system exercise', async () => {
      const result = await DELETE(`/exercises/${systemExerciseId}`)
      expect(result.status).to.equal(403)
    })

    it('should delete own exercise', async () => {
      const result = await DELETE(`/exercises/${createdExerciseId}`)
      expect(result.status).to.equal(204)
    })

    it('should return 404 after deletion', async () => {
      const result = await GET(`/exercises/${createdExerciseId}`)
      expect(result.status).to.equal(404)
    })

    it('should return 404 for non-existent exercise', async () => {
      const result = await DELETE('/exercises/non-existent-id')
      expect(result.status).to.equal(404)
    })
  })
})
