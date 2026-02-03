const { expect } = require('chai')

// Mock Logger since server is not running
global.Logger = class {
  constructor() {}
  info() {}
  error() {}
  warn() {}
  debug() {}
}

const { buildExerciseWhere, buildExerciseQuery } = require('../../srv/services/exercises')

// Helper to create mock request
const createMockReq = (query = {}, session = {}) => ({
  query,
  session
})

describe('Exercise Service Helper Functions', () => {
  describe('buildExerciseWhere', () => {
    it('should return empty where object when no filters', () => {
      const req = createMockReq({})
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.deep.equal({})
    })

    it('should filter by search term', () => {
      const req = createMockReq({ search: 'Press' })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('OR')
      expect(where.OR).to.deep.equal([
        { name: { contains: 'Press', mode: 'insensitive' } },
        { translations: { some: { locale: 'en', name: { contains: 'Press', mode: 'insensitive' } } } }
      ])
    })

    it('should filter by muscleGroup', () => {
      const req = createMockReq({ muscleGroup: 'CHEST' })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('muscleGroups')
      expect(where.muscleGroups).to.deep.equal({ has: 'CHEST' })
    })

    it('should filter by equipment', () => {
      const req = createMockReq({ equipment: 'BARBELL' })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('equipment', 'BARBELL')
    })

    it('should filter by category', () => {
      const req = createMockReq({ category: 'COMPOUND' })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('category', 'COMPOUND')
    })

    it('should filter by onlyFavorites when user is logged in', () => {
      const req = createMockReq(
        { onlyFavorites: true },
        { user: { id: 1 } }
      )
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('userFavorites')
      expect(where.userFavorites).to.deep.equal({ some: { userId: 1 } })
    })

    it('should not filter by onlyFavorites when user is not logged in', () => {
      const req = createMockReq({ onlyFavorites: true })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.not.have.property('userFavorites')
    })

    it('should filter by onlyOwn when user is logged in', () => {
      const req = createMockReq(
        { onlyOwn: true },
        { user: { id: 1 } }
      )
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('createdById', 1)
    })

    it('should not filter by onlyOwn when user is not logged in', () => {
      const req = createMockReq({ onlyOwn: true })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.not.have.property('createdById')
    })

    it('should combine multiple filters', () => {
      const req = createMockReq({
        search: 'Press',
        muscleGroup: 'CHEST',
        equipment: 'BARBELL',
        category: 'COMPOUND'
      })
      const where = buildExerciseWhere(req, 'en')
      expect(where).to.have.property('OR')
      expect(where).to.have.property('muscleGroups')
      expect(where).to.have.property('equipment', 'BARBELL')
      expect(where).to.have.property('category', 'COMPOUND')
    })
  })

  describe('buildExerciseQuery', () => {
    it('should return query with default values', () => {
      const req = createMockReq({})
      const query = buildExerciseQuery(req)
      expect(query).to.have.property('where')
      expect(query).to.have.property('orderBy')
      expect(query.orderBy).to.deep.equal({ name: 'asc' })
      expect(query).to.have.property('take', 30)
      expect(query).to.have.property('skip', 0)
      expect(query).to.have.property('include')
    })

    it('should include variants count', () => {
      const req = createMockReq({})
      const query = buildExerciseQuery(req)
      expect(query.include).to.have.property('variants')
      expect(query.include).to.have.property('_count')
    })

    it('should handle skip parameter', () => {
      const req = createMockReq({ skip: 10 })
      const query = buildExerciseQuery(req)
      expect(query).to.have.property('skip', 10)
    })

    it('should handle invalid skip parameter', () => {
      const req = createMockReq({ skip: 'invalid' })
      const query = buildExerciseQuery(req)
      expect(query).to.have.property('skip', 0)
    })

    it('should pass filters to where clause', () => {
      const req = createMockReq({ muscleGroup: 'BACK' })
      const query = buildExerciseQuery(req)
      expect(query.where).to.have.property('muscleGroups')
      expect(query.where.muscleGroups).to.deep.equal({ has: 'BACK' })
    })

    it('should handle zero skip', () => {
      const req = createMockReq({ skip: 0 })
      const query = buildExerciseQuery(req)
      expect(query).to.have.property('skip', 0)
    })

    it('should handle negative skip as 0', () => {
      const req = createMockReq({ skip: -5 })
      const query = buildExerciseQuery(req)
      expect(query).to.have.property('skip', 0)
    })
  })
})
