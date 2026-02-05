<template>
  <div
    class="set-item"
    :class="{ completed: set.completedAt && !editing, current: isCurrent || editing }"
    data-test="set-item"
  >
    <div class="set-number">
      <span class="number">{{ set.setNumber }}</span>
    </div>

    <div class="set-content">
      <div class="target-info">
        {{ $t('workouts.setItem.target') }}: {{ set.targetMinReps }}-{{ set.targetMaxReps }} {{ $t('units.reps') }}
        <template v-if="set.targetWeight"> @ {{ set.targetWeight }} {{ $t('units.kg') }}</template>
      </div>

      <div v-if="set.completedAt && !editing" class="completed-values">
        <span class="value">{{ set.weight ? formatWeight(set.weight) : '–' }} {{ $t('units.kg') }}</span>
        <span class="separator">×</span>
        <span class="value">{{ set.reps || '–' }} {{ $t('units.reps') }}</span>
        <button class="edit-btn" data-test="edit-set-btn" @click="startEdit">
          <q-icon name="mdi-pencil" size="14px" />
        </button>
        <q-icon name="mdi-check-circle" size="18px" class="check-icon" />
      </div>

      <div v-else class="input-row">
        <div class="input-group" @click="openWeightPicker">
          <label class="input-label">{{ $t('workouts.setItem.weight') }}</label>
          <div class="touch-input">
            <span class="touch-value">{{ localWeight ? formatWeight(localWeight) : '–' }}</span>
            <span class="touch-unit">{{ $t('units.kg') }}</span>
          </div>
        </div>

        <div class="input-group" @click="openRepsPicker">
          <label class="input-label">{{ $t('workouts.setItem.reps') }}</label>
          <div class="touch-input">
            <span class="touch-value">{{ localReps || '–' }}</span>
          </div>
        </div>

        <button
          v-if="editing"
          class="save-btn"
          :disabled="saving"
          data-test="save-set-btn"
          @click="saveEdit"
        >
          <q-spinner v-if="saving" color="white" size="14px" />
          <q-icon v-else name="mdi-check" size="18px" />
        </button>

        <button
          v-else
          class="complete-btn"
          :disabled="completing"
          data-test="complete-set-btn"
          @click="completeSet"
        >
          <q-spinner v-if="completing" color="primary" size="14px" />
          <q-icon v-else name="mdi-check" size="18px" />
        </button>
      </div>
    </div>

    <weight-picker-overlay
      v-model="showWeightPicker"
      :value="localWeight || 0"
      :presets="weightPresets"
      @change="onWeightChange"
    />

    <number-picker-overlay
      v-model="showRepsPicker"
      :value="localReps || 0"
      :label="$t('workouts.setItem.repetitions')"
      :min="0"
      :max="100"
      :step="1"
      :presets="repsPresets"
      @change="onRepsChange"
    />
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import { debounce } from 'quasar'
import { api } from 'boot/axios'
import WeightPickerOverlay from './weightPickerOverlay.vue'
import NumberPickerOverlay from './numberPickerOverlay.vue'

export default defineComponent({
  name: 'WorkoutSetItem',

  components: {
    WeightPickerOverlay,
    NumberPickerOverlay
  },

  props: {
    set: { type: Object, required: true },
    workoutId: { type: String, required: true },
    isCurrent: { type: Boolean, default: false }
  },

  emits: ['complete', 'update'],

  setup(props, { emit }) {
    const localWeight = ref(props.set.weight || props.set.targetWeight || null)
    const localReps = ref(props.set.reps || props.set.targetMaxReps || null)
    const completing = ref(false)
    const editing = ref(false)
    const saving = ref(false)
    const showWeightPicker = ref(false)
    const showRepsPicker = ref(false)

    const weightPresets = computed(() => {
      const base = props.set.targetWeight || 20
      return [base - 5, base - 2.5, base, base + 2.5, base + 5].filter(v => v > 0)
    })

    const repsPresets = computed(() => {
      const min = props.set.targetMinReps || 8
      const max = props.set.targetMaxReps || 12
      const presets = []
      for (let i = min; i <= max; i++) {
        presets.push(i)
      }
      return presets
    })

    const formatWeight = (val) => {
      if (val % 1 === 0) return val.toString()
      const decimal = Math.round((val % 1) * 100)
      if (decimal === 25 || decimal === 75) return val.toFixed(2).replace('.', ',')
      return val.toFixed(1).replace('.', ',')
    }

    const normalizeNumber = (value) => {
      if (value === null || value === undefined) return null
      const parsed = typeof value === 'number' ? value : Number(value)
      return Number.isNaN(parsed) ? null : parsed
    }

    const saveValues = async () => {
      await api.patch(`/api/workouts/${props.workoutId}/sets/${props.set.id}`, {
        weight: normalizeNumber(localWeight.value),
        reps: normalizeNumber(localReps.value)
      })
    }

    const debouncedSave = debounce(saveValues, 500)

    const openWeightPicker = () => {
      showWeightPicker.value = true
    }

    const openRepsPicker = () => {
      showRepsPicker.value = true
    }

    const onWeightChange = (value) => {
      localWeight.value = value
      if (!editing.value) {
        debouncedSave()
      }
    }

    const onRepsChange = (value) => {
      localReps.value = value
      if (!editing.value) {
        debouncedSave()
      }
    }

    const completeSet = async () => {
      completing.value = true
      await saveValues()
      const { data } = await api.post(`/api/workouts/${props.workoutId}/sets/${props.set.id}/complete`)
      emit('complete', data)
      completing.value = false
    }

    const startEdit = () => {
      localWeight.value = props.set.weight
      localReps.value = props.set.reps
      editing.value = true
    }

    const saveEdit = async () => {
      saving.value = true
      await saveValues()
      emit('update', {
        ...props.set,
        weight: localWeight.value,
        reps: localReps.value
      })
      saving.value = false
      editing.value = false
    }

    watch(() => props.set, (newSet) => {
      if (!editing.value) {
        localWeight.value = newSet.weight || newSet.targetWeight || null
        localReps.value = newSet.reps || newSet.targetMaxReps || null
      }
    }, { deep: true })

    return {
      localWeight,
      localReps,
      completing,
      editing,
      saving,
      showWeightPicker,
      showRepsPicker,
      weightPresets,
      repsPresets,
      formatWeight,
      openWeightPicker,
      openRepsPicker,
      onWeightChange,
      onRepsChange,
      completeSet,
      startEdit,
      saveEdit
    }
  }
})
</script>

<style scoped>
.set-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.set-item.current {
  background: rgba(0, 255, 194, 0.05);
  border-color: rgba(0, 255, 194, 0.2);
}

.set-item.completed {
  opacity: 0.6;
}

.set-number {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  flex-shrink: 0;
}

.number {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
}

.set-item.current .number {
  color: #00ffc2;
}

.set-content {
  flex: 1;
  min-width: 0;
}

.target-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 8px;
}

.completed-values {
  display: flex;
  align-items: center;
  gap: 8px;
}

.value {
  font-size: 15px;
  font-weight: 600;
  color: white;
}

.separator {
  color: rgba(255, 255, 255, 0.3);
}

.edit-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  margin-left: auto;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.check-icon {
  color: #00ffc2;
  flex-shrink: 0;
}

.input-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.input-group {
  flex: 1;
  min-width: 0;
  cursor: pointer;
}

.input-label {
  display: block;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.touch-input {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 44px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.touch-input:active {
  background: rgba(0, 255, 194, 0.1);
  border-color: rgba(0, 255, 194, 0.3);
}

.touch-value {
  font-size: 18px;
  font-weight: 700;
  color: white;
  font-variant-numeric: tabular-nums;
}

.touch-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.complete-btn,
.save-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.complete-btn {
  background: #00ffc2;
  color: #040d16;
}

.complete-btn:hover:not(:disabled) {
  background: #00e6af;
  transform: scale(1.05);
}

.save-btn {
  background: #00ffc2;
  color: #040d16;
}

.save-btn:hover:not(:disabled) {
  background: #00e6af;
  transform: scale(1.05);
}

.complete-btn:disabled,
.save-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  transform: none;
}
</style>
