import { nextTick, ref } from 'vue'

export function useDragReorder(options = {}) {
  const longPressDelay = options.longPressDelay || 500
  const onDropCallback = options.onDrop || (() => {})

  const isDragMode = ref(false)
  const draggedIndex = ref(null)
  const ghostPosition = ref({ x: 0, y: 0 })
  const dropTargetIndex = ref(null)

  const handleContextMenu = (event) => {
    event.preventDefault()
    event.stopPropagation()
  }

  let longPressTimer = null
  let itemRects = []
  let itemRectsCallback = null
  let pendingActivation = null
  let moveListenerDuringTimer = null
  let moveListenerTarget = null

  const updateItemRects = () => {
    itemRects = itemRectsCallback()
  }

  const resetState = () => {
    clearTimeout(longPressTimer)
    longPressTimer = null
    pendingActivation = null
    isDragMode.value = false
    draggedIndex.value = null
    dropTargetIndex.value = null
    itemRectsCallback = null
    
    document.removeEventListener('contextmenu', handleContextMenu, true)

    if (moveListenerDuringTimer && moveListenerTarget) {
      moveListenerTarget.removeEventListener('touchmove', moveListenerDuringTimer)
      moveListenerDuringTimer = null
      moveListenerTarget = null
    }
  }

  const updateGhostPosition = (x, y) => {
    ghostPosition.value = { x, y }
  }

  const calculateDropTarget = (clientY) => {
    for (let i = 0; i < itemRects.length; i++) {
      const rect = itemRects[i]
      const midY = rect.top + rect.height / 2
      if (clientY < midY) {
        dropTargetIndex.value = i
        return
      }
    }
    dropTargetIndex.value = itemRects.length
  }

  const handleTouchMove = (event) => {
    if (draggedIndex.value === null) return
    event.preventDefault()
    const touch = event.touches[0]
    updateItemRects()
    updateGhostPosition(touch.clientX, touch.clientY)
    calculateDropTarget(touch.clientY)
  }

  const handleTouchEnd = () => {
    const fromIndex = draggedIndex.value
    const toIndex = dropTargetIndex.value

    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    document.removeEventListener('touchcancel', handleCancel)

    resetState()

    if (toIndex !== null && fromIndex !== null && toIndex !== fromIndex) {
      const adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
      onDropCallback(fromIndex, adjustedToIndex)
    }
  }

  const handleCancel = () => {
    document.removeEventListener('touchmove', handleTouchMove)
    document.removeEventListener('touchend', handleTouchEnd)
    document.removeEventListener('touchcancel', handleCancel)
    resetState()
  }

  const activateDragMode = (index, clientX, clientY, rectsCallback) => {
    isDragMode.value = true
    draggedIndex.value = index
    updateGhostPosition(clientX, clientY)
    itemRectsCallback = rectsCallback

    nextTick(() => {
      updateItemRects()
      calculateDropTarget(clientY)
    })

    document.addEventListener('contextmenu', handleContextMenu, true)
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)
    document.addEventListener('touchcancel', handleCancel)
  }

  const onTouchStart = (event, index, rectsCallback) => {
    const touch = event.touches[0]
    const startX = touch.clientX
    const startY = touch.clientY
    const element = event.currentTarget
    let hasMoved = false

    const handleMoveDuringTimer = (e) => {
      if (hasMoved) return
      
      const moveTouch = e.touches[0]
      const currentX = moveTouch.clientX
      const currentY = moveTouch.clientY
      const deltaX = Math.abs(currentX - startX)
      const deltaY = Math.abs(currentY - startY)

      const currentElementRect = element.getBoundingClientRect()
      const isOverElement =
        currentX >= currentElementRect.left &&
        currentX <= currentElementRect.right &&
        currentY >= currentElementRect.top &&
        currentY <= currentElementRect.bottom

      const isScrolling = deltaY > 6 && deltaY > deltaX
      const hasMovedTooMuch = deltaX > 10 || deltaY > 10

      if (!isOverElement || isScrolling || hasMovedTooMuch) {
        clearTimeout(longPressTimer)
        element.removeEventListener('touchmove', handleMoveDuringTimer)
        moveListenerDuringTimer = null
        moveListenerTarget = null
        hasMoved = true
        pendingActivation = null
      }
    }

    moveListenerDuringTimer = handleMoveDuringTimer
    moveListenerTarget = element
    element.addEventListener('touchmove', handleMoveDuringTimer, { passive: true })

    pendingActivation = { index, startX, startY, rectsCallback }

    longPressTimer = setTimeout(() => {
      if (!hasMoved && pendingActivation && element) {
        const finalTouch = event.touches?.[0] || { clientX: startX, clientY: startY }
        const finalElementRect = element.getBoundingClientRect()
        const isStillOverElement =
          finalTouch.clientX >= finalElementRect.left &&
          finalTouch.clientX <= finalElementRect.right &&
          finalTouch.clientY >= finalElementRect.top &&
          finalTouch.clientY <= finalElementRect.bottom

        if (isStillOverElement) {
          activateDragMode(
            pendingActivation.index,
            pendingActivation.startX,
            pendingActivation.startY,
            pendingActivation.rectsCallback
          )
        }
        pendingActivation = null
      }

      if (moveListenerDuringTimer) {
        element.removeEventListener('touchmove', moveListenerDuringTimer)
      }
      moveListenerDuringTimer = null
      moveListenerTarget = null
    }, longPressDelay)
  }

  const onTouchEnd = () => {
    clearTimeout(longPressTimer)
    pendingActivation = null
    
    if (moveListenerDuringTimer && moveListenerTarget) {
      moveListenerTarget.removeEventListener('touchmove', moveListenerDuringTimer)
      moveListenerDuringTimer = null
      moveListenerTarget = null
    }
  }

  const onMouseDown = (event, index, rectsCallback) => {
    const startX = event.clientX
    const startY = event.clientY
    let activated = false
    let localItemRectsCallback = rectsCallback

    const handleMouseMove = (e) => {
      if (!activated) return
      e.preventDefault()
      itemRectsCallback = localItemRectsCallback
      updateItemRects()
      updateGhostPosition(e.clientX, e.clientY)
      calculateDropTarget(e.clientY)
    }

    const handleMouseUp = () => {
      clearTimeout(longPressTimer)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)

      if (activated) {
        const fromIndex = draggedIndex.value
        const toIndex = dropTargetIndex.value
        resetState()

        if (toIndex !== null && fromIndex !== null && toIndex !== fromIndex) {
          const adjustedToIndex = toIndex > fromIndex ? toIndex - 1 : toIndex
          onDropCallback(fromIndex, adjustedToIndex)
        }
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    longPressTimer = setTimeout(() => {
      isDragMode.value = true
      draggedIndex.value = index
      activated = true
      updateGhostPosition(startX, startY)
      itemRectsCallback = localItemRectsCallback

      nextTick(() => {
        updateItemRects()
        calculateDropTarget(startY)
      })
    }, longPressDelay)
  }

  return {
    isDragMode,
    draggedIndex,
    ghostPosition,
    dropTargetIndex,
    onTouchStart,
    onTouchEnd,
    onMouseDown
  }
}
