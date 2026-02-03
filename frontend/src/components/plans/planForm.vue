<template>
  <q-dialog v-model="dialogVisible" persistent data-test="plan-form-dialog">
    <div class="form-dialog">
      <div class="dialog-header">
        <span class="dialog-title" data-test="dialog-title">{{ isEdit ? $t('plans.form.titleEdit') : $t('plans.form.titleCreate') }}</span>
        <button class="close-btn" data-test="close-btn" @click="close">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <q-form ref="formRef" class="form-fields">
          <div class="field-group">
            <label class="field-label">{{ $t('plans.form.nameLabel') }}</label>
            <input
              v-model="form.name"
              type="text"
              class="text-input"
              data-test="name-input"
              :placeholder="$t('plans.form.namePlaceholder')"
            >
          </div>

          <div class="field-group">
            <label class="field-label">{{ $t('plans.form.descriptionLabel') }}</label>
            <textarea
              v-model="form.description"
              class="textarea-input"
              data-test="description-input"
              rows="3"
              :placeholder="$t('plans.form.descriptionPlaceholder')"
            ></textarea>
          </div>
        </q-form>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="cancel-btn" @click="close">
          {{ $t('plans.form.cancel') }}
        </button>
        <button class="action-btn primary" data-test="save-btn" @click="save">
          {{ $t('plans.form.save') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'PlanForm',

  props: {
    plans: { type: Array, required: true }
  },

  setup(props) {
    const plans = ref(props.plans)
    const dialogVisible = ref(false)
    const formRef = ref(null)
    const isEdit = ref(false)
    const editingPlan = ref(null)

    const form = reactive({
      name: '',
      description: ''
    })

    const resetForm = () => {
      form.name = ''
      form.description = ''
    }

    const open = (plan = null) => {
      if (plan) {
        isEdit.value = true
        editingPlan.value = plan
        form.name = plan.name
        form.description = plan.description || ''
      } else {
        isEdit.value = false
        editingPlan.value = null
        resetForm()
      }
      dialogVisible.value = true
    }

    const close = () => {
      dialogVisible.value = false
      resetForm()
    }

    const save = async () => {
      if (!form.name) return

      const payload = {
        name: form.name,
        description: form.description || null
      }

      if (isEdit.value) {
        const { data } = await api.patch(`/api/plans/${editingPlan.value.id}`, payload)
        Object.assign(editingPlan.value, data)
      } else {
        const { data } = await api.post('/api/plans', payload)
        data.exerciseCount = 0
        data.isFavorite = false
        plans.value.push(data)
      }

      close()
    }

    return {
      dialogVisible,
      formRef,
      form,
      isEdit,
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
  min-height: 80px;
  transition: border-color 0.2s ease;
  font-family: inherit;
}

.textarea-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.textarea-input:focus {
  border-color: rgba(0, 255, 194, 0.4);
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
