<template>
  <div class="active-workout-page dark-page" data-test="active-workout-page">
    <div class="content-container">
      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="48px" />
        <span class="loading-text">{{ $t('workouts.loading') }}</span>
      </div>

      <template v-else-if="workout">
        <template v-if="workout.status === 'COMPLETED' || workout.status === 'ABANDONED'">
          <workout-summary :workout="workout" :grouped-sets="groupedSets" />
        </template>

        <template v-else>
          <header class="workout-header glass-card">
            <div class="header-top">
              <div class="plan-info">
                <div class="plan-title-row">
                  <h1 class="plan-name">{{ workout.planName }}</h1>
                  <span v-if="workout.dayType" class="day-type-badge">{{ $t(`plans.dayType.${workout.dayType.toLowerCase()}`) }}</span>
                </div>
                <div class="timer-display" :class="{ paused: workout.status === 'PAUSED' }">
                  <q-icon name="mdi-timer-outline" size="18px" />
                  <span class="timer-value">{{ formattedDuration }}</span>
                  <span v-if="workout.status === 'PAUSED'" class="pause-indicator">{{ $t('workouts.pauseLabel') }}</span>
                </div>
              </div>
            </div>

            <div class="header-actions">
              <button
                class="action-btn pause-btn"
                :data-test="workout.status === 'PAUSED' ? 'resume-btn' : 'pause-btn'"
                @click="togglePause"
              >
                <q-icon :name="workout.status === 'PAUSED' ? 'mdi-play' : 'mdi-pause'" size="18px" />
                <q-tooltip>{{ workout.status === 'PAUSED' ? $t('workouts.resume') : $t('workouts.pause') }}</q-tooltip>
              </button>
              <button class="action-btn abandon-btn" data-test="abandon-btn" @click="confirmAbandon">
                <q-icon name="mdi-close" size="18px" />
                <q-tooltip>{{ $t('workouts.abandon') }}</q-tooltip>
              </button>
              <button class="action-btn complete-btn" data-test="complete-btn" @click="confirmComplete">
                <q-icon name="mdi-check" size="18px" />
                {{ $t('workouts.finish') }}
              </button>
            </div>
          </header>

          <workout-rest-timer
            v-if="restTimerActive"
            :seconds="restSeconds"
            @skip="skipRest"
            @done="onRestDone"
          />

          <div class="exercises-list">
            <div v-for="group in groupedSets" :key="group.exerciseId" class="exercise-group glass-card">
              <div class="exercise-header">
                <span class="exercise-name">{{ group.exerciseName }}</span>
                <span class="sets-progress">{{ group.completedCount }}/{{ group.sets.length }}</span>
              </div>

              <div class="sets-list">
                <workout-set-item
                  v-for="set in group.sets"
                  :key="set.id"
                  :set="set"
                  :workout-id="workout.id"
                  :is-current="!set.completedAt"
                  @complete="onSetComplete"
                  @update="onSetUpdate"
                />
              </div>

              <workout-exercise-note
                :exercise-id="group.exerciseId"
                :note="group.userNote"
                @saved="note => onNoteSaved(group.exerciseId, note)"
              />
            </div>
          </div>
        </template>
      </template>

      <div v-else class="not-found glass-card">
        <q-icon name="mdi-alert-circle-outline" size="48px" class="not-found-icon" />
        <span class="not-found-text">{{ $t('workouts.notFound') }}</span>
        <button class="back-btn" @click="$router.push('/workouts')">
          {{ $t('workouts.backToList') }}
        </button>
      </div>
    </div>

    <q-dialog v-model="showAbandonDialog" class="abandon-dialog">
      <div class="dialog-card glass-card">
        <h3 class="dialog-title">{{ $t('workouts.abandonDialog.title') }}</h3>
        <p class="dialog-text">{{ $t('workouts.abandonDialog.text') }}</p>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showAbandonDialog = false">{{ $t('workouts.abandonDialog.cancel') }}</button>
          <button class="confirm-btn" @click="abandonWorkout">{{ $t('workouts.abandonDialog.confirm') }}</button>
        </div>
      </div>
    </q-dialog>

    <q-dialog v-model="showCompleteDialog" class="complete-dialog">
      <div class="dialog-card glass-card">
        <h3 class="dialog-title">{{ $t('workouts.finishWarning.title') }}</h3>
        <p class="dialog-text">{{ $t('workouts.finishWarning.text') }}</p>
        <div v-if="missingSetGroups.length" class="missing-sets">
          <div class="missing-title">{{ $t('workouts.finishWarning.missingTitle') }}</div>
          <div v-for="group in missingSetGroups" :key="group.exerciseId" class="missing-group">
            <div class="missing-exercise">{{ group.exerciseName }}</div>
            <div class="missing-set-list">
              <span
                v-for="setNumber in group.setNumbers"
                :key="`${group.exerciseId}-${setNumber}`"
                class="missing-set"
              >
                {{ $t('workouts.finishWarning.setLabel', { number: setNumber }) }}
              </span>
            </div>
          </div>
        </div>
        <div class="dialog-actions">
          <button class="cancel-btn" @click="showCompleteDialog = false">{{ $t('workouts.finishWarning.cancel') }}</button>
          <button class="confirm-btn" @click="completeWorkout(true)">{{ $t('workouts.finishWarning.confirm') }}</button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { api } from 'boot/axios'
import WorkoutSetItem from 'components/workouts/workoutSetItem.vue'
import WorkoutRestTimer from 'components/workouts/workoutRestTimer.vue'
import WorkoutSummary from 'components/workouts/workoutSummary.vue'
import WorkoutExerciseNote from 'components/workouts/workoutExerciseNote.vue'

export default defineComponent({
  name: 'WorkoutActivePage',

  components: {
    WorkoutSetItem,
    WorkoutRestTimer,
    WorkoutSummary,
    WorkoutExerciseNote
  },

  setup() {
    const route = useRoute()
    const workout = ref(null)
    const loading = ref(true)
    const showAbandonDialog = ref(false)
    const showCompleteDialog = ref(false)
    const restTimerActive = ref(false)
    const restSeconds = ref(0)
    const timerInterval = ref(null)
    const now = ref(Date.now())

    const duration = computed(() => {
      if (!workout.value) return 0
      const start = new Date(workout.value.startedAt).getTime()
      let elapsed = now.value - start - (workout.value.totalPausedMs || 0)
      if (workout.value.pausedAt) {
        elapsed -= (now.value - new Date(workout.value.pausedAt).getTime())
      }
      return Math.max(0, elapsed)
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

    const groupedSets = computed(() => {
      if (!workout.value) return []

      const groups = {}
      for (const set of workout.value.sets) {
        const exerciseId = set.planExercise.exercise.id
        if (!groups[exerciseId]) {
          groups[exerciseId] = {
            exerciseId,
            exerciseName: set.planExercise.exercise.name,
            userNote: set.planExercise.exercise.userNote,
            sets: [],
            completedCount: 0
          }
        }
        groups[exerciseId].sets.push(set)
        if (set.completedAt) groups[exerciseId].completedCount++
      }

      return Object.values(groups)
    })

    const missingSetGroups = computed(() => {
      return groupedSets.value.map(group => {
        const missingSets = group.sets.filter(set => !set.completedAt)
        return {
          exerciseId: group.exerciseId,
          exerciseName: group.exerciseName,
          setNumbers: missingSets.map(set => set.setNumber)
        }
      }).filter(group => group.setNumbers.length > 0)
    })

    const hasMissingSets = computed(() => missingSetGroups.value.length > 0)

    const fetchWorkout = async () => {
      loading.value = true
      const { data } = await api.get(`/api/workouts/${route.params.id}`)
      workout.value = data
      loading.value = false
    }

    const togglePause = async () => {
      const action = workout.value.status === 'PAUSED' ? 'resume' : 'pause'
      const { data } = await api.patch(`/api/workouts/${workout.value.id}`, { action })
      workout.value = data
    }

    const confirmAbandon = () => {
      showAbandonDialog.value = true
    }

    const abandonWorkout = async () => {
      const { data } = await api.patch(`/api/workouts/${workout.value.id}`, { action: 'abandon' })
      workout.value = data
      showAbandonDialog.value = false
    }

    const confirmComplete = () => {
      if (hasMissingSets.value) {
        showCompleteDialog.value = true
        return
      }
      completeWorkout()
    }

    const completeWorkout = async (forceComplete = false) => {
      try {
        const payload = { action: 'complete' }
        if (forceComplete) {
          payload.forceComplete = true
        }
        const { data } = await api.patch(`/api/workouts/${workout.value.id}`, payload)
        workout.value = data
        showCompleteDialog.value = false
      } catch (e) {
        if (e.response?.status === 409) {
          showCompleteDialog.value = true
          return
        }
        throw e
      }
    }

    const onSetComplete = (result) => {
      const setIndex = workout.value.sets.findIndex(s => s.id === result.set.id)
      if (setIndex !== -1) {
        workout.value.sets[setIndex] = result.set
      }

      const nextSet = workout.value.sets[setIndex + 1]
      const shouldShowRestTimer = Boolean(
        nextSet &&
        !nextSet.completedAt &&
        nextSet.planExercise.id === result.set.planExercise.id
      )

      if (shouldShowRestTimer && result.restSeconds) {
        restSeconds.value = result.restSeconds
        restTimerActive.value = true
      } else {
        restTimerActive.value = false
      }
    }

    const onSetUpdate = (updatedSet) => {
      const setIndex = workout.value.sets.findIndex(s => s.id === updatedSet.id)
      if (setIndex !== -1) {
        workout.value.sets[setIndex].weight = updatedSet.weight
        workout.value.sets[setIndex].reps = updatedSet.reps
      }
    }

    const onNoteSaved = (exerciseId, note) => {
      for (const set of workout.value.sets) {
        if (set.planExercise.exercise.id !== exerciseId) continue
        set.planExercise.exercise.userNote = note
      }
    }

    const skipRest = () => {
      restTimerActive.value = false
    }

    const onRestDone = () => {
      restTimerActive.value = false
    }

    const startTimer = () => {
      timerInterval.value = setInterval(() => {
        now.value = Date.now()
      }, 1000)
    }

    const stopTimer = () => {
      if (timerInterval.value) {
        clearInterval(timerInterval.value)
        timerInterval.value = null
      }
    }

    onMounted(() => {
      fetchWorkout()
      startTimer()
    })

    onUnmounted(() => {
      stopTimer()
    })

    return {
      workout,
      loading,
      showAbandonDialog,
      showCompleteDialog,
      restTimerActive,
      restSeconds,
      formattedDuration,
      groupedSets,
      missingSetGroups,
      togglePause,
      confirmAbandon,
      abandonWorkout,
      confirmComplete,
      completeWorkout,
      onSetComplete,
      onSetUpdate,
      onNoteSaved,
      skipRest,
      onRestDone
    }
  }
})
</script>

<style scoped>
.active-workout-page {
  min-height: 100vh;
  padding-bottom: 24px;
}

.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px 16px 24px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  gap: 16px;
}

.loading-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.workout-header {
  padding: 16px;
  margin-bottom: 16px;
}

.header-top {
  margin-bottom: 16px;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.plan-name {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
}

.day-type-badge {
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  background: rgba(0, 255, 194, 0.12);
  border: 1px solid rgba(0, 255, 194, 0.3);
  color: #00ffc2;
}

.timer-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #00ffc2;
}

.timer-display.paused {
  color: #ffc107;
}

.timer-value {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pause-indicator {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  background: rgba(255, 193, 7, 0.2);
  border-radius: 4px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pause-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.pause-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.abandon-btn {
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.2);
  color: #ff5252;
}

.abandon-btn:hover {
  background: rgba(255, 82, 82, 0.2);
}

.complete-btn {
  background: #00ffc2;
  border: none;
  color: #040d16;
  flex: 1;
}

.complete-btn:hover {
  background: #00e6af;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercise-group {
  padding: 16px;
}

.exercise-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.exercise-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.sets-progress {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.sets-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 24px;
  gap: 16px;
}

.not-found-icon {
  color: rgba(255, 255, 255, 0.15);
}

.not-found-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 15px;
}

.back-btn {
  margin-top: 8px;
  padding: 12px 20px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 12px;
  color: #00ffc2;
  font-size: 14px;
  cursor: pointer;
}

.dialog-card {
  padding: 24px;
  max-width: 340px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
}

.dialog-text {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.missing-sets {
  margin: 16px 0 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.missing-title {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.45);
}

.missing-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.missing-exercise {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.missing-set-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.missing-set {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(255, 82, 82, 0.15);
  border: 1px solid rgba(255, 82, 82, 0.25);
  padding: 4px 8px;
  border-radius: 999px;
}

.cancel-btn {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.confirm-btn {
  padding: 10px 16px;
  background: rgba(255, 82, 82, 0.2);
  border: 1px solid rgba(255, 82, 82, 0.3);
  border-radius: 8px;
  color: #ff5252;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn:hover {
  background: rgba(255, 82, 82, 0.3);
}

@media (max-width: 480px) {
  .content-container {
    padding: 12px 12px 16px;
  }

  .timer-value {
    font-size: 20px;
  }
}
</style>
