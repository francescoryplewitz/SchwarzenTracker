<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="picker-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="modelValue" class="picker-sheet">
            <div class="picker-header">
              <span class="picker-label">{{ label }}</span>
              <button class="done-btn" @click="close">
                Fertig
              </button>
            </div>

            <div class="picker-display" @click="openDirectInput">
              <template v-if="directInputActive">
                <input
                  ref="directInputRef"
                  v-model="directInputValue"
                  type="text"
                  inputmode="numeric"
                  class="direct-input"
                  @blur="applyDirectInput"
                  @keyup.enter="applyDirectInput"
                />
              </template>
              <template v-else>
                <span class="display-value">{{ currentValue }}</span>
              </template>
              <span v-if="unit" class="display-unit">{{ unit }}</span>
            </div>

            <div
              class="picker-wheel"
              @touchstart="onTouchStart"
              @touchmove="onTouchMove"
              @touchend="onTouchEnd"
              @wheel="onWheel"
            >
              <div class="wheel-gradient top" />
              <div class="wheel-gradient bottom" />

              <div class="wheel-values" :style="{ transform: `translateY(${offset}px)` }">
                <div
                  v-for="(val, idx) in visibleValues"
                  :key="idx"
                  class="wheel-item"
                  :class="{ active: val === currentValue }"
                >
                  {{ val }}
                </div>
              </div>

              <div class="wheel-indicator" />
            </div>

            <div v-if="presets.length" class="picker-presets">
              <button
                v-for="preset in presets"
                :key="preset"
                class="preset-btn"
                :class="{ active: currentValue === preset }"
                @click="selectPreset(preset)"
              >
                {{ preset }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { defineComponent, ref, computed, watch, nextTick } from 'vue'

export default defineComponent({
  name: 'NumberPickerOverlay',

  props: {
    modelValue: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    label: { type: String, default: '' },
    unit: { type: String, default: '' },
    min: { type: Number, default: 0 },
    max: { type: Number, default: 100 },
    step: { type: Number, default: 1 },
    presets: { type: Array, default: () => [] }
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const currentValue = ref(props.value)
    const offset = ref(0)
    const touchStartY = ref(0)
    const touchStartOffset = ref(0)
    const directInputActive = ref(false)
    const directInputValue = ref('')
    const directInputRef = ref(null)
    const itemHeight = 70

    const visibleValues = computed(() => {
      const values = []
      const range = 4
      const centerIndex = Math.round((currentValue.value - props.min) / props.step)

      for (let i = centerIndex - range; i <= centerIndex + range; i++) {
        const val = props.min + i * props.step
        if (val >= props.min && val <= props.max) {
          values.push(val)
        }
      }
      return values
    })

    const emitChange = () => {
      emit('change', currentValue.value)
    }

    const snapToValue = () => {
      const steps = Math.round(-offset.value / itemHeight)
      const newValue = currentValue.value + steps * props.step
      currentValue.value = Math.max(props.min, Math.min(props.max, newValue))
      offset.value = 0
      emitChange()
    }

    const onTouchStart = (e) => {
      touchStartY.value = e.touches[0].clientY
      touchStartOffset.value = offset.value
    }

    const onTouchMove = (e) => {
      const deltaY = e.touches[0].clientY - touchStartY.value
      offset.value = touchStartOffset.value + deltaY
    }

    const onTouchEnd = () => {
      snapToValue()
    }

    const onWheel = (e) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? -1 : 1
      const newValue = currentValue.value + direction * props.step
      currentValue.value = Math.max(props.min, Math.min(props.max, newValue))
      emitChange()
    }

    const selectPreset = (preset) => {
      currentValue.value = preset
      emitChange()
    }

    const openDirectInput = () => {
      directInputValue.value = currentValue.value.toString()
      directInputActive.value = true
      nextTick(() => {
        directInputRef.value?.focus()
        directInputRef.value?.select()
      })
    }

    const applyDirectInput = () => {
      const parsed = parseInt(directInputValue.value, 10)
      if (!isNaN(parsed) && parsed >= props.min && parsed <= props.max) {
        currentValue.value = parsed
        emitChange()
      }
      directInputActive.value = false
    }

    const close = () => {
      directInputActive.value = false
      emit('update:modelValue', false)
    }

    watch(() => props.value, (newVal) => {
      currentValue.value = newVal
    })

    watch(() => props.modelValue, (open) => {
      if (open) {
        currentValue.value = props.value
        offset.value = 0
      }
    })

    return {
      currentValue,
      offset,
      visibleValues,
      directInputActive,
      directInputValue,
      directInputRef,
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onWheel,
      selectPreset,
      openDirectInput,
      applyDirectInput,
      close
    }
  }
})
</script>

<style scoped>
.picker-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.picker-sheet {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, #0a1a24 0%, #040d16 100%);
  border-radius: 28px 28px 0 0;
  padding: 20px 24px 36px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
}

.picker-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.picker-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.done-btn {
  padding: 10px 20px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 20px;
  color: #00ffc2;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.done-btn:hover {
  background: rgba(0, 255, 194, 0.15);
}

.picker-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
  cursor: pointer;
}

.display-value {
  font-size: 72px;
  font-weight: 700;
  color: #00ffc2;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 40px rgba(0, 255, 194, 0.5);
}

.direct-input {
  width: 120px;
  font-size: 72px;
  font-weight: 700;
  color: #00ffc2;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 40px rgba(0, 255, 194, 0.5);
  background: transparent;
  border: none;
  border-bottom: 2px solid #00ffc2;
  text-align: center;
  outline: none;
}

.display-unit {
  font-size: 22px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}

.picker-wheel {
  position: relative;
  height: 280px;
  overflow: hidden;
  margin-bottom: 20px;
  touch-action: none;
  cursor: grab;
}

.picker-wheel:active {
  cursor: grabbing;
}

.wheel-gradient {
  position: absolute;
  left: 0;
  right: 0;
  height: 105px;
  pointer-events: none;
  z-index: 2;
}

.wheel-gradient.top {
  top: 0;
  background: linear-gradient(to bottom, #0a1a24 20%, transparent);
}

.wheel-gradient.bottom {
  bottom: 0;
  background: linear-gradient(to top, #040d16 20%, transparent);
}

.wheel-values {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -175px;
  transition: transform 0.12s ease-out;
}

.wheel-item {
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.15);
  font-variant-numeric: tabular-nums;
  transition: all 0.12s ease;
}

.wheel-item.active {
  font-size: 56px;
  font-weight: 700;
  color: white;
}

.wheel-indicator {
  position: absolute;
  top: 50%;
  left: 40px;
  right: 40px;
  height: 70px;
  transform: translateY(-50%);
  border-top: 2px solid rgba(0, 255, 194, 0.15);
  border-bottom: 2px solid rgba(0, 255, 194, 0.15);
  border-radius: 14px;
  pointer-events: none;
  background: rgba(0, 255, 194, 0.02);
}

.picker-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.preset-btn {
  padding: 14px 22px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.preset-btn.active {
  background: rgba(0, 255, 194, 0.1);
  border-color: rgba(0, 255, 194, 0.2);
  color: #00ffc2;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
