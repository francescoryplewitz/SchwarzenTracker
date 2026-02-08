const { validateQuery } = require('../server/input-validation')
const { authorize } = require('../server/authentication/authorization')
const service = require('../services/stats')

module.exports = (app) => {
  app.get('/api/stats/workouts-trend', authorize(['user']), validateQuery({
    range: { type: 'STRING' }
  }), service.getWorkoutsTrend)

  app.get('/api/stats/exercise-trend', authorize(['user']), validateQuery({
    range: { type: 'STRING' },
    exerciseId: { type: 'STRING' },
    planId: { type: 'STRING' },
    dayType: { type: 'STRING' }
  }), service.getExerciseTrend)

  app.get('/api/stats/muscle-group-trend', authorize(['user']), validateQuery({
    range: { type: 'STRING' },
    muscleGroup: { type: 'STRING', required: true }
  }), service.getMuscleGroupTrend)
}
