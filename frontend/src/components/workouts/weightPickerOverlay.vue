<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="modelValue" class="picker-overlay" @click.self="close">
        <Transition name="slide-up">
          <div v-if="modelValue" class="picker-sheet">
            <div class="picker-header">
              <span class="picker-label">{{ $t('workouts.pickers.weight') }}</span>
              <button class="done-btn" @click="close">
                {{ $t('common.done') }}
              </button>
            </div>

            <div class="picker-display" @click="openDirectInput">
              <template v-if="directInputActive">
                <input
                  ref="directInputRef"
                  v-model="directInputValue"
                  type="text"
                  inputmode="decimal"
                  class="direct-input"
                  @blur="applyDirectInput"
                  @keyup.enter="applyDirectInput"
                />
              </template>
              <template v-else>
                <span class="display-value">{{ displayValue }}</span>
              </template>
              <span class="display-unit">{{ $t('units.kg') }}</span>
            </div>

            <div class="dual-wheel">
              <div
                class="wheel-container"
                @touchstart="(e) => onTouchStart(e, 'kg')"
                @touchmove="(e) => onTouchMove(e, 'kg')"
                @touchend="() => onTouchEnd('kg')"
                @wheel="(e) => onWheel(e, 'kg')"
              >
                <div class="wheel-gradient top" />
                <div class="wheel-gradient bottom" />
                <div class="wheel-values" :style="{ transform: `translateY(${kgOffset}px)` }">
                  <div
                    v-for="(val, idx) in kgValues"
                    :key="idx"
                    class="wheel-item"
                    :class="{ active: val === currentKg }"
                  >
                    {{ val }}
                  </div>
                </div>
                <div class="wheel-label">{{ $t('units.kg') }}</div>
              </div>

              <div class="wheel-separator">
                <span class="separator-dot">,</span>
              </div>

              <div
                class="wheel-container decimal"
                @touchstart="(e) => onTouchStart(e, 'decimal')"
                @touchmove="(e) => onTouchMove(e, 'decimal')"
                @touchend="() => onTouchEnd('decimal')"
                @wheel="(e) => onWheel(e, 'decimal')"
              >
                <div class="wheel-gradient top" />
                <div class="wheel-gradient bottom" />
                <div class="wheel-values" :style="{ transform: `translateY(${decimalOffset}px)` }">
                  <div
                    v-for="(val, idx) in decimalValues"
                    :key="idx"
                    class="wheel-item"
                    :class="{ active: val === currentDecimal }"
                  >
                    {{ formatDecimal(val) }}
                  </div>
                </div>
              </div>

              <div class="wheel-indicator" />
            </div>

            <div v-if="presets.length" class="picker-presets">
              <button
                v-for="preset in presets"
                :key="preset"
                class="preset-btn"
                :class="{ active: totalValue === preset }"
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
  name: 'WeightPickerOverlay',

  props: {
    modelValue: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    presets: { type: Array, default: () => [] }
  },

  emits: ['update:modelValue', 'change'],

  setup(props, { emit }) {
    const currentKg = ref(0)
    const currentDecimal = ref(0)
    const kgOffset = ref(0)
    const decimalOffset = ref(0)
    const touchStartY = ref(0)
    const touchStartOffset = ref(0)
    const directInputActive = ref(false)
    const directInputValue = ref('')
    const directInputRef = ref(null)
    const itemHeight = 70

    const decimalOptions = [0, 10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90]

    const kgValues = computed(() => {
      const values = []
      const range = 4
      for (let i = currentKg.value - range; i <= currentKg.value + range; i++) {
        if (i >= 0 && i <= 300) {
          values.push(i)
        }
      }
      return values
    })

    const decimalValues = computed(() => {
      const values = []
      const currentIndex = decimalOptions.indexOf(currentDecimal.value)
      const range = 4
      const len = decimalOptions.length
      for (let i = currentIndex - range; i <= currentIndex + range; i++) {
        const wrappedIndex = ((i % len) + len) % len
        values.push(decimalOptions[wrappedIndex])
      }
      return values
    })

    const totalValue = computed(() => {
      return currentKg.value + currentDecimal.value / 100
    })

    const formatDecimal = (val) => {
      if (val === 0) return '0'
      if (val === 25 || val === 75) return String(val)
      return String(val / 10)
    }

    const displayValue = computed(() => {
      return `${currentKg.value},${formatDecimal(currentDecimal.value)}`
    })

    const parseValue = (val) => {
      const kg = Math.floor(val)
      const decPart = Math.round((val - kg) * 100)
      const closest = decimalOptions.reduce((prev, curr) =>
        Math.abs(curr - decPart) < Math.abs(prev - decPart) ? curr : prev
      )
      return { kg, decimal: closest }
    }

    const emitChange = () => {
      emit('change', totalValue.value)
    }

    const onTouchStart = (e, type) => {
      touchStartY.value = e.touches[0].clientY
      touchStartOffset.value = type === 'kg' ? kgOffset.value : decimalOffset.value
    }

    const onTouchMove = (e, type) => {
      const deltaY = e.touches[0].clientY - touchStartY.value
      if (type === 'kg') {
        kgOffset.value = touchStartOffset.value + deltaY
      } else {
        decimalOffset.value = touchStartOffset.value + deltaY
      }
    }

    const onTouchEnd = (type) => {
      if (type === 'kg') {
        const steps = Math.round(-kgOffset.value / itemHeight)
        const newValue = currentKg.value + steps
        currentKg.value = Math.max(0, Math.min(300, newValue))
        kgOffset.value = 0
      } else {
        const steps = Math.round(-decimalOffset.value / itemHeight)
        const currentIndex = decimalOptions.indexOf(currentDecimal.value)
        const len = decimalOptions.length
        const newIndex = ((currentIndex + steps) % len + len) % len
        currentDecimal.value = decimalOptions[newIndex]
        decimalOffset.value = 0
      }
      emitChange()
    }

    const onWheel = (e, type) => {
      e.preventDefault()
      const direction = e.deltaY > 0 ? 1 : -1
      if (type === 'kg') {
        const newValue = currentKg.value + direction
        currentKg.value = Math.max(0, Math.min(300, newValue))
      } else {
        const currentIndex = decimalOptions.indexOf(currentDecimal.value)
        const len = decimalOptions.length
        const newIndex = ((currentIndex + direction) % len + len) % len
        currentDecimal.value = decimalOptions[newIndex]
      }
      emitChange()
    }

    const selectPreset = (preset) => {
      const { kg, decimal } = parseValue(preset)
      currentKg.value = kg
      currentDecimal.value = decimal
      emitChange()
    }

    const openDirectInput = () => {
      directInputValue.value = totalValue.value.toString().replace('.', ',')
      directInputActive.value = true
      nextTick(() => {
        directInputRef.value?.focus()
        directInputRef.value?.select()
      })
    }

    const applyDirectInput = () => {
      const parsed = parseFloat(directInputValue.value.replace(',', '.'))
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 300) {
        const { kg, decimal } = parseValue(parsed)
        currentKg.value = kg
        currentDecimal.value = decimal
        emitChange()
      }
      directInputActive.value = false
    }

    const close = () => {
      directInputActive.value = false
      emit('update:modelValue', false)
    }

    watch(() => props.modelValue, (open) => {
      if (open) {
        const { kg, decimal } = parseValue(props.value)
        currentKg.value = kg
        currentDecimal.value = decimal
        kgOffset.value = 0
        decimalOffset.value = 0
      }
    })

    return {
      currentKg,
      currentDecimal,
      kgOffset,
      decimalOffset,
      kgValues,
      decimalValues,
      totalValue,
      displayValue,
      formatDecimal,
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
  gap: 8px;
  margin-bottom: 16px;
  cursor: pointer;
}

.display-value {
  font-size: 56px;
  font-weight: 700;
  color: #00ffc2;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 40px rgba(0, 255, 194, 0.5);
}

.direct-input {
  width: 140px;
  font-size: 56px;
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

.dual-wheel {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 20px;
}

.wheel-container {
  position: relative;
  width: 110px;
  height: 280px;
  overflow: hidden;
  touch-action: none;
  cursor: grab;
}

.wheel-container.decimal {
  width: 90px;
}

.wheel-container:active {
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
  font-size: 34px;
  font-weight: 300;
  color: rgba(255, 255, 255, 0.15);
  font-variant-numeric: tabular-nums;
  transition: all 0.12s ease;
}

.wheel-item.active {
  font-size: 48px;
  font-weight: 700;
  color: white;
}

.wheel-label {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  z-index: 3;
}

.wheel-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 20px;
}

.separator-dot {
  font-size: 44px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.25);
}

.wheel-indicator {
  position: absolute;
  top: 50%;
  left: 12px;
  right: 12px;
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
  padding: 12px 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 24px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 15px;
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
