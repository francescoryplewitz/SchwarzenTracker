import { setupServer } from 'msw/node'

// Dynamic handler loading via import.meta.glob
const handlerModules = import.meta.glob('./handlers/**/*.js', { eager: true })

const normalizeHandlers = (moduleExports) => {
  if (!moduleExports) {
    return []
  }

  const exportedHandlers = moduleExports.default ?? moduleExports.handlers

  if (!exportedHandlers) {
    return []
  }

  if (Array.isArray(exportedHandlers)) {
    return exportedHandlers
  }

  return [exportedHandlers]
}

export const handlers = Object.keys(handlerModules)
  .flatMap((key) => normalizeHandlers(handlerModules[key]))

export const server = setupServer(...handlers)
