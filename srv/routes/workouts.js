const { validate, validateQuery } = require('../server/input-validation')
const { authorize } = require('../server/authentication/authorization')
const service = require('../services/workouts')

module.exports = (app) => {
  app.get('/api/workouts', authorize(['user']), validateQuery({
    status: { type: 'STRING' },
    count: { type: 'BOOLEAN' },
    skip: { type: 'NUMBER' }
  }), service.getWorkouts)

  app.get('/api/workouts/active', authorize(['user']), service.getActiveWorkout)

  app.get('/api/workouts/:id', authorize(['user']), service.getWorkout)

  app.post('/api/workouts', authorize(['user']), validate({
    planId: { type: 'STRING', required: true }
  }), service.createWorkout)

  app.patch('/api/workouts/:id', authorize(['user']), validate({
    action: { type: 'STRING', required: true },
    forceComplete: { type: 'BOOLEAN' }
  }), service.updateWorkoutStatus)

  app.patch('/api/workouts/:id/sets/:setId', authorize(['user']), validate({
    weight: { type: 'NUMBER' },
    reps: { type: 'NUMBER' }
  }), service.updateSet)

  app.post('/api/workouts/:id/sets/:setId/complete', authorize(['user']), service.completeSet)

  app.delete('/api/workouts/:id', authorize(['user']), service.deleteWorkout)
}
