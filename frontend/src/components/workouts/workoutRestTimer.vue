<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="!minimized"
        class="rest-timer-overlay"
        data-test="rest-timer"
      >
        <button class="minimize-btn" @click="minimize">
          <q-icon name="mdi-chevron-down" size="24px" />
        </button>

        <div class="timer-container">
          <svg class="timer-ring" viewBox="0 0 200 200">
            <circle
              class="ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              class="ring-progress"
              :class="{ ending: remaining <= 5 }"
              cx="100"
              cy="100"
              r="90"
              :style="{ strokeDashoffset: strokeOffset }"
            />
          </svg>

          <div class="timer-display" :class="{ ending: remaining <= 5 }">
            <span class="time-value">{{ formattedTime }}</span>
            <span class="time-label">PAUSE</span>
          </div>
        </div>

        <button class="skip-btn" data-test="skip-rest-btn" @click="skip">
          <q-icon name="mdi-skip-forward" size="20px" />
          Überspringen
        </button>
      </div>
    </Transition>

    <Transition name="slide-up">
      <div
        v-if="minimized"
        class="rest-timer-mini"
        data-test="rest-timer-mini"
        @click="expand"
      >
        <div class="mini-progress" :style="{ width: `${progress}%` }" />
        <q-icon name="mdi-timer-outline" size="18px" />
        <span class="mini-time">{{ formattedTime }}</span>
        <q-icon name="mdi-chevron-up" size="16px" class="expand-icon" />
      </div>
    </Transition>
  </Teleport>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'

export default defineComponent({
  name: 'WorkoutRestTimer',

  props: {
    seconds: { type: Number, required: true }
  },

  emits: ['skip', 'done'],

  setup(props, { emit }) {
    const remaining = ref(props.seconds)
    const minimized = ref(false)
    const interval = ref(null)

    const circumference = 2 * Math.PI * 90

    const progress = computed(() => {
      return (remaining.value / props.seconds) * 100
    })

    const strokeOffset = computed(() => {
      const progressPercent = 1 - (remaining.value / props.seconds)
      return circumference * (1 - progressPercent)
    })

    const formattedTime = computed(() => {
      const mins = Math.floor(remaining.value / 60)
      const secs = remaining.value % 60
      if (mins > 0) {
        return `${mins}:${secs.toString().padStart(2, '0')}`
      }
      return `${secs}`
    })

    const startTimer = () => {
      interval.value = setInterval(() => {
        remaining.value--
        if (remaining.value <= 0) {
          clearInterval(interval.value)
          emit('done')
        }
      }, 1000)
    }

    const skip = () => {
      if (interval.value) {
        clearInterval(interval.value)
      }
      emit('skip')
    }

    const minimize = () => {
      minimized.value = true
    }

    const expand = () => {
      minimized.value = false
    }

    onMounted(() => {
      startTimer()
    })

    onUnmounted(() => {
      if (interval.value) {
        clearInterval(interval.value)
      }
    })

    return {
      remaining,
      minimized,
      progress,
      strokeOffset,
      formattedTime,
      skip,
      minimize,
      expand
    }
  }
})
</script>

<style scoped>
.rest-timer-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(4, 13, 22, 0.95);
  backdrop-filter: blur(20px);
}

.minimize-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
}

.minimize-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.timer-container {
  position: relative;
  width: 280px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.timer-ring {
  position: absolute;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  filter: drop-shadow(0 0 20px rgba(0, 255, 194, 0.3));
}

.ring-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.08);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: #00ffc2;
  stroke-width: 8;
  stroke-linecap: round;
  stroke-dasharray: 565.49;
  transition: stroke-dashoffset 0.5s ease-out;
}

.ring-progress.ending {
  stroke: #ffc107;
  animation: ring-pulse 1s ease-in-out infinite;
  filter: drop-shadow(0 0 25px rgba(255, 193, 7, 0.5));
}

@keyframes ring-pulse {
  0%, 100% {
    stroke-width: 8;
    filter: drop-shadow(0 0 25px rgba(255, 193, 7, 0.5));
  }
  50% {
    stroke-width: 10;
    filter: drop-shadow(0 0 35px rgba(255, 193, 7, 0.8));
  }
}

.timer-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
}

.time-value {
  font-size: 72px;
  font-weight: 700;
  color: white;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  text-shadow: 0 0 40px rgba(0, 255, 194, 0.4);
}

.timer-display.ending .time-value {
  color: #ffc107;
  text-shadow: 0 0 40px rgba(255, 193, 7, 0.5);
  animation: value-pulse 1s ease-in-out infinite;
}

@keyframes value-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}

.time-label {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  letter-spacing: 0.2em;
}

.skip-btn {
  position: absolute;
  bottom: 60px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 50px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.skip-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.25);
  color: white;
  transform: scale(1.02);
}

/* Minimized View */
.rest-timer-mini {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9998;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 24px;
  background: rgba(4, 13, 22, 0.9);
  border: 1px solid rgba(0, 255, 194, 0.3);
  border-radius: 50px;
  color: #00ffc2;
  cursor: pointer;
  overflow: hidden;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 20px rgba(0, 255, 194, 0.15);
  transition: all 0.2s ease;
}

.rest-timer-mini:hover {
  border-color: rgba(0, 255, 194, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3), 0 0 30px rgba(0, 255, 194, 0.25);
  transform: translateX(-50%) scale(1.02);
}

.mini-progress {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  background: rgba(0, 255, 194, 0.1);
  transition: width 0.5s ease-out;
}

.mini-time {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  position: relative;
}

.expand-icon {
  color: rgba(255, 255, 255, 0.5);
  margin-left: 4px;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

@media (max-width: 480px) {
  .timer-container {
    width: 240px;
    height: 240px;
  }

  .time-value {
    font-size: 56px;
  }

  .skip-btn {
    bottom: 40px;
    padding: 14px 28px;
    font-size: 14px;
  }
}
</style>
