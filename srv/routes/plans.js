const { validate, validateQuery } = require('../server/input-validation')
const { authorize } = require('../server/authentication/authorization')
const service = require('../services/plans')

module.exports = (app) => {
  app.get('/api/plans', validateQuery({
    search: { type: 'STRING' },
    onlyFavorites: { type: 'BOOLEAN' },
    onlyOwn: { type: 'BOOLEAN' },
    onlySystem: { type: 'BOOLEAN' },
    muscleGroups: { type: 'STRING' },
    count: { type: 'BOOLEAN' },
    skip: { type: 'NUMBER' }
  }), service.getPlans)

  app.get('/api/plans/:id', service.getPlan)

  app.post('/api/plans', authorize(['user']), validate({
    name: { type: 'STRING', required: true },
    description: { type: 'STRING' }
  }), service.createPlan)

  app.patch('/api/plans/:id', authorize(['user']), validate({
    name: { type: 'STRING' },
    description: { type: 'STRING' }
  }), service.updatePlan)

  app.delete('/api/plans/:id', authorize(['user']), service.deletePlan)

  app.post('/api/plans/:id/copy', authorize(['user']), service.copyPlan)

  app.post('/api/plans/:id/exercises', authorize(['user']), validate({
    exerciseId: { type: 'STRING', required: true },
    sets: { type: 'NUMBER' },
    minReps: { type: 'NUMBER' },
    maxReps: { type: 'NUMBER' },
    targetWeight: { type: 'NUMBER' },
    restSeconds: { type: 'NUMBER' },
    restAfterSeconds: { type: 'NUMBER' },
    notes: { type: 'STRING' }
  }), service.addExercise)

  // reorder must be before :exerciseId to avoid route collision
  app.patch('/api/plans/:id/exercises/reorder', authorize(['user']), validate({
    order: { type: 'ARRAY', required: true }
  }), service.reorderExercises)

  app.patch('/api/plans/:id/exercises/:exerciseId', authorize(['user']), validate({
    sets: { type: 'NUMBER' },
    minReps: { type: 'NUMBER' },
    maxReps: { type: 'NUMBER' },
    targetWeight: { type: 'NUMBER' },
    restSeconds: { type: 'NUMBER' },
    restAfterSeconds: { type: 'NUMBER' },
    notes: { type: 'STRING' }
  }), service.updatePlanExercise)

  app.delete('/api/plans/:id/exercises/:exerciseId', authorize(['user']), service.removeExercise)

  app.post('/api/plans/:id/favorite', authorize(['user']), service.addFavorite)
  app.delete('/api/plans/:id/favorite', authorize(['user']), service.removeFavorite)
}
