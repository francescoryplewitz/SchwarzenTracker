<template>
  <q-dialog v-model="dialogVisible" persistent data-test="variant-dialog">
    <div class="form-dialog">
      <div class="dialog-header">
        <span class="dialog-title">{{ $t('exercises.variantDialog.title') }}</span>
        <button class="close-btn" data-test="close-btn" @click="close">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <q-form ref="formRef" class="form-fields">
          <div class="field-group">
            <label class="field-label">{{ $t('exercises.variantDialog.nameLabel') }}</label>
            <input
              v-model="form.title"
              type="text"
              class="text-input"
              :class="{ error: showError && !form.title }"
              data-test="title-input"
              :placeholder="$t('exercises.variantDialog.namePlaceholder')"
            >
            <span v-if="showError && !form.title" class="error-text" data-test="error-text">
              {{ $t('exercises.variantDialog.nameError') }}
            </span>
          </div>

          <div class="field-group">
            <label class="field-label">{{ $t('exercises.variantDialog.descriptionLabel') }}</label>
            <textarea
              v-model="form.description"
              class="textarea-input"
              data-test="description-input"
              rows="4"
              :placeholder="$t('exercises.variantDialog.descriptionPlaceholder')"
            ></textarea>
          </div>

          <div class="field-group">
            <label class="field-label">{{ $t('exercises.variantDialog.equipmentLabel') }}</label>
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
                {{ $t(eq.labelKey) }}
              </button>
            </div>
          </div>
        </q-form>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="cancel-btn" @click="close">
          {{ $t('common.cancel') }}
        </button>
        <button class="action-btn primary" data-test="create-btn" @click="save">
          {{ $t('common.add') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { api } from 'boot/axios'

const equipmentOptions = [
  { value: 'BARBELL', labelKey: 'equipment.BARBELL' },
  { value: 'DUMBBELL', labelKey: 'equipment.DUMBBELL' },
  { value: 'MACHINE', labelKey: 'equipment.MACHINE' },
  { value: 'CABLE', labelKey: 'equipment.CABLE' },
  { value: 'BODYWEIGHT', labelKey: 'equipment.BODYWEIGHT' },
  { value: 'KETTLEBELL', labelKey: 'equipment.KETTLEBELL' },
  { value: 'BAND', labelKey: 'equipment.BAND' },
  { value: 'OTHER', labelKey: 'equipment.OTHER' }
]

export default defineComponent({
  name: 'ExerciseVariantDialog',

  props: {
    exerciseId: { type: String, default: null }
  },

  emits: ['created'],

  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const showError = ref(false)

    const form = reactive({
      title: '',
      description: '',
      equipment: null
    })

    const resetForm = () => {
      form.title = ''
      form.description = ''
      form.equipment = null
      showError.value = false
    }

    const open = () => {
      resetForm()
      dialogVisible.value = true
    }

    const close = () => {
      dialogVisible.value = false
      resetForm()
    }

    const save = async () => {
      showError.value = true
      if (!form.title) return

      const payload = {
        title: form.title,
        description: form.description,
        equipment: form.equipment
      }

      const { data } = await api.post(`/api/exercises/${props.exerciseId}/variants`, payload)
      emit('created', data)
      close()
    }

    return {
      dialogVisible,
      formRef,
      form,
      showError,
      equipmentOptions,
      open,
      close,
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

.text-input.error {
  border-color: rgba(240, 101, 117, 0.5);
}

.error-text {
  font-size: 12px;
  color: #f06575;
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
