const { GET, POST, PATCH, DELETE } = server.httpOperations()

describe('Workout endpoints', () => {
  let testPlanId
  let testExerciseId
  let createdWorkoutId

  before(async function () {
    await server.checkConnection()
    await server.reset()
    server.setService('/api')
    await server.setAuth('admin')

    // Create exercise for testing
    const exerciseResult = await POST('/exercises', {
      name: 'Workout Test Exercise',
      description: 'Test',
      category: 'COMPOUND',
      muscleGroups: ['CHEST']
    })
    testExerciseId = exerciseResult.data.id

    // Create plan for testing
    const planResult = await POST('/plans', {
      name: 'Workout Test Plan',
      description: 'Test plan for workouts'
    })
    testPlanId = planResult.data.id

    // Add exercises to plan
    await POST(`/plans/${testPlanId}/exercises`, {
      exerciseId: testExerciseId,
      sets: 3,
      minReps: 8,
      maxReps: 12,
      restSeconds: 60
    })
  })

  describe('POST /workouts', () => {
    it('should create a workout from own plan', async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      expect(result.status).to.equal(201)
      expect(result.data).to.have.property('id')
      expect(result.data.planId).to.equal(testPlanId)
      expect(result.data.planName).to.equal('Workout Test Plan')
      expect(result.data.status).to.equal('IN_PROGRESS')
      expect(result.data.sets).to.be.an('array')
      expect(result.data.sets).to.have.length(3) // 3 sets from plan
      createdWorkoutId = result.data.id
    })

    it('should not allow creating second active workout', async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      expect(result.status).to.equal(400)
      expect(result.data.error).to.include('aktives Workout')
    })

    it('should return 404 for non-existent plan', async () => {
      // First complete the active workout
      await PATCH(`/workouts/${createdWorkoutId}`, { action: 'complete', forceComplete: true })

      const result = await POST('/workouts', { planId: 'non-existent-plan-id' })
      expect(result.status).to.equal(404)
    })

    it('should allow creating workout from system plan', async () => {
      const plansResult = await GET('/plans?onlySystem=true')
      if (plansResult.data.length > 0) {
        const systemPlanId = plansResult.data[0].id
        const result = await POST('/workouts', { planId: systemPlanId })
        expect(result.status).to.equal(201)
        expect(result.data.status).to.equal('IN_PROGRESS')
        // Clean up
        await PATCH(`/workouts/${result.data.id}`, { action: 'abandon' })
      }
    })

    it('should return 403 for plan owned by another user', async () => {
      // Create a plan as admin
      const planResult = await POST('/plans', {
        name: 'Admin Plan',
        description: 'Test'
      })
      const adminPlanId = planResult.data.id

      // Switch to standard user
      await server.setAuth('standard')

      const result = await POST('/workouts', { planId: adminPlanId })
      expect(result.status).to.equal(403)

      // Switch back to admin
      await server.setAuth('admin')
    })

    it('should snapshot target values from plan exercises', async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      expect(result.status).to.equal(201)

      const firstSet = result.data.sets[0]
      expect(firstSet.targetMinReps).to.equal(8)
      expect(firstSet.targetMaxReps).to.equal(12)
      expect(firstSet.restSeconds).to.equal(60)
      expect(firstSet.setNumber).to.equal(1)

      createdWorkoutId = result.data.id
    })
  })

  describe('GET /workouts', () => {
    it('should return list of workouts', async () => {
      const result = await GET('/workouts')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      result.data.forEach(workout => {
        expect(workout).to.have.property('id')
        expect(workout).to.have.property('planName')
        expect(workout).to.have.property('status')
        expect(workout).to.have.property('duration')
        expect(workout).to.have.property('setsCompleted')
        expect(workout).to.have.property('totalSets')
      })
    })

    it('should filter by status', async () => {
      const result = await GET('/workouts?status=COMPLETED')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
      result.data.forEach(workout => {
        expect(workout.status).to.equal('COMPLETED')
      })
    })

    it('should return count when count=true', async () => {
      const result = await GET('/workouts?count=true')
      expect(result.status).to.equal(200)
      const count = parseInt(result.data)
      expect(count).to.be.a('number')
      expect(count).to.be.at.least(0)
    })

    it('should support pagination', async () => {
      const result = await GET('/workouts?skip=0')
      expect(result.status).to.equal(200)
      expect(result.data).to.be.an('array')
    })
  })

  describe('GET /workouts/active', () => {
    it('should return active workout', async () => {
      const result = await GET('/workouts/active')
      expect(result.status).to.equal(200)
      if (result.data) {
        expect(result.data.status).to.be.oneOf(['IN_PROGRESS', 'PAUSED'])
        expect(result.data).to.have.property('sets')
      }
    })

    it('should return null when no active workout', async () => {
      // Complete the active workout first
      if (createdWorkoutId) {
        await PATCH(`/workouts/${createdWorkoutId}`, { action: 'complete', forceComplete: true })
      }

      const result = await GET('/workouts/active')
      expect(result.status).to.equal(200)
      // res.send(null) returns empty string, so check for falsy value
      expect(result.data).to.satisfy(v => !v || v === null)
    })
  })

  describe('GET /workouts/:id', () => {
    let workoutIdForGet

    before(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      workoutIdForGet = result.data.id
    })

    it('should return workout with sets', async () => {
      const result = await GET(`/workouts/${workoutIdForGet}`)
      expect(result.status).to.equal(200)
      expect(result.data).to.have.property('id', workoutIdForGet)
      expect(result.data).to.have.property('sets')
      expect(result.data.sets).to.be.an('array')
      expect(result.data.sets[0]).to.have.property('planExercise')
      expect(result.data.sets[0].planExercise).to.have.property('exercise')
    })

    it('should include exercise userNote when available', async () => {
      await PATCH(`/exercises/${testExerciseId}/note`, { note: 'Don\'t bounce the reps' })
      const result = await GET(`/workouts/${workoutIdForGet}`)
      expect(result.status).to.equal(200)
      expect(result.data.sets[0].planExercise.exercise.userNote).to.equal('Don\'t bounce the reps')
      await PATCH(`/exercises/${testExerciseId}/note`, { note: '' })
    })

    it('should return 404 for non-existent workout', async () => {
      const result = await GET('/workouts/non-existent-id')
      expect(result.status).to.equal(404)
    })

    it('should return 403 for workout owned by another user', async () => {
      // Switch to standard user
      await server.setAuth('standard')

      const result = await GET(`/workouts/${workoutIdForGet}`)
      expect(result.status).to.equal(403)

      // Switch back to admin
      await server.setAuth('admin')
    })

    after(async () => {
      if (workoutIdForGet) {
        await PATCH(`/workouts/${workoutIdForGet}`, { action: 'complete', forceComplete: true })
      }
    })
  })

  describe('PATCH /workouts/:id (status changes)', () => {
    let statusWorkoutId

    beforeEach(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      statusWorkoutId = result.data.id
    })

    afterEach(async () => {
      if (statusWorkoutId) {
        try {
          await DELETE(`/workouts/${statusWorkoutId}`)
        } catch (e) {
          // Ignore if already deleted
        }
      }
    })

    it('should pause an in-progress workout', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'pause' })
      expect(result.status).to.equal(200)
      expect(result.data.status).to.equal('PAUSED')
      expect(result.data.pausedAt).to.not.equal(null)
    })

    it('should resume a paused workout', async () => {
      await PATCH(`/workouts/${statusWorkoutId}`, { action: 'pause' })

      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'resume' })
      expect(result.status).to.equal(200)
      expect(result.data.status).to.equal('IN_PROGRESS')
      expect(result.data.pausedAt).to.equal(null)
      expect(result.data.totalPausedMs).to.be.at.least(0)
    })

    it('should complete a workout', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'complete', forceComplete: true })
      expect(result.status).to.equal(200)
      expect(result.data.status).to.equal('COMPLETED')
      expect(result.data.completedAt).to.not.equal(null)
    })

    it('should require forceComplete when sets are missing', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'complete' })
      expect(result.status).to.equal(409)
      expect(result.data.error).to.include('Nicht alle Sätze')
    })

    it('should abandon a workout', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'abandon' })
      expect(result.status).to.equal(200)
      expect(result.data.status).to.equal('ABANDONED')
      expect(result.data.completedAt).to.not.equal(null)
    })

    it('should not pause an already paused workout', async () => {
      await PATCH(`/workouts/${statusWorkoutId}`, { action: 'pause' })
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'pause' })
      expect(result.status).to.equal(400)
    })

    it('should not resume an in-progress workout', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'resume' })
      expect(result.status).to.equal(400)
    })

    it('should return 404 for non-existent workout', async () => {
      const result = await PATCH('/workouts/non-existent-id', { action: 'complete', forceComplete: true })
      expect(result.status).to.equal(404)
    })

    it('should return 403 for workout owned by another user', async () => {
      await server.setAuth('standard')

      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'complete', forceComplete: true })
      expect(result.status).to.equal(403)

      await server.setAuth('admin')
    })

    it('should return 400 for invalid action', async () => {
      const result = await PATCH(`/workouts/${statusWorkoutId}`, { action: 'invalid' })
      expect(result.status).to.equal(400)
    })
  })

  describe('PATCH /workouts/:id/sets/:setId', () => {
    let setWorkoutId
    let testSetId

    before(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      setWorkoutId = result.data.id
      testSetId = result.data.sets[0].id
    })

    it('should update set weight and reps', async () => {
      const result = await PATCH(`/workouts/${setWorkoutId}/sets/${testSetId}`, {
        weight: 80.5,
        reps: 10
      })
      expect(result.status).to.equal(200)
      expect(result.data.weight).to.equal(80.5)
      expect(result.data.reps).to.equal(10)
    })

    it('should update only weight', async () => {
      const result = await PATCH(`/workouts/${setWorkoutId}/sets/${testSetId}`, {
        weight: 85
      })
      expect(result.status).to.equal(200)
      expect(result.data.weight).to.equal(85)
    })

    it('should update only reps', async () => {
      const result = await PATCH(`/workouts/${setWorkoutId}/sets/${testSetId}`, {
        reps: 12
      })
      expect(result.status).to.equal(200)
      expect(result.data.reps).to.equal(12)
    })

    it('should return 404 for non-existent workout', async () => {
      const result = await PATCH(`/workouts/non-existent-id/sets/${testSetId}`, {
        weight: 80
      })
      expect(result.status).to.equal(404)
    })

    it('should return 404 for non-existent set', async () => {
      const result = await PATCH(`/workouts/${setWorkoutId}/sets/non-existent-set`, {
        weight: 80
      })
      expect(result.status).to.equal(404)
    })

    it('should return 403 for workout owned by another user', async () => {
      await server.setAuth('standard')

      const result = await PATCH(`/workouts/${setWorkoutId}/sets/${testSetId}`, {
        weight: 80
      })
      expect(result.status).to.equal(403)

      await server.setAuth('admin')
    })

    after(async () => {
      if (setWorkoutId) {
        await PATCH(`/workouts/${setWorkoutId}`, { action: 'complete', forceComplete: true })
      }
    })
  })

  describe('POST /workouts/:id/sets/:setId/complete', () => {
    let completeWorkoutId
    let completeSetId
    let secondSetId

    before(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      completeWorkoutId = result.data.id
      completeSetId = result.data.sets[0].id
      secondSetId = result.data.sets[1].id
    })

    it('should complete a set and return rest time', async () => {
      const result = await POST(`/workouts/${completeWorkoutId}/sets/${completeSetId}/complete`)
      expect(result.status).to.equal(200)
      expect(result.data.set.completedAt).to.not.equal(null)
      expect(result.data).to.have.property('restSeconds')
      expect(result.data).to.have.property('nextSetId')
      expect(result.data.nextSetId).to.equal(secondSetId)
    })

    it('should not complete an already completed set', async () => {
      const result = await POST(`/workouts/${completeWorkoutId}/sets/${completeSetId}/complete`)
      expect(result.status).to.equal(400)
      expect(result.data.error).to.include('bereits abgeschlossen')
    })

    it('should return null nextSetId for last set', async () => {
      // Complete second set
      await POST(`/workouts/${completeWorkoutId}/sets/${secondSetId}/complete`)

      // Get workout to find last set
      const workoutResult = await GET(`/workouts/${completeWorkoutId}`)
      const lastSet = workoutResult.data.sets[workoutResult.data.sets.length - 1]

      const result = await POST(`/workouts/${completeWorkoutId}/sets/${lastSet.id}/complete`)
      expect(result.status).to.equal(200)
      expect(result.data.nextSetId).to.equal(null)
    })

    it('should return 404 for non-existent workout', async () => {
      const result = await POST(`/workouts/non-existent-id/sets/${completeSetId}/complete`)
      expect(result.status).to.equal(404)
    })

    it('should return 404 for non-existent set', async () => {
      const result = await POST(`/workouts/${completeWorkoutId}/sets/non-existent-set/complete`)
      expect(result.status).to.equal(404)
    })

    it('should return 403 for workout owned by another user', async () => {
      await server.setAuth('standard')

      const result = await POST(`/workouts/${completeWorkoutId}/sets/${completeSetId}/complete`)
      expect(result.status).to.equal(403)

      await server.setAuth('admin')
    })

    after(async () => {
      if (completeWorkoutId) {
        await PATCH(`/workouts/${completeWorkoutId}`, { action: 'complete', forceComplete: true })
      }
    })
  })

  describe('DELETE /workouts/:id', () => {
    let deleteWorkoutId

    beforeEach(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      deleteWorkoutId = result.data.id
      // Complete it so we can create another one if needed
      await PATCH(`/workouts/${deleteWorkoutId}`, { action: 'complete', forceComplete: true })
    })

    it('should delete own workout', async () => {
      const result = await DELETE(`/workouts/${deleteWorkoutId}`)
      expect(result.status).to.equal(204)

      // Verify it's deleted
      const getResult = await GET(`/workouts/${deleteWorkoutId}`)
      expect(getResult.status).to.equal(404)
    })

    it('should return 404 for non-existent workout', async () => {
      const result = await DELETE('/workouts/non-existent-id')
      expect(result.status).to.equal(404)
    })

    it('should return 403 for workout owned by another user', async () => {
      await server.setAuth('standard')

      const result = await DELETE(`/workouts/${deleteWorkoutId}`)
      expect(result.status).to.equal(403)

      await server.setAuth('admin')
    })
  })

  describe('Workout duration calculation', () => {
    let durationWorkoutId

    before(async () => {
      const result = await POST('/workouts', { planId: testPlanId })
      durationWorkoutId = result.data.id
    })

    it('should calculate duration for in-progress workout', async () => {
      // Wait a bit to accumulate some time
      await new Promise(resolve => setTimeout(resolve, 100))

      const result = await GET('/workouts')
      const workout = result.data.find(w => w.id === durationWorkoutId)
      expect(workout).to.exist
      expect(workout.duration).to.be.at.least(0)
    })

    it('should calculate correct duration after pause/resume', async () => {
      // Pause workout
      await PATCH(`/workouts/${durationWorkoutId}`, { action: 'pause' })

      // Wait while paused
      await new Promise(resolve => setTimeout(resolve, 100))

      // Resume
      await PATCH(`/workouts/${durationWorkoutId}`, { action: 'resume' })

      const result = await GET(`/workouts/${durationWorkoutId}`)
      expect(result.data.totalPausedMs).to.be.at.least(0)
    })

    after(async () => {
      if (durationWorkoutId) {
        await PATCH(`/workouts/${durationWorkoutId}`, { action: 'complete', forceComplete: true })
      }
    })
  })
})
