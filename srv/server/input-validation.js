const validator = require('validator') // For additional validations, including email
const LOG = new Logger('INPUT')
// Type validation functions
const typeValidators = {
  STRING: (value, constraints = {}) => {
    if (value === undefined || value === null) return true
    if (typeof value !== 'string') return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength) { return false }
    if (constraints.maxLength && value.length > constraints.maxLength) { return false }
    return true
  },
  CLEANSTRING: (value, constraints = {}) => {
    if (value === undefined || value === null) return true
    if (typeof value !== 'string') return false
    // Only alphanumeric characters, spaces and safe special characters
    const regex = /^[a-zA-Z0-9.,-_äöüßÄÖÜ\s]*$/
    if (!regex.test(value)) return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength) { return false }
    if (constraints.maxLength && value.length > constraints.maxLength) { return false }
    return true
  },
  EMAIL: (value, constraints = {}) => {
    if (value === undefined || value === null) return true
    if (typeof value !== 'string') return false
    if (!validator.isEmail(value)) return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength) { return false }
    if (constraints.maxLength && value.length > constraints.maxLength) { return false }
    return true
  },
  BOOLEAN: value => {
    if (value === undefined || value === null) return true
    return typeof value === 'boolean'
  },
  NUMBER: (value, constraints = {}) => {
    if (value === undefined || value === null) return true
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value)) return false
    if (constraints.min !== undefined && value < constraints.min) {
      return false
    }
    if (constraints.max !== undefined && value > constraints.max) {
      return false
    }
    return true
  },
  DATE: value => {
    if (value === undefined || value === null) return true
    return value instanceof Date && !isNaN(value)
  },
  TIMESTAMP: value => {
    if (value === undefined || value === null) return true
    if (typeof value !== 'string') return false

    // ISO 8601 Format: YYYY-MM-DDTHH:mm:ss.sssZ or YYYY-MM-DD
    const isoRegex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/
    if (!isoRegex.test(value)) return false

    const date = new Date(value)
    if (isNaN(date.getTime())) return false

    // Validate year range (1000-9999)
    const year = date.getUTCFullYear()
    if (year < 1000 || year > 9999) return false

    // Compare year, month, day to ensure validity (catches "2024-13-45")
    const [inputYear, inputMonth, inputDay] = value.split('T')[0].split('-').map(Number)
    if (inputYear !== date.getUTCFullYear() ||
        inputMonth !== (date.getUTCMonth() + 1) ||
        inputDay !== date.getUTCDate()) {
      return false
    }

    return true
  },
  OBJECT: value => {
    if (value === undefined || value === null) return true
    return typeof value === 'object' && value !== null && !Array.isArray(value)
  },
  ARRAY: value => {
    if (value === undefined || value === null) return true
    return Array.isArray(value)
  }
}

// Extracts constraints and required status from type definition
const extractConstraints = typeDef => {
  if (typeof typeDef === 'string') {
    return { type: typeDef, constraints: {}, required: false }
  }
  if (Array.isArray(typeDef)) {
    return {
      type: 'ARRAY',
      elementType: extractConstraints(typeDef[0]),
      constraints: {},
      required: typeDef.required || false
    }
  }
  if (typeof typeDef === 'object') {
    // Check if it is a nested schema
    const keys = Object.keys(typeDef)
    const isNestedSchema = keys.some(key => {
      const value = typeDef[key]
      return (
        typeof value === 'object' ||
        typeof value === 'string' ||
        Array.isArray(value) ||
        key === 'required'
      )
    })

    if (isNestedSchema && !typeDef.type) {
      return {
        type: 'OBJECT',
        schema: typeDef,
        constraints: {},
        required: typeDef.required || false
      }
    }

    // Otherwise it is a simple type with constraints
    return {
      type: typeDef.type || 'STRING',
      constraints: {
        length: typeDef.length,
        minLength: typeDef.minLength,
        maxLength: typeDef.maxLength,
        min: typeDef.min,
        max: typeDef.max
      },
      required: typeDef.required || false
    }
  }
  return { type: typeDef, constraints: {}, required: false }
}

// Validation function for nested structures
const validatePayload = (data, schema, path = '', depth = 0) => {
  const errors = []
  const filtered = {}

  // Protection against excessive nesting depth
  const MAX_DEPTH = 10
  if (depth > MAX_DEPTH) {
    errors.push('Maximum nesting depth exceeded')
    return { errors, filtered }
  }

  // Protection against Prototype Pollution
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']

  // Check for non-allowed attributes
  for (const key in data) {
    // Block dangerous keys
    if (dangerousKeys.includes(key)) {
      LOG.warn(`Dangerous property ${path}${key} blocked`)
      continue
    }

    if (!(key in schema)) {
      LOG.warn(`Property ${path}${key} is not allowed and got filtered`)
      continue
    }
    filtered[key] = data[key]
  }

  // Validate allowed attributes
  for (const key in schema) {
    const typeDef = schema[key]
    const value = filtered[key]
    const {
      type,
      constraints,
      schema: nestedSchema,
      elementType,
      required
    } = extractConstraints(typeDef)

    // Check for missing required fields, objects or arrays
    if (required && (value === undefined || value === null)) {
      errors.push(`Missing required field: ${path}${key}`)
      continue
    }

    // Skip validation if field is not required and not present
    if (value === undefined) {
      continue
    }

    // Validation by type
    if (type === 'OBJECT' && nestedSchema) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`Invalid type for ${path}${key}: expected object`)
        continue
      }
      const { errors: nestedErrors, filtered: nestedFiltered } = validatePayload(
        value,
        nestedSchema,
        `${path}${key}.`,
        depth + 1
      )
      errors.push(...nestedErrors)
      filtered[key] = nestedFiltered
    } else if (type === 'ARRAY' && elementType) {
      if (!Array.isArray(value)) {
        errors.push(`Invalid type for ${path}${key}: expected array`)
        continue
      }

      // Protection against oversized arrays
      const MAX_ARRAY_SIZE = 100
      if (value.length > MAX_ARRAY_SIZE) {
        errors.push(`Array ${path}${key} exceeds maximum size of ${MAX_ARRAY_SIZE}`)
        continue
      }

      filtered[key] = []
      value.forEach((item, index) => {
        if (elementType.type === 'OBJECT') {
          const { errors: nestedErrors, filtered: nestedFiltered } = validatePayload(
            item,
            elementType.schema,
            `${path}${key}[${index}].`,
            depth + 1
          )
          errors.push(...nestedErrors)
          if (nestedErrors.length === 0) {
            filtered[key].push(nestedFiltered)
          }
        } else {
          const isValid = typeValidators[elementType.type](
            item,
            elementType.constraints
          )
          if (!isValid) {
            errors.push(
              `Invalid type for ${path}${key}[${index}]: expected ${elementType.type}`
            )
          } else {
            filtered[key].push(item)
          }
        }
      })
    } else {
      const isValid = typeValidators[type](value, constraints)
      if (!isValid) {
        errors.push(`Invalid type for ${path}${key}: expected ${type}`)
      } else {
        filtered[key] = value
      }
    }
  }

  return { errors, filtered }
}

// Validates flat key-value structures (query strings or URL params)
// Query/params are always strings initially, so type coercion is needed for NUMBER
const validateFlatParams = (data, schema, source) => {
  const errors = []
  const validated = {}

  // Protection against Prototype Pollution
  const dangerousKeys = ['__proto__', 'constructor', 'prototype']

  // Check for dangerous keys
  for (const key in data) {
    if (dangerousKeys.includes(key)) {
      errors.push(`Dangerous property ${key} blocked`)
      continue
    }
  }

  // Validate each schema field
  for (const key in schema) {
    const typeDef = schema[key]
    const rawValue = data[key]
    const { type, constraints, required } = extractConstraints(typeDef)

    // Check required
    if (required && (rawValue === undefined || rawValue === '')) {
      errors.push(`Missing required ${source} parameter: ${key}`)
      continue
    }

    // Skip if not provided and not required
    if (rawValue === undefined) {
      continue
    }

    // Type-specific validation with coercion for query/params (they come as strings)
    let value = rawValue
    let isValid = false

    switch (type) {
      case 'NUMBER': {
        const parsed = Number(rawValue)
        if (!isFinite(parsed)) {
          errors.push(`Invalid ${source} parameter ${key}: expected finite number`)
          continue
        }
        value = parsed
        isValid = typeValidators.NUMBER(value, constraints)
        break
      }
      case 'BOOLEAN': {
        if (rawValue === 'true') value = true
        else if (rawValue === 'false') value = false
        else {
          errors.push(`Invalid ${source} parameter ${key}: expected boolean (true/false)`)
          continue
        }
        isValid = true
        break
      }
      case 'STRING':
      case 'CLEANSTRING':
      case 'EMAIL':
      case 'TIMESTAMP': {
        isValid = typeValidators[type](rawValue, constraints)
        break
      }
      default: {
        // For unsupported types in flat params, treat as string
        isValid = typeValidators.STRING(rawValue, constraints)
      }
    }

    if (!isValid) {
      errors.push(`Invalid ${source} parameter ${key}: expected ${type}`)
    } else {
      validated[key] = value
    }
  }

  // Check for unknown parameters (strict validation)
  for (const key in data) {
    if (dangerousKeys.includes(key)) continue
    if (!(key in schema)) {
      errors.push(`Unknown ${source} parameter: ${key}`)
    }
  }

  return { errors, validated }
}

// Express Middleware for request body
const validate = schema => {
  return (req, res, next) => {
    const { errors, filtered } = validatePayload(req.body, schema)

    if (errors.length > 0) {
      // Detailed errors only in log
      const errorMessage = `Validation failed:\n${errors.join('\n')}`
      LOG.error(errorMessage)
      // Generic error message to client
      return res.status(400).json({ error: 'Validation failed: Invalid request data' })
    }

    // Replace req.body with filtered data
    req.body = filtered
    next()
  }
}

// Express Middleware for query parameters
const validateQuery = schema => {
  return (req, res, next) => {
    const { errors, validated } = validateFlatParams(req.query, schema, 'query')

    if (errors.length > 0) {
      const errorMessage = `Query validation failed:\n${errors.join('\n')}`
      LOG.error(errorMessage)
      return res.status(400).json({ error: 'Validation failed: Invalid query parameters' })
    }

    req.query = validated
    next()
  }
}

// Express Middleware for URL parameters
const validateParams = schema => {
  return (req, res, next) => {
    const { errors, validated } = validateFlatParams(req.params, schema, 'param')

    if (errors.length > 0) {
      const errorMessage = `Param validation failed:\n${errors.join('\n')}`
      LOG.error(errorMessage)
      return res.status(400).json({ error: 'Validation failed: Invalid URL parameters' })
    }

    req.params = validated
    next()
  }
}

module.exports = { validate, validateQuery, validateParams }
