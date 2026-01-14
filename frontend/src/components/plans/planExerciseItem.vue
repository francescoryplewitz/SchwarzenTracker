<template>
  <div
    class="exercise-item glass-card"
    :class="{
      'exercise-item--compact': compact,
      'exercise-item--dragged': isDragged
    }"
    data-test="exercise-item"
  >
    <div class="item-content">
      <div class="item-number">{{ index + 1 }}</div>

      <div class="item-info">
        <div class="exercise-name-row">
          <div class="exercise-name" data-test="exercise-name" @click="!compact && goToExercise()">
            {{ planExercise.exercise.name }}
          </div>
          <span v-if="compact" class="compact-info">
            {{ planExercise.sets }}x{{ planExercise.minReps }}-{{ planExercise.maxReps }}
          </span>
        </div>
        <template v-if="!compact">
          <div v-if="planExercise.exercise.muscleGroups?.length" class="muscle-badges">
            <span
              v-for="mg in planExercise.exercise.muscleGroups"
              :key="mg"
              class="muscle-badge"
            >
              {{ muscleGroupLabels[mg] || mg }}
            </span>
          </div>
          <div class="exercise-config">
            <span class="config-item" data-test="sets-reps">
              {{ planExercise.sets }} Sätze × {{ planExercise.minReps }}-{{ planExercise.maxReps }} Wdh
            </span>
            <span v-if="planExercise.targetWeight" class="config-item" data-test="target-weight">
              Ziel: {{ planExercise.targetWeight }}kg
            </span>
            <span v-if="planExercise.restSeconds" class="config-item" data-test="rest-time">
              Pause: {{ formatRestTime(planExercise.restSeconds) }}
            </span>
          </div>
          <div v-if="planExercise.notes" class="exercise-notes" data-test="notes">
            {{ planExercise.notes }}
          </div>
        </template>
      </div>

      <div v-if="canEdit && !compact" class="item-actions">
        <button class="action-btn" data-test="edit-btn" @click="toggleEdit">
          <q-icon :name="isEditing ? 'mdi-check' : 'mdi-pencil'" size="16px" />
          <q-tooltip>{{ isEditing ? 'Speichern' : 'Bearbeiten' }}</q-tooltip>
        </button>
        <button class="action-btn delete" data-test="remove-btn" @click="$emit('remove')">
          <q-icon name="mdi-close" size="16px" />
          <q-tooltip>Entfernen</q-tooltip>
        </button>
      </div>
    </div>

    <div v-if="isEditing && !compact" class="edit-section" data-test="edit-section">
      <div class="edit-row">
        <div class="edit-field">
          <label class="edit-label">Sätze</label>
          <input v-model.number="editForm.sets" type="number" min="1" class="edit-input" data-test="edit-sets">
        </div>
        <div class="edit-field">
          <label class="edit-label">Min Wdh</label>
          <input v-model.number="editForm.minReps" type="number" min="1" class="edit-input" data-test="edit-min-reps">
        </div>
        <div class="edit-field">
          <label class="edit-label">Max Wdh</label>
          <input v-model.number="editForm.maxReps" type="number" min="1" class="edit-input" data-test="edit-max-reps">
        </div>
      </div>
      <div class="edit-row">
        <div class="edit-field">
          <label class="edit-label">Zielgewicht (kg)</label>
          <input v-model.number="editForm.targetWeight" type="number" min="0" step="0.5" class="edit-input" data-test="edit-weight">
        </div>
        <div class="edit-field">
          <label class="edit-label">Pause (Sek)</label>
          <input v-model.number="editForm.restSeconds" type="number" min="0" class="edit-input" data-test="edit-rest">
        </div>
      </div>
      <div class="edit-row full">
        <div class="edit-field full">
          <label class="edit-label">Notizen</label>
          <input v-model="editForm.notes" type="text" class="edit-input" placeholder="Notizen..." data-test="edit-notes">
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { muscleGroupLabels } from 'src/constants/muscleGroups'

export default defineComponent({
  name: 'PlanExerciseItem',

  props: {
    planExercise: { type: Object, required: true },
    index: { type: Number, required: true },
    canEdit: { type: Boolean, default: false },
    compact: { type: Boolean, default: false },
    isDragged: { type: Boolean, default: false }
  },

  emits: ['remove'],

  setup(props) {
    const router = useRouter()
    const isEditing = ref(false)

    const goToExercise = () => {
      router.push(`/exercises/${props.planExercise.exerciseId}`)
    }

    const editForm = reactive({
      sets: props.planExercise.sets,
      minReps: props.planExercise.minReps,
      maxReps: props.planExercise.maxReps,
      targetWeight: props.planExercise.targetWeight,
      restSeconds: props.planExercise.restSeconds,
      notes: props.planExercise.notes || ''
    })

    watch(() => props.planExercise, (newVal) => {
      editForm.sets = newVal.sets
      editForm.minReps = newVal.minReps
      editForm.maxReps = newVal.maxReps
      editForm.targetWeight = newVal.targetWeight
      editForm.restSeconds = newVal.restSeconds
      editForm.notes = newVal.notes || ''
    }, { deep: true })

    const formatRestTime = (seconds) => {
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')} Min` : `${mins} Min`
      }
      return `${seconds} Sek`
    }

    const toggleEdit = async () => {
      if (isEditing.value) {
        const { data } = await api.patch(
          `/api/plans/${props.planExercise.planId}/exercises/${props.planExercise.exerciseId}`,
          {
            sets: editForm.sets,
            minReps: editForm.minReps,
            maxReps: editForm.maxReps,
            targetWeight: editForm.targetWeight || null,
            restSeconds: editForm.restSeconds || null,
            notes: editForm.notes || null
          }
        )
        Object.assign(props.planExercise, data)
        isEditing.value = false
      } else {
        isEditing.value = true
      }
    }

    return {
      isEditing,
      editForm,
      toggleEdit,
      goToExercise,
      muscleGroupLabels,
      formatRestTime
    }
  }
})
</script>

<style scoped>
.exercise-item {
  padding: 16px;
  transition: all 0.25s ease;
}

.exercise-item--compact {
  padding: 10px 12px;
}

.exercise-item--compact .item-content {
  gap: 8px;
}

.exercise-item--compact .item-number {
  width: 22px;
  height: 22px;
  font-size: 11px;
}

.exercise-item--compact .exercise-name {
  font-size: 13px;
  margin-bottom: 0;
  cursor: default;
}

.exercise-item--dragged {
  opacity: 0.4;
  transform: scale(0.98);
}

.item-content {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  user-select: none;
}

.item-number {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  color: #00ffc2;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.exercise-name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exercise-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 6px;
  cursor: pointer;
  transition: color 0.2s ease;
}

.exercise-item--compact .exercise-name-row {
  margin-bottom: 0;
}

.exercise-item--compact .exercise-name {
  margin-bottom: 0;
}

.exercise-name:hover {
  color: #00ffc2;
}

.compact-info {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  white-space: nowrap;
}

.muscle-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.muscle-badge {
  padding: 3px 8px;
  background: rgba(0, 255, 194, 0.08);
  border: 1px solid rgba(0, 255, 194, 0.15);
  border-radius: 6px;
  font-size: 11px;
  color: rgba(0, 255, 194, 0.8);
}

.exercise-config {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.config-item {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.exercise-notes {
  margin-top: 8px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  font-style: italic;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.action-btn.delete:hover {
  background: rgba(240, 101, 117, 0.1);
  color: #f06575;
}

.edit-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.edit-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.edit-row.full {
  flex-direction: column;
}

.edit-row:last-child {
  margin-bottom: 0;
}

.edit-field {
  flex: 1;
}

.edit-field.full {
  width: 100%;
}

.edit-label {
  display: block;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.edit-input {
  width: 100%;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  font-size: 13px;
  outline: none;
  transition: border-color 0.2s ease;
}

.edit-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.edit-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
}
</style>
