<template>
  <q-dialog v-model="dialogVisible" persistent data-test="exercise-picker-dialog">
    <div class="picker-dialog">
      <div class="dialog-header">
        <span class="dialog-title">{{ $t('plans.exercisePicker.title') }}</span>
        <button class="close-btn" data-test="close-btn" @click="close">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <div class="search-wrapper">
          <q-icon name="mdi-magnify" class="search-icon" />
          <input
            v-model="search"
            type="text"
            class="search-input"
            :placeholder="$t('plans.exercisePicker.searchPlaceholder')"
            data-test="search-input"
            @input="debouncedSearch"
          >
        </div>

        <div class="exercises-list" data-test="exercises-list">
          <div v-if="loading" class="loading-state">
            <q-spinner color="primary" size="32px" />
          </div>

          <div
            v-for="exercise in exercises"
            :key="exercise.id"
            class="exercise-option"
            :class="{ selected: selectedExercise?.id === exercise.id }"
            :data-test="`exercise-option-${exercise.id}`"
            @click="selectExercise(exercise)"
          >
            <div class="option-radio">
              <div class="radio-inner"></div>
            </div>
            <div class="option-info">
              <span class="option-name">{{ exercise.name }}</span>
              <span class="option-meta">
                {{ exercise.muscleGroups?.slice(0, 2).map(mg => $t(muscleGroupLabels[mg])).join(', ') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="selectedExercise" class="config-section" data-test="config-section">
          <div class="config-row">
            <div class="config-field config-field-full">
              <label class="config-label">{{ $t('plans.dayType.label') }}</label>
              <div class="day-type-toggle" data-test="config-day-type">
                <button
                  v-for="option in dayTypeOptions"
                  :key="option.value"
                  type="button"
                  class="day-type-btn"
                  :class="{ active: config.dayType === option.value }"
                  @click="config.dayType = option.value"
                >
                  {{ $t(option.labelKey) }}
                </button>
              </div>
            </div>
          </div>
          <div class="config-row">
            <div class="config-field">
              <label class="config-label">{{ $t('plans.exercisePicker.setsLabel') }}</label>
              <input v-model.number="config.sets" type="number" min="1" class="config-input" data-test="config-sets">
            </div>
            <div class="config-field">
              <label class="config-label">{{ $t('plans.exercisePicker.minRepsLabel') }}</label>
              <input v-model.number="config.minReps" type="number" min="1" class="config-input" data-test="config-min-reps">
            </div>
            <div class="config-field">
              <label class="config-label">{{ $t('plans.exercisePicker.maxRepsLabel') }}</label>
              <input v-model.number="config.maxReps" type="number" min="1" class="config-input" data-test="config-max-reps">
            </div>
          </div>
          <div class="config-row">
            <div class="config-field">
              <label class="config-label">{{ $t('plans.exercisePicker.targetWeightLabel') }}</label>
              <input v-model.number="config.targetWeight" type="number" min="0" step="0.5" class="config-input" :placeholder="$t('plans.exercisePicker.optional')" data-test="config-weight">
            </div>
            <div class="config-field">
              <label class="config-label">{{ $t('plans.exercisePicker.restLabel') }}</label>
              <input v-model.number="config.restSeconds" type="number" min="0" class="config-input" placeholder="60" data-test="config-rest">
            </div>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="cancel-btn" @click="close">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="action-btn primary"
          :disabled="!selectedExercise"
          data-test="add-btn"
          @click="addExercise"
        >
          {{ $t('plans.exercisePicker.add') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { debounce } from 'quasar'
import { api } from 'boot/axios'
import { muscleGroupLabels } from 'src/constants/muscleGroups'

export default defineComponent({
  name: 'ExercisePicker',

  props: {
    planId: { type: String, default: null }
  },

  emits: ['added'],

  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const search = ref('')
    const exercises = ref([])
    const loading = ref(false)
    const selectedExercise = ref(null)

    const config = reactive({
      sets: 3,
      minReps: 8,
      maxReps: 12,
      targetWeight: null,
      restSeconds: null,
      dayType: 'BOTH'
    })

    const dayTypeOptions = [
      { value: 'BOTH', labelKey: 'plans.dayType.both' },
      { value: 'A', labelKey: 'plans.dayType.a' },
      { value: 'B', labelKey: 'plans.dayType.b' }
    ]

    const resetConfig = () => {
      config.sets = 3
      config.minReps = 8
      config.maxReps = 12
      config.targetWeight = null
      config.restSeconds = null
      config.dayType = 'BOTH'
    }

    const loadExercises = async () => {
      loading.value = true
      const params = new URLSearchParams()
      if (search.value) params.append('search', search.value)
      const { data } = await api.get(`/api/exercises?${params.toString()}`)
      exercises.value = data
      loading.value = false
    }

    const debouncedSearch = debounce(() => {
      loadExercises()
    }, 300)

    const open = () => {
      search.value = ''
      selectedExercise.value = null
      resetConfig()
      dialogVisible.value = true
      loadExercises()
    }

    const close = () => {
      dialogVisible.value = false
    }

    const selectExercise = (exercise) => {
      if (selectedExercise.value?.id === exercise.id) {
        selectedExercise.value = null
      } else {
        selectedExercise.value = exercise
      }
    }

    const addExercise = async () => {
      const { data } = await api.post(`/api/plans/${props.planId}/exercises`, {
        exerciseId: selectedExercise.value.id,
        sets: config.sets,
        minReps: config.minReps,
        maxReps: config.maxReps,
        targetWeight: config.targetWeight || null,
        restSeconds: config.restSeconds || null,
        dayType: config.dayType
      })
      emit('added', data)
      close()
    }

    return {
      dialogVisible,
      search,
      exercises,
      loading,
      selectedExercise,
      config,
      dayTypeOptions,
      muscleGroupLabels,
      debouncedSearch,
      open,
      close,
      selectExercise,
      addExercise
    }
  }
})
</script>

<style scoped>
.picker-dialog {
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  background: rgba(4, 13, 22, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.dialog-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.dialog-content {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.search-wrapper {
  position: relative;
  margin-bottom: 16px;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.3);
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.search-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
}

.exercises-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.loading-state {
  display: flex;
  justify-content: center;
  padding: 24px;
}

.exercise-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.exercise-option:hover {
  background: rgba(255, 255, 255, 0.03);
}

.exercise-option.selected {
  background: rgba(0, 255, 194, 0.1);
}

.option-radio {
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.exercise-option.selected .option-radio {
  border-color: #00ffc2;
}

.radio-inner {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background: transparent;
  transition: all 0.2s ease;
}

.exercise-option.selected .radio-inner {
  background: #00ffc2;
}

.option-info {
  flex: 1;
  min-width: 0;
}

.option-name {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.option-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.config-section {
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.config-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.config-row:last-child {
  margin-bottom: 0;
}

.config-field {
  flex: 1;
}

.config-field-full {
  width: 100%;
}

.config-label {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.config-input {
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.config-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.config-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
}

.day-type-toggle {
  display: flex;
  gap: 8px;
}

.day-type-btn {
  flex: 1;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
}

.day-type-btn.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.35);
  color: #00ffc2;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.action-btn {
  flex: 1;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.action-btn.primary {
  background: rgba(0, 255, 194, 0.15);
  border: 1px solid rgba(0, 255, 194, 0.3);
  color: #00ffc2;
}

.action-btn.primary:hover:not(:disabled) {
  background: rgba(0, 255, 194, 0.25);
}

.action-btn.primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
