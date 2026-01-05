const { expect } = require('chai')

// Mock Logger since server is not running
global.Logger = class {
  constructor() {}
  info() {}
  error() {}
  warn() {}
  debug() {}
}

const { validate, validateQuery, validateParams } = require('../../srv/server/input-validation')

// Helper to create mock request/response/next
const createMockReqResNext = (body = {}, query = {}, params = {}) => {
  const req = { body, query, params }
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(data) {
      this.jsonData = data
      return this
    }
  }
  let nextCalled = false
  const next = () => { nextCalled = true }
  return { req, res, next, wasNextCalled: () => nextCalled }
}

describe('Input Validation', () => {
  describe('validate middleware (request body)', () => {
    describe('STRING type', () => {
      it('should pass valid string', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'John' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(req.body.name).to.equal('John')
      })

      it('should pass empty value for optional string', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({})

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail for non-string value', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 123 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate string length constraint', () => {
        const schema = { code: { type: 'STRING', length: 3 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ code: 'ABC' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail string length constraint', () => {
        const schema = { code: { type: 'STRING', length: 3 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ code: 'ABCD' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate minLength constraint', () => {
        const schema = { name: { type: 'STRING', minLength: 2 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'AB' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail minLength constraint', () => {
        const schema = { name: { type: 'STRING', minLength: 2 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'A' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate maxLength constraint', () => {
        const schema = { name: { type: 'STRING', maxLength: 5 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'John' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail maxLength constraint', () => {
        const schema = { name: { type: 'STRING', maxLength: 3 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'John' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('CLEANSTRING type', () => {
      it('should pass valid clean string', () => {
        const schema = { name: { type: 'CLEANSTRING' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'John Doe' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass string with German umlauts', () => {
        const schema = { name: { type: 'CLEANSTRING' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'Müller Größe' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass string with allowed special chars', () => {
        const schema = { text: { type: 'CLEANSTRING' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ text: 'Test, value-123_here.' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail string with curly braces', () => {
        const schema = { name: { type: 'CLEANSTRING' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'Test{injection}' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail string with pipe character', () => {
        const schema = { name: { type: 'CLEANSTRING' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'test|command' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate maxLength constraint for CLEANSTRING', () => {
        const schema = { name: { type: 'CLEANSTRING', maxLength: 10 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'Short' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail maxLength constraint for CLEANSTRING', () => {
        const schema = { name: { type: 'CLEANSTRING', maxLength: 5 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: 'TooLongString' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('EMAIL type', () => {
      it('should pass valid email', () => {
        const schema = { email: { type: 'EMAIL' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'test@example.com' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail invalid email', () => {
        const schema = { email: { type: 'EMAIL' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'invalid-email' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail email that is not a string', () => {
        const schema = { email: { type: 'EMAIL' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 123 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate minLength constraint for EMAIL', () => {
        const schema = { email: { type: 'EMAIL', minLength: 10 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'test@example.com' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail minLength constraint for EMAIL', () => {
        const schema = { email: { type: 'EMAIL', minLength: 20 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'a@b.com' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate maxLength constraint for EMAIL', () => {
        const schema = { email: { type: 'EMAIL', maxLength: 30 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'test@example.com' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail maxLength constraint for EMAIL', () => {
        const schema = { email: { type: 'EMAIL', maxLength: 10 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: 'verylongemail@example.com' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('BOOLEAN type', () => {
      it('should pass true value', () => {
        const schema = { active: 'BOOLEAN' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: true })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass false value', () => {
        const schema = { active: 'BOOLEAN' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: false })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail string "true"', () => {
        const schema = { active: 'BOOLEAN' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: 'true' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail number 1', () => {
        const schema = { active: 'BOOLEAN' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: 1 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('NUMBER type', () => {
      it('should pass valid number', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: 42 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass zero', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: 0 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass negative number', () => {
        const schema = { value: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ value: -10 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass decimal number', () => {
        const schema = { price: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ price: 19.99 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail string number', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: '42' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail NaN', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: NaN })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail null', () => {
        const schema = { count: { type: 'NUMBER', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should pass min constraint', () => {
        const schema = { age: { type: 'NUMBER', min: 18 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ age: 25 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail min constraint', () => {
        const schema = { age: { type: 'NUMBER', min: 18 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ age: 16 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should pass max constraint', () => {
        const schema = { score: { type: 'NUMBER', max: 100 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ score: 85 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail max constraint', () => {
        const schema = { score: { type: 'NUMBER', max: 100 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ score: 150 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('DATE type', () => {
      it('should pass valid Date object', () => {
        const schema = { createdAt: 'DATE' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ createdAt: new Date() })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail invalid Date object', () => {
        const schema = { createdAt: 'DATE' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ createdAt: new Date('invalid') })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail string date', () => {
        const schema = { createdAt: 'DATE' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ createdAt: '2024-01-01' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('TIMESTAMP type', () => {
      it('should pass ISO date string', () => {
        const schema = { timestamp: { type: 'TIMESTAMP' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ timestamp: '2024-01-15' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass ISO datetime string', () => {
        const schema = { timestamp: { type: 'TIMESTAMP' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ timestamp: '2024-01-15T10:30:00Z' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should pass ISO datetime with milliseconds', () => {
        const schema = { timestamp: { type: 'TIMESTAMP' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ timestamp: '2024-01-15T10:30:00.000Z' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail invalid timestamp format', () => {
        const schema = { timestamp: { type: 'TIMESTAMP' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ timestamp: '15-01-2024' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail non-string timestamp', () => {
        const schema = { timestamp: { type: 'TIMESTAMP' } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ timestamp: 1705312200000 })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('OBJECT type', () => {
      it('should pass valid object', () => {
        const schema = { meta: 'OBJECT' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ meta: { key: 'value' } })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail array as object', () => {
        const schema = { meta: 'OBJECT' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ meta: [1, 2, 3] })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail null as object', () => {
        const schema = { meta: { type: 'OBJECT', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ meta: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('ARRAY type', () => {
      it('should pass valid array', () => {
        const schema = { tags: 'ARRAY' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ tags: ['a', 'b'] })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail object as array', () => {
        const schema = { tags: 'ARRAY' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ tags: { 0: 'a' } })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('required fields', () => {
      it('should fail when required field is missing', () => {
        const schema = { name: { type: 'STRING', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({})

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail when required field is null', () => {
        const schema = { name: { type: 'STRING', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should pass when optional field is missing', () => {
        const schema = { name: { type: 'STRING', required: false } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({})

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should handle schema with only required flag as nested schema', () => {
        const schema = { metadata: { required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ metadata: {} })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })
    })

    describe('nested objects', () => {
      it('should validate nested object schema', () => {
        const schema = {
          user: {
            name: 'STRING',
            age: 'NUMBER'
          }
        }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          user: { name: 'John', age: 30 }
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail invalid nested object', () => {
        const schema = {
          user: {
            name: 'STRING',
            age: 'NUMBER'
          }
        }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          user: { name: 'John', age: 'thirty' }
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail when nested object is not an object', () => {
        const schema = {
          user: {
            name: 'STRING'
          }
        }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          user: 'not an object'
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('arrays with element types', () => {
      it('should validate array of strings', () => {
        const schema = { tags: ['STRING'] }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          tags: ['tag1', 'tag2', 'tag3']
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail array with wrong element type', () => {
        const schema = { tags: ['STRING'] }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          tags: ['tag1', 123, 'tag3']
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should validate array of objects', () => {
        const schema = {
          items: [{ name: 'STRING', price: 'NUMBER' }]
        }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          items: [
            { name: 'Item 1', price: 10 },
            { name: 'Item 2', price: 20 }
          ]
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail when array expected but not provided', () => {
        const schema = { tags: ['STRING'] }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          tags: 'not an array'
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should fail oversized array', () => {
        const schema = { items: ['NUMBER'] }
        const largeArray = Array.from({ length: 101 }, (_, i) => i)
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          items: largeArray
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('prototype pollution protection', () => {
      it('should filter __proto__ property when set as own property', () => {
        const schema = { name: 'STRING' }
        const body = Object.create(null)
        body.name = 'test'
        body['__proto__'] = { isAdmin: true }
        const { req, res, next, wasNextCalled } = createMockReqResNext(body)

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(Object.hasOwn(req.body, '__proto__')).to.be.false
      })

      it('should filter constructor property from schema', () => {
        const schema = { name: 'STRING' }
        const body = Object.create(null)
        body.name = 'test'
        body.constructor = 'malicious'
        const { req, res, next, wasNextCalled } = createMockReqResNext(body)

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(Object.hasOwn(req.body, 'constructor')).to.be.false
      })

      it('should filter prototype property', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          name: 'test',
          prototype: {}
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(Object.hasOwn(req.body, 'prototype')).to.be.false
      })
    })

    describe('unknown properties filtering', () => {
      it('should filter properties not in schema', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({
          name: 'John',
          unknownProp: 'value',
          anotherUnknown: 123
        })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(req.body.name).to.equal('John')
        expect(req.body.unknownProp).to.be.undefined
        expect(req.body.anotherUnknown).to.be.undefined
      })
    })

    describe('maximum nesting depth', () => {
      it('should handle deeply nested objects within limit', () => {
        // Create nested schema at depth 8 (within limit of 10)
        let schema = { level: 'STRING' }
        let data = { level: 'value' }

        for (let i = 0; i < 8; i++) {
          schema = { nested: schema }
          data = { nested: data }
        }

        const { req, res, next, wasNextCalled } = createMockReqResNext(data)

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail when nesting depth exceeds maximum', () => {
        // Create nested schema at depth 10 (at the limit)
        // Then add one more level to exceed it
        let schema = { level: 'STRING' }
        let data = { level: 'value' }

        // Create exactly 10 levels of nesting (which should reach MAX_DEPTH)
        for (let i = 0; i < 10; i++) {
          schema = { nested: schema }
          data = { nested: data }
        }

        // Add one more level to exceed the limit
        schema = { nested: schema }
        data = { nested: data }

        const { req, res, next, wasNextCalled } = createMockReqResNext(data)

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('empty string handling', () => {
      it('should reject empty string when minLength is set', () => {
        const schema = { name: { type: 'STRING', minLength: 3 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: '' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept empty string when no constraints', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: '' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject empty CLEANSTRING when minLength is set', () => {
        const schema = { name: { type: 'CLEANSTRING', minLength: 2 } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: '' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject empty EMAIL', () => {
        const schema = { email: 'EMAIL' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: '' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('NUMBER infinity handling', () => {
      it('should reject Infinity in request body', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: Infinity })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject -Infinity in request body', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: -Infinity })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should pass finite numbers', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: Number.MAX_SAFE_INTEGER })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })
    })

    describe('null handling for all types', () => {
      it('should accept null for optional STRING field', () => {
        const schema = { name: 'STRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required STRING field', () => {
        const schema = { name: { type: 'STRING', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional NUMBER field', () => {
        const schema = { count: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required NUMBER field', () => {
        const schema = { count: { type: 'NUMBER', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ count: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional BOOLEAN field', () => {
        const schema = { active: 'BOOLEAN' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required BOOLEAN field', () => {
        const schema = { active: { type: 'BOOLEAN', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ active: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional EMAIL field', () => {
        const schema = { email: 'EMAIL' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required EMAIL field', () => {
        const schema = { email: { type: 'EMAIL', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ email: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional TIMESTAMP field', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required TIMESTAMP field', () => {
        const schema = { date: { type: 'TIMESTAMP', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional ARRAY field', () => {
        const schema = { tags: 'ARRAY' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ tags: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required ARRAY field', () => {
        const schema = { tags: { type: 'ARRAY', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ tags: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional OBJECT field', () => {
        const schema = { meta: 'OBJECT' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ meta: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required OBJECT field', () => {
        const schema = { meta: { type: 'OBJECT', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ meta: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional DATE field', () => {
        const schema = { createdAt: 'DATE' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ createdAt: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required DATE field', () => {
        const schema = { createdAt: { type: 'DATE', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ createdAt: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept null for optional CLEANSTRING field', () => {
        const schema = { name: 'CLEANSTRING' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject null for required CLEANSTRING field', () => {
        const schema = { name: { type: 'CLEANSTRING', required: true } }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ name: null })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('TIMESTAMP strict validation', () => {
      it('should reject invalid month in timestamp', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-13-01' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject invalid day in timestamp', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-01-45' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject year 0000', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '0000-01-01' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject year 0999', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '0999-01-01' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept year 1000', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '1000-01-01' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should accept year 9999', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '9999-12-31' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should accept valid leap year date', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-02-29' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should reject invalid leap year date', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2023-02-29' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject February 30th', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-02-30' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject month 00', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-00-15' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject day 00', () => {
        const schema = { date: 'TIMESTAMP' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({ date: '2024-05-00' })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })
    })

    describe('array size limit updated to 100', () => {
      it('should pass array with exactly 100 elements', () => {
        const schema = { items: ['NUMBER'] }
        const array = Array.from({ length: 100 }, (_, i) => i)
        const { req, res, next, wasNextCalled } = createMockReqResNext({ items: array })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })

      it('should fail array with 101 elements', () => {
        const schema = { items: ['NUMBER'] }
        const array = Array.from({ length: 101 }, (_, i) => i)
        const { req, res, next, wasNextCalled } = createMockReqResNext({ items: array })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should pass array with 50 elements', () => {
        const schema = { items: ['STRING'] }
        const array = Array.from({ length: 50 }, (_, i) => `item${i}`)
        const { req, res, next, wasNextCalled } = createMockReqResNext({ items: array })

        validate(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
      })
    })
  })

  describe('validateQuery middleware', () => {
    it('should validate query parameters', () => {
      const schema = { page: 'NUMBER', search: 'STRING' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: '1', search: 'test' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.page).to.equal(1)
      expect(req.query.search).to.equal('test')
    })

    it('should coerce string to number', () => {
      const schema = { limit: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { limit: '50' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.limit).to.equal(50)
    })

    it('should coerce string to boolean', () => {
      const schema = { active: 'BOOLEAN' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { active: 'true' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.active).to.equal(true)
    })

    it('should fail invalid boolean string', () => {
      const schema = { active: 'BOOLEAN' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { active: 'yes' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should fail invalid number string', () => {
      const schema = { page: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: 'notanumber' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should fail required missing query param', () => {
      const schema = { id: { type: 'NUMBER', required: true } }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {})

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should fail unknown query parameters', () => {
      const schema = { page: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: '1', unknown: 'value' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should validate TIMESTAMP in query', () => {
      const schema = { from: 'TIMESTAMP' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { from: '2024-01-15T10:00:00Z' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
    })

    it('should validate EMAIL in query', () => {
      const schema = { email: 'EMAIL' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { email: 'test@example.com' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
    })

    it('should validate CLEANSTRING in query', () => {
      const schema = { name: 'CLEANSTRING' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { name: 'John Doe' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
    })

    it('should fail CLEANSTRING with curly braces in query', () => {
      const schema = { name: 'CLEANSTRING' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { name: '{injection}' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should validate NUMBER constraints in query', () => {
      const schema = { page: { type: 'NUMBER', min: 1, max: 100 } }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: '50' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.page).to.equal(50)
    })

    it('should fail NUMBER min constraint in query', () => {
      const schema = { page: { type: 'NUMBER', min: 1 } }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: '0' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should block dangerous keys in query', () => {
      const schema = { name: 'STRING' }
      const query = Object.create(null)
      query.name = 'test'
      query['__proto__'] = 'malicious'
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, query)

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should skip optional query parameter when not provided', () => {
      const schema = { page: 'NUMBER', optional: 'STRING' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { page: '1' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.page).to.equal(1)
      expect(req.query.optional).to.be.undefined
    })

    it('should handle unsupported types in query by treating as string', () => {
      const schema = { data: 'OBJECT' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, { data: 'some-string' })

      validateQuery(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.query.data).to.equal('some-string')
    })

    describe('NUMBER infinity handling in query', () => {
      it('should reject Infinity from query string coercion', () => {
        const schema = { limit: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({}, { limit: '1e309' })

        validateQuery(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject -Infinity from query string coercion', () => {
        const schema = { limit: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({}, { limit: '-1e309' })

        validateQuery(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should reject Infinity string', () => {
        const schema = { limit: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({}, { limit: 'Infinity' })

        validateQuery(schema)(req, res, next)

        expect(wasNextCalled()).to.be.false
        expect(res.statusCode).to.equal(400)
      })

      it('should accept large but finite numbers', () => {
        const schema = { limit: 'NUMBER' }
        const { req, res, next, wasNextCalled } = createMockReqResNext({}, { limit: '999999999' })

        validateQuery(schema)(req, res, next)

        expect(wasNextCalled()).to.be.true
        expect(req.query.limit).to.equal(999999999)
      })
    })
  })

  describe('validateParams middleware', () => {
    it('should validate URL parameters', () => {
      const schema = { id: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, { id: '123' })

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.params.id).to.equal(123)
    })

    it('should fail invalid URL parameter', () => {
      const schema = { id: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, { id: 'abc' })

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should validate required URL parameter', () => {
      const schema = { id: { type: 'NUMBER', required: true } }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, {})

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should validate STRING URL parameter', () => {
      const schema = { slug: 'STRING' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, { slug: 'my-post' })

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.true
      expect(req.params.slug).to.equal('my-post')
    })

    it('should fail unknown URL parameters', () => {
      const schema = { id: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, { id: '1', unknown: 'value' })

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })

    it('should block dangerous keys in params', () => {
      const schema = { id: 'NUMBER' }
      const { req, res, next, wasNextCalled } = createMockReqResNext({}, {}, { id: '1', constructor: 'malicious' })

      validateParams(schema)(req, res, next)

      expect(wasNextCalled()).to.be.false
      expect(res.statusCode).to.equal(400)
    })
  })
})
