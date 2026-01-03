const validator = require('validator') // Für zusätzliche Validierungen, inkl. E-Mail
const LOG = new Logger('INPUT')
// Typ-Validierungsfunktionen
const typeValidators = {
  STRING: (value, constraints = {}) => {
    if (!value) return true
    if (typeof value !== 'string') return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength)
      return false
    if (constraints.maxLength && value.length > constraints.maxLength)
      return false
    return true
  },
  CLEANSTRING: (value, constraints = {}) => {
    if (!value) return true
    if (typeof value !== 'string') return false
    const regex = /^[a-zA-Z0-9.,-_@äöüß+\s]*$/
    if (!regex.test(value)) return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength)
      return false
    if (constraints.maxLength && value.length > constraints.maxLength)
      return false
    return true
  },
  EMAIL: (value, constraints = {}) => {
    if (!value) return true
    if (typeof value !== 'string') return false
    if (!validator.isEmail(value)) return false
    if (constraints.length && value.length !== constraints.length) return false
    if (constraints.minLength && value.length < constraints.minLength)
      return false
    if (constraints.maxLength && value.length > constraints.maxLength)
      return false
    return true
  },
  BOOLEAN: value => typeof value === 'boolean',
  NUMBER: (value, constraints = {}) => {
    if (value === undefined) return true
    if (value === null) return false
    if (typeof value !== 'number' || isNaN(value)) return false
    if (constraints.min !== undefined && value < constraints.min) {
      return false
    }
    if (constraints.max !== undefined && value > constraints.max) {
      return false
    }
    return true
  },
  DATE: value => value instanceof Date && !isNaN(value),
  TIMESTAMP: value =>
    !value || (typeof value === 'string' && !isNaN(new Date(value))),
  OBJECT: value =>
    typeof value === 'object' && value !== null && !Array.isArray(value),
  ARRAY: value => Array.isArray(value)
}

// Extrahiert Constraints und Required-Status aus der Typdefinition
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
    // Prüfe, ob es ein geschachteltes Schema ist
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

    // Ansonsten ist es ein einfacher Typ mit Constraints
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

// Validierungsfunktion für geschachtelte Strukturen
const validatePayload = (data, schema, path = '') => {
  const errors = []
  const filtered = {}

  // Prüfe auf nicht zugelassene Attribute
  for (const key in data) {
    if (!(key in schema)) {
      LOG.warn(`Property ${path}${key} is not allowed and got filtered`)
      delete data[key]
      continue
    }
    filtered[key] = data[key]
  }

  // Validiere zugelassene Attribute
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

    // Prüfe auf fehlende erforderliche Felder, Objekte oder Arrays
    if (required && (value === undefined || value === null)) {
      errors.push(`Missing required field: ${path}${key}`)
      continue
    }

    // Überspringe Validierung, wenn das Feld nicht erforderlich ist und nicht vorhanden
    if (value === undefined) {
      continue
    }

    // Validierung nach Typ
    if (type === 'OBJECT' && nestedSchema) {
      if (typeof value !== 'object' || Array.isArray(value)) {
        errors.push(`Invalid type for ${path}${key}: expected object`)
        continue
      }
      const nestedErrors = validatePayload(
        value,
        nestedSchema,
        `${path}${key}.`
      )
      errors.push(...nestedErrors)
      filtered[key] = nestedErrors.length ? filtered[key] : value
    } else if (type === 'ARRAY' && elementType) {
      if (!Array.isArray(value)) {
        errors.push(`Invalid type for ${path}${key}: expected array`)
        continue
      }
      filtered[key] = []
      value.forEach((item, index) => {
        if (elementType.type === 'OBJECT') {
          const nestedErrors = validatePayload(
            item,
            elementType.schema,
            `${path}${key}[${index}].`
          )
          errors.push(...nestedErrors)
          filtered[key].push(item)
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
      }
    }
  }

  return errors
}

// Express Middleware
const validate = schema => {
  return (req, res, next) => {
    const errors = validatePayload(req.body, schema)

    if (errors.length > 0) {
      const errorMessage = `Validation failed:\n${errors.join('\n')}`
      LOG.error(errorMessage)
      return res.status(400).json({ error: errorMessage })
    }

    // Aktualisiere req.body mit gefilterten Daten
    req.body = Object.assign({}, req.body)
    next()
  }
}

module.exports = { validate }
