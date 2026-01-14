import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { useDragReorder } from 'src/composables/useDragReorder'

const createElement = (rect = { left: 0, top: 0, right: 200, bottom: 200 }) => {
  const listeners = new Map()

  return {
    getBoundingClientRect: () => rect,
    addEventListener: (type, handler) => {
      listeners.set(type, handler)
    },
    removeEventListener: (type, handler) => {
      if (listeners.get(type) === handler) {
        listeners.delete(type)
      }
    },
    getListener: (type) => listeners.get(type)
  }
}

describe('useDragReorder', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not activate drag mode when finger moves before long press delay', () => {
    const { isDragMode, draggedIndex, onTouchStart } = useDragReorder({
      longPressDelay: 500,
      onDrop: vi.fn()
    })

    const element = createElement()
    const startEvent = {
      touches: [{ clientX: 50, clientY: 50 }],
      currentTarget: element
    }

    onTouchStart(startEvent, 0, () => [])

    const touchMove = element.getListener('touchmove')
    touchMove({ touches: [{ clientX: 50, clientY: 60 }] })

    vi.advanceTimersByTime(600)

    expect(isDragMode.value).toBe(false)
    expect(draggedIndex.value).toBe(null)
  })

  it('activates drag mode when long pressed without moving', () => {
    const { isDragMode, draggedIndex, onTouchStart } = useDragReorder({
      longPressDelay: 500,
      onDrop: vi.fn()
    })

    const element = createElement()
    const startEvent = {
      touches: [{ clientX: 50, clientY: 50 }],
      currentTarget: element
    }

    onTouchStart(startEvent, 2, () => [])
    vi.advanceTimersByTime(500)

    expect(isDragMode.value).toBe(true)
    expect(draggedIndex.value).toBe(2)
  })

  it('does not activate drag mode when finger leaves element during long press', () => {
    const { isDragMode, draggedIndex, onTouchStart } = useDragReorder({
      longPressDelay: 500,
      onDrop: vi.fn()
    })

    const element = createElement()
    const startEvent = {
      touches: [{ clientX: 50, clientY: 50 }],
      currentTarget: element
    }

    onTouchStart(startEvent, 0, () => [])

    const touchMove = element.getListener('touchmove')
    touchMove({ touches: [{ clientX: 500, clientY: 500 }] })

    vi.advanceTimersByTime(600)

    expect(isDragMode.value).toBe(false)
    expect(draggedIndex.value).toBe(null)
  })
})

