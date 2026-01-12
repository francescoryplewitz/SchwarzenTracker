// Matcher functions for validating API response structure
// Used by provider tests to ensure contract between client and server

const isString = (v) => typeof v === 'string'
const isBoolean = (v) => typeof v === 'boolean'
const isNumber = (v) => typeof v === 'number'
const isArray = (v) => Array.isArray(v)
const isOptionalString = (v) => v === null || typeof v === 'string'
const isOptionalNumber = (v) => v === null || typeof v === 'number'

// Matcher for exercise list item (GET /api/exercises)
const exerciseListItemMatcher = {
  id: isString,
  name: isString,
  description: isString,
  muscleGroups: isArray,
  category: isString,
  equipment: isOptionalString,
  videoUrl: isOptionalString,
  isSystem: isBoolean,
  createdAt: isString,
  updatedAt: isString,
  _count: (v) => typeof v === 'object' && isNumber(v.variants)
}

// Matcher for exercise detail (GET /api/exercises/:id)
// Note: Detail response has full variants array instead of _count
const exerciseDetailMatcher = {
  id: isString,
  name: isString,
  description: isString,
  muscleGroups: isArray,
  category: isString,
  equipment: isOptionalString,
  videoUrl: isOptionalString,
  isSystem: isBoolean,
  createdAt: isString,
  updatedAt: isString,
  variants: isArray,
  images: isArray,
  isFavorite: isBoolean,
  forkedFromId: isOptionalString,
  createdById: isOptionalNumber
}

// Matcher for variant in detail response
const variantMatcher = {
  id: isString,
  title: isString,
  description: isOptionalString,
  equipment: isOptionalString,
  exerciseId: isString,
  createdAt: isString,
  updatedAt: isString
}

// Matcher for created/updated exercise response
const exerciseMutationMatcher = {
  id: isString,
  name: isString,
  description: isString,
  muscleGroups: isArray,
  category: isString,
  equipment: isOptionalString,
  videoUrl: isOptionalString,
  isSystem: isBoolean,
  createdAt: isString,
  updatedAt: isString
}

// Matcher for forked exercise response
const forkedExerciseMatcher = {
  ...exerciseMutationMatcher,
  forkedFromId: isString
}

// Helper function to validate object against matcher
const validateAgainstMatcher = (obj, matcher, path = '') => {
  const errors = []

  for (const [key, validator] of Object.entries(matcher)) {
    const fullPath = path ? `${path}.${key}` : key
    const value = obj[key]

    if (!(key in obj)) {
      errors.push(`Missing field: ${fullPath}`)
      continue
    }

    if (!validator(value)) {
      errors.push(`Invalid type for ${fullPath}: got ${typeof value} (value: ${JSON.stringify(value)})`)
    }
  }

  return errors
}

module.exports = {
  exerciseListItemMatcher,
  exerciseDetailMatcher,
  variantMatcher,
  exerciseMutationMatcher,
  forkedExerciseMatcher,
  validateAgainstMatcher
}
