<template>
  <div class="exercise-note">
    <div v-if="note" class="note-preview" data-test="exercise-note-preview">
      <div class="note-label">{{ $t('workouts.notes.label') }}</div>
      <div class="note-text">{{ note }}</div>
    </div>

    <button class="note-btn" data-test="exercise-note-btn" @click="open">
      <q-icon name="mdi-note-text-outline" size="16px" />
      <span>{{ note ? $t('workouts.notes.edit') : $t('workouts.notes.add') }}</span>
    </button>

    <q-dialog v-model="showDialog" class="note-dialog" @hide="onDialogHide">
      <div class="dialog-card glass-card">
        <div class="dialog-header">
          <h3 class="dialog-title">{{ $t('workouts.notes.title') }}</h3>
          <button class="close-btn" data-test="exercise-note-close" @click="close">
            <q-icon name="mdi-close" size="18px" />
          </button>
        </div>

        <q-input
          v-model="text"
          type="textarea"
          autogrow
          dense
          outlined
          class="note-input"
          :placeholder="$t('workouts.notes.placeholder')"
          data-test="exercise-note-input"
        />

        <div class="dialog-footer">
          <div v-if="statusText" class="status-text" data-test="exercise-note-status">
            {{ statusText }}
          </div>
          <div v-else class="status-spacer" />

          <button class="done-btn" data-test="exercise-note-done" @click="close">
            {{ $t('workouts.notes.done') }}
          </button>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'WorkoutExerciseNote',

  props: {
    exerciseId: { type: String, required: true },
    note: { type: String, default: null }
  },

  emits: ['saved'],

  setup(props, { emit }) {
    const { t } = useI18n({ useScope: 'global' })
    const showDialog = ref(false)
    const text = ref('')
    const saving = ref(false)
    const savedAt = ref(null)
    const lastSaved = ref(props.note || '')
    const saveError = ref(false)

    let saveTimeout = null
    let stopTextWatch = null

    const statusText = computed(() => {
      if (saveError.value) return t('workouts.notes.error')
      if (saving.value) return t('workouts.notes.saving')
      if (savedAt.value) return t('workouts.notes.saved')
      return ''
    })

    const saveNote = async () => {
      if (saving.value) return

      const trimmed = text.value.trim()
      const normalized = trimmed || ''

      if (normalized === lastSaved.value) return

      saving.value = true
      saveError.value = false

      try {
        const { data } = await api.patch(`/api/exercises/${props.exerciseId}/note`, { note: text.value })
        lastSaved.value = data.note || ''
        savedAt.value = Date.now()
        emit('saved', data.note)
      } catch {
        saveError.value = true
      } finally {
        saving.value = false
      }
    }

    const scheduleSave = () => {
      clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        saveNote()
      }, 500)
    }

    const startAutoSave = () => {
      stopTextWatch = watch(text, () => {
        savedAt.value = null
        saveError.value = false
        scheduleSave()
      })
    }

    const stopAutoSave = () => {
      clearTimeout(saveTimeout)
      saveTimeout = null
      if (stopTextWatch) {
        stopTextWatch()
        stopTextWatch = null
      }
    }

    const open = () => {
      showDialog.value = true
    }

    const close = () => {
      showDialog.value = false
    }

    const onDialogHide = async () => {
      stopAutoSave()
      await saveNote()
    }

    watch(() => props.note, (newNote) => {
      if (showDialog.value) return
      lastSaved.value = newNote || ''
    })

    watch(showDialog, (openState) => {
      stopAutoSave()
      if (!openState) return

      text.value = props.note || ''
      lastSaved.value = props.note || ''
      savedAt.value = null
      saveError.value = false
      startAutoSave()
    })

    return {
      showDialog,
      text,
      statusText,
      open,
      close,
      onDialogHide
    }
  }
})
</script>

<style scoped>
.exercise-note {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.note-preview {
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
}

.note-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 6px;
}

.note-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 13px;
  line-height: 1.35;
  white-space: pre-wrap;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.note-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  cursor: pointer;
  background: rgba(0, 255, 194, 0.08);
  border: 1px solid rgba(0, 255, 194, 0.18);
  color: #00ffc2;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.note-btn:hover {
  background: rgba(0, 255, 194, 0.14);
  border-color: rgba(0, 255, 194, 0.28);
}

.dialog-card {
  padding: 18px;
  width: min(92vw, 420px);
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.dialog-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.note-input :deep(textarea) {
  color: rgba(255, 255, 255, 0.9);
}

.note-input :deep(.q-field__control) {
  border-radius: 12px;
}

.dialog-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 12px;
}

.status-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.status-spacer {
  flex: 1;
}

.done-btn {
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  background: #00ffc2;
  border: none;
  color: #040d16;
  font-weight: 700;
  font-size: 13px;
}

.done-btn:hover {
  background: #00e6af;
}
</style>
