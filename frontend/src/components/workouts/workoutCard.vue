<template>
  <div class="workout-card glass-card" data-test="workout-card" @click="$router.push(`/workouts/${workout.id}`)">
    <div class="card-content">
      <div class="card-main">
        <div class="status-indicator" :class="statusClass" />

        <div class="card-info">
          <div class="workout-header">
            <span class="plan-name" data-test="plan-name">{{ workout.planName }}</span>
            <span v-if="workout.dayType" class="day-type-badge">
              {{ $t(`plans.dayType.${workout.dayType.toLowerCase()}`) }}
            </span>
            <span class="status-badge" :class="statusClass" data-test="status-badge">
              {{ statusLabel }}
            </span>
          </div>

          <div class="workout-meta">
            <span class="meta-text date-text" data-test="date">
              <q-icon name="mdi-calendar-outline" size="14px" />
              {{ formatDate(workout.startedAt) }}
            </span>
            <span class="meta-text duration-text" data-test="duration">
              <q-icon name="mdi-timer-outline" size="14px" />
              {{ formatDuration(workout.duration) }}
            </span>
            <span class="meta-text sets-text" data-test="sets">
              <q-icon name="mdi-checkbox-marked-circle-outline" size="14px" />
              {{ workout.setsCompleted }}/{{ workout.totalSets }} {{ $t('units.sets') }}
            </span>
          </div>
        </div>
      </div>

      <div class="card-arrow">
        <q-icon name="mdi-chevron-right" size="20px" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const STATUS_CONFIG = {
  COMPLETED: { labelKey: 'workoutStatus.COMPLETED', class: 'completed' },
  ABANDONED: { labelKey: 'workoutStatus.ABANDONED', class: 'abandoned' },
  IN_PROGRESS: { labelKey: 'workoutStatus.IN_PROGRESS', class: 'active' },
  PAUSED: { labelKey: 'workoutStatus.PAUSED', class: 'active' }
}

export default defineComponent({
  name: 'WorkoutCard',

  props: {
    workout: { type: Object, required: true }
  },

  setup(props) {
    const { locale, t } = useI18n({ useScope: 'global' })
    const statusConfig = computed(() => STATUS_CONFIG[props.workout.status] || STATUS_CONFIG.IN_PROGRESS)
    const statusLabel = computed(() => t(statusConfig.value.labelKey))
    const statusClass = computed(() => statusConfig.value.class)

    const formatDate = (dateStr) => {
      const date = new Date(dateStr)
      const now = new Date()
      const diffMs = now - date
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

      if (diffDays === 0) return t('dates.today')
      if (diffDays === 1) return t('dates.yesterday')
      if (diffDays < 7) return t('dates.daysAgo', { count: diffDays })

      return new Intl.DateTimeFormat(locale.value, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    }

    const formatDuration = (ms) => {
      const totalSeconds = Math.floor(ms / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    return {
      statusLabel,
      statusClass,
      formatDate,
      formatDuration
    }
  }
})
</script>

<style scoped>
.workout-card {
  padding: 16px;
  cursor: pointer;
}

.workout-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(0, 255, 194, 0.25);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.status-indicator {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  flex-shrink: 0;
}

.status-indicator.completed {
  background: #00ffc2;
}

.status-indicator.abandoned {
  background: #ffc107;
}

.status-indicator.active {
  background: #2196f3;
}

.card-info {
  flex: 1;
  min-width: 0;
}

.workout-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.plan-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}

.status-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.03em;
}

.day-type-badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.03em;
  background: rgba(0, 255, 194, 0.12);
  border: 1px solid rgba(0, 255, 194, 0.28);
  color: #00ffc2;
}

.status-badge.completed {
  background: rgba(0, 255, 194, 0.15);
  border: 1px solid rgba(0, 255, 194, 0.25);
  color: #00ffc2;
}

.status-badge.abandoned {
  background: rgba(255, 193, 7, 0.15);
  border: 1px solid rgba(255, 193, 7, 0.25);
  color: #ffc107;
}

.status-badge.active {
  background: rgba(33, 150, 243, 0.15);
  border: 1px solid rgba(33, 150, 243, 0.25);
  color: #2196f3;
}

.workout-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.duration-text {
  color: rgba(0, 255, 194, 0.6);
}

.duration-text .q-icon {
  color: rgba(0, 255, 194, 0.6);
}

.card-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.workout-card:hover .card-arrow {
  color: #00ffc2;
  transform: translateX(4px);
}
</style>
