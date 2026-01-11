import { afterAll, afterEach, beforeAll, beforeEach, vi } from 'vitest'
import { cleanup } from '@testing-library/vue'
import { server } from './server'

// Polyfill ResizeObserver for jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (!global.ResizeObserver) {
  global.ResizeObserver = ResizeObserver
}

// Mock window methods
if (typeof window !== 'undefined' && typeof window.open !== 'function') {
  window.open = vi.fn()
}

if (typeof window !== 'undefined' && typeof window.scrollTo !== 'function') {
  window.scrollTo = vi.fn()
}

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.open = vi.fn()
    window.scrollTo = vi.fn()
  }
})

// MSW Server Lifecycle
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

afterEach(() => {
  server.resetHandlers()
  vi.clearAllMocks()
  cleanup()
})

afterAll(() => {
  server.close()
})
