<template>
  <q-dialog v-model="dialogVisible" persistent data-test="exercise-form-dialog">
    <div class="form-dialog">
      <div class="dialog-header">
        <span class="dialog-title" data-test="dialog-title">{{ isEdit ? 'Übung bearbeiten' : 'Neue Übung erstellen' }}</span>
        <button class="close-btn" data-test="close-btn" @click="close">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>Schließen</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <q-form ref="formRef" class="form-fields">
          <div class="field-group">
            <label class="field-label">Name *</label>
            <input
              v-model="form.name"
              type="text"
              class="text-input"
              data-test="name-input"
              placeholder="Name der Übung"
            >
          </div>

          <div class="field-group">
            <label class="field-label">Beschreibung / Ausführung</label>
            <textarea
              v-model="form.description"
              class="textarea-input"
              data-test="description-input"
              rows="4"
              placeholder="Beschreibe die Ausführung der Übung..."
            ></textarea>
          </div>

          <div class="field-group">
            <label class="field-label">Muskelgruppen</label>
            <div class="chip-select">
              <button
                v-for="mg in muscleGroupOptions"
                :key="mg.value"
                type="button"
                class="select-chip"
                :class="{ active: form.muscleGroups.includes(mg.value) }"
                :data-test="`muscle-btn-${mg.value}`"
                @click="toggleMuscleGroup(mg.value)"
              >
                {{ mg.label }}
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Kategorie *</label>
            <div class="chip-select">
              <button
                v-for="cat in categoryOptions"
                :key="cat.value"
                type="button"
                class="select-chip"
                :class="{ active: form.category === cat.value }"
                :data-test="`category-btn-${cat.value}`"
                @click="form.category = form.category === cat.value ? null : cat.value"
              >
                {{ cat.label }}
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Equipment</label>
            <div class="chip-select">
              <button
                v-for="eq in equipmentOptions"
                :key="eq.value"
                type="button"
                class="select-chip"
                :class="{ active: form.equipment === eq.value }"
                :data-test="`equipment-btn-${eq.value}`"
                @click="form.equipment = form.equipment === eq.value ? null : eq.value"
              >
                {{ eq.label }}
              </button>
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">Video URL (optional)</label>
            <input
              v-model="form.videoUrl"
              type="url"
              class="text-input"
              data-test="video-input"
              placeholder="https://..."
            >
          </div>

          <div class="field-group">
            <label class="field-label">Empfohlene Pausenzeit (Sekunden)</label>
            <input
              v-model.number="form.recommendedRestSeconds"
              type="number"
              min="0"
              class="text-input"
              data-test="rest-input"
              placeholder="z.B. 90"
            >
          </div>
        </q-form>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="cancel-btn" @click="close">
          Abbrechen
        </button>
        <button class="action-btn primary" data-test="save-btn" @click="save">
          Speichern
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { api } from 'boot/axios'

const muscleGroupOptions = [
  { value: 'CHEST', label: 'Brust' },
  { value: 'BACK', label: 'Rücken' },
  { value: 'SHOULDERS', label: 'Schultern' },
  { value: 'BICEPS', label: 'Bizeps' },
  { value: 'TRICEPS', label: 'Trizeps' },
  { value: 'FOREARMS', label: 'Unterarme' },
  { value: 'ABS', label: 'Bauch' },
  { value: 'OBLIQUES', label: 'Seitliche Bauchmuskeln' },
  { value: 'QUADS', label: 'Oberschenkel' },
  { value: 'HAMSTRINGS', label: 'Beinbeuger' },
  { value: 'GLUTES', label: 'Gesäß' },
  { value: 'CALVES', label: 'Waden' }
]

const categoryOptions = [
  { value: 'COMPOUND', label: 'Compound' },
  { value: 'ISOLATION', label: 'Isolation' },
  { value: 'CARDIO', label: 'Cardio' },
  { value: 'STRETCHING', label: 'Dehnung' }
]

const equipmentOptions = [
  { value: 'BARBELL', label: 'Langhantel' },
  { value: 'DUMBBELL', label: 'Kurzhantel' },
  { value: 'MACHINE', label: 'Maschine' },
  { value: 'CABLE', label: 'Kabelzug' },
  { value: 'BODYWEIGHT', label: 'Körpergewicht' },
  { value: 'KETTLEBELL', label: 'Kettlebell' },
  { value: 'BAND', label: 'Widerstandsband' },
  { value: 'OTHER', label: 'Sonstiges' }
]

export default defineComponent({
  name: 'ExerciseForm',

  props: {
    exercises: { type: Array, required: true }
  },

  setup(props) {
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const isEdit = ref(false)
    const editingExercise = ref(null)

    const form = reactive({
      name: '',
      description: '',
      muscleGroups: [],
      category: null,
      equipment: null,
      videoUrl: '',
      recommendedRestSeconds: null
    })

    const resetForm = () => {
      form.name = ''
      form.description = ''
      form.muscleGroups = []
      form.category = null
      form.equipment = null
      form.videoUrl = ''
      form.recommendedRestSeconds = null
    }

    const open = (exercise = null) => {
      if (exercise) {
        isEdit.value = true
        editingExercise.value = exercise
        form.name = exercise.name
        form.description = exercise.description || ''
        form.muscleGroups = exercise.muscleGroups || []
        form.category = exercise.category
        form.equipment = exercise.equipment
        form.videoUrl = exercise.videoUrl || ''
        form.recommendedRestSeconds = exercise.recommendedRestSeconds || null
      } else {
        isEdit.value = false
        editingExercise.value = null
        resetForm()
      }
      dialogVisible.value = true
    }

    const close = () => {
      dialogVisible.value = false
      resetForm()
    }

    const toggleMuscleGroup = (value) => {
      const index = form.muscleGroups.indexOf(value)
      if (index === -1) {
        form.muscleGroups.push(value)
      } else {
        form.muscleGroups.splice(index, 1)
      }
    }

    const save = async () => {
      if (!form.name || !form.category) return

      const payload = {
        name: form.name,
        description: form.description,
        muscleGroups: form.muscleGroups,
        category: form.category,
        equipment: form.equipment,
        videoUrl: form.videoUrl || null,
        recommendedRestSeconds: form.recommendedRestSeconds || null
      }

      if (isEdit.value) {
        const { data } = await api.patch(`/api/exercises/${editingExercise.value.id}`, payload)
        Object.assign(editingExercise.value, data)
      } else {
        const { data } = await api.post('/api/exercises', payload)
        // eslint-disable-next-line vue/no-mutating-props
        props.exercises.push(data)
      }

      close()
    }

    return {
      dialogVisible,
      formRef,
      form,
      isEdit,
      muscleGroupOptions,
      categoryOptions,
      equipmentOptions,
      open,
      close,
      toggleMuscleGroup,
      save
    }
  }
})
</script>

<style scoped>
.form-dialog {
  width: 100%;
  max-width: 500px;
  background: rgba(4, 13, 22, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  max-height: 60vh;
  overflow-y: auto;
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.5);
}

.text-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s ease;
}

.text-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.text-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
}

.textarea-input {
  width: 100%;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: white;
  font-size: 14px;
  outline: none;
  resize: vertical;
  min-height: 100px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.textarea-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.textarea-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
}

.chip-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.select-chip {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.select-chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.select-chip.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.3);
  color: #00ffc2;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px 20px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
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

.action-btn.primary:hover {
  background: rgba(0, 255, 194, 0.25);
}
</style>
