const { validate, validateQuery } = require('../server/input-validation')
const { authorize } = require('../server/authentication/authorization')
const service = require('../services/exercises')

module.exports = (app) => {
  app.get('/api/exercises', validateQuery({
    search: { type: 'STRING' },
    muscleGroup: { type: 'STRING' },
    equipment: { type: 'STRING' },
    category: { type: 'STRING' },
    onlyFavorites: { type: 'BOOLEAN' },
    onlyOwn: { type: 'BOOLEAN' },
    count: { type: 'BOOLEAN' },
    skip: { type: 'NUMBER' }
  }), service.getExercises)

  app.get('/api/exercises/:id', service.getExercise)

  app.post('/api/exercises', authorize(['user']), validate({
    name: { type: 'STRING', required: true },
    description: { type: 'STRING' },
    muscleGroups: { type: 'ARRAY' },
    category: { type: 'STRING', required: true },
    equipment: { type: 'STRING' },
    videoUrl: { type: 'STRING' }
  }), service.createExercise)

  app.patch('/api/exercises/:id', authorize(['user']), validate({
    name: { type: 'STRING' },
    description: { type: 'STRING' },
    muscleGroups: { type: 'ARRAY' },
    category: { type: 'STRING' },
    equipment: { type: 'STRING' },
    videoUrl: { type: 'STRING' }
  }), service.updateExercise)

  app.delete('/api/exercises/:id', authorize(['user']), service.deleteExercise)

  app.post('/api/exercises/:id/fork', authorize(['user']), service.forkExercise)

  app.post('/api/exercises/:id/variants', authorize(['user']), validate({
    title: { type: 'STRING', required: true },
    description: { type: 'STRING' },
    equipment: { type: 'STRING' }
  }), service.addVariant)

  app.post('/api/exercises/:id/favorite', authorize(['user']), service.addFavorite)
  app.delete('/api/exercises/:id/favorite', authorize(['user']), service.removeFavorite)
}
