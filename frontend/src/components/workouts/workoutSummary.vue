<template>
  <div class="workout-summary" data-test="workout-summary">
    <header class="summary-header">
      <div class="header-icon" :class="statusClass">
        <q-icon :name="statusIcon" size="32px" />
      </div>
      <h1 class="summary-title">{{ statusTitle }}</h1>
      <p class="plan-name">{{ workout.planName }}</p>
    </header>

    <div class="stats-grid">
      <div class="stat-card glass-card">
        <q-icon name="mdi-timer-outline" size="24px" class="stat-icon" />
        <div class="stat-value">{{ formattedDuration }}</div>
        <div class="stat-label">Dauer</div>
      </div>

      <div class="stat-card glass-card">
        <q-icon name="mdi-checkbox-marked-circle-outline" size="24px" class="stat-icon" />
        <div class="stat-value">{{ completedSets }}/{{ totalSets }}</div>
        <div class="stat-label">Sätze</div>
      </div>

      <div class="stat-card glass-card">
        <q-icon name="mdi-weight-kilogram" size="24px" class="stat-icon" />
        <div class="stat-value">{{ totalVolume.toLocaleString('de-DE') }}</div>
        <div class="stat-label">Volumen (kg)</div>
      </div>

      <div class="stat-card glass-card">
        <q-icon name="mdi-dumbbell" size="24px" class="stat-icon" />
        <div class="stat-value">{{ exerciseCount }}</div>
        <div class="stat-label">Übungen</div>
      </div>
    </div>

    <div class="exercises-summary glass-card">
      <h2 class="section-title">Übungen</h2>

      <div v-for="group in groupedSets" :key="group.exerciseId" class="exercise-item">
        <div class="exercise-header">
          <span class="exercise-name">{{ group.exerciseName }}</span>
          <span class="exercise-sets">{{ group.completedCount }}/{{ group.sets.length }} Sätze</span>
        </div>

        <div class="sets-summary">
          <div v-for="set in group.sets.filter(s => s.completedAt)" :key="set.id" class="set-row">
            <span class="set-number">{{ set.setNumber }}.</span>
            <span class="set-values">{{ set.weight || '–' }} kg × {{ set.reps || '–' }} Wdh</span>
          </div>
          <div v-if="group.completedCount === 0" class="no-sets">
            Keine Sätze abgeschlossen
          </div>
        </div>
      </div>
    </div>

    <button class="back-btn" @click="$router.push('/workouts')">
      <q-icon name="mdi-arrow-left" size="18px" />
      Zurück zur Übersicht
    </button>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'

export default defineComponent({
  name: 'WorkoutSummary',

  props: {
    workout: { type: Object, required: true },
    groupedSets: { type: Array, required: true }
  },

  setup(props) {
    const statusClass = computed(() => {
      return props.workout.status === 'COMPLETED' ? 'completed' : 'abandoned'
    })

    const statusIcon = computed(() => {
      return props.workout.status === 'COMPLETED' ? 'mdi-check-circle' : 'mdi-close-circle'
    })

    const statusTitle = computed(() => {
      return props.workout.status === 'COMPLETED' ? 'Workout abgeschlossen!' : 'Workout abgebrochen'
    })

    const duration = computed(() => {
      const start = new Date(props.workout.startedAt).getTime()
      const end = new Date(props.workout.completedAt).getTime()
      return end - start - (props.workout.totalPausedMs || 0)
    })

    const formattedDuration = computed(() => {
      const totalSeconds = Math.floor(duration.value / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60

      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      }
      return `${minutes}:${seconds.toString().padStart(2, '0')}`
    })

    const completedSets = computed(() => {
      return props.workout.sets.filter(s => s.completedAt).length
    })

    const totalSets = computed(() => {
      return props.workout.sets.length
    })

    const exerciseCount = computed(() => {
      return props.groupedSets.length
    })

    const totalVolume = computed(() => {
      return props.workout.sets
        .filter(s => s.completedAt && s.weight && s.reps)
        .reduce((sum, s) => sum + (s.weight * s.reps), 0)
    })

    return {
      statusClass,
      statusIcon,
      statusTitle,
      formattedDuration,
      completedSets,
      totalSets,
      exerciseCount,
      totalVolume
    }
  }
})
</script>

<style scoped>
.workout-summary {
  padding-top: 16px;
}

.summary-header {
  text-align: center;
  margin-bottom: 24px;
}

.header-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border-radius: 50%;
}

.header-icon.completed {
  background: rgba(0, 255, 194, 0.15);
  color: #00ffc2;
}

.header-icon.abandoned {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.summary-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.plan-name {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 16px;
  text-align: center;
}

.stat-icon {
  color: #00ffc2;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercises-summary {
  padding: 20px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0 0 16px 0;
}

.exercise-item {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.exercise-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.exercise-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.exercise-sets {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.sets-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.set-row {
  display: flex;
  gap: 8px;
  font-size: 13px;
}

.set-number {
  color: rgba(255, 255, 255, 0.4);
  width: 20px;
}

.set-values {
  color: rgba(255, 255, 255, 0.7);
}

.no-sets {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}
</style>
