<template>
  <q-dialog v-model="dialogVisible" persistent data-test="confirm-dialog">
    <div class="form-dialog">
      <div class="dialog-header">
        <span class="dialog-title" data-test="dialog-title">{{ config.title }}</span>
        <button class="close-btn" data-test="close-btn" @click="cancel">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <p class="dialog-message" data-test="dialog-message">{{ config.message }}</p>

        <div v-if="config.type === 'prompt' && config.promptConfig" class="field-group">
          <label v-if="config.promptConfig.label" class="field-label">{{ config.promptConfig.label }}</label>
          <div class="input-wrapper">
            <input
              v-model="promptValue"
              :type="config.promptConfig.type || 'text'"
              class="text-input"
              :class="{ 'has-suffix': config.promptConfig.suffix }"
              data-test="prompt-input"
              :placeholder="config.promptConfig.placeholder || ''"
            >
            <span v-if="config.promptConfig.suffix" class="input-suffix">{{ config.promptConfig.suffix }}</span>
          </div>
        </div>
      </div>

      <div class="dialog-actions">
        <button
          v-if="config.cancel !== false"
          class="action-btn secondary"
          data-test="cancel-btn"
          @click="cancel"
        >
          {{ $t('common.cancel') }}
        </button>
        <button class="action-btn primary" data-test="ok-btn" @click="confirm">
          {{ config.okLabel || $t('common.confirm') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  name: 'ConfirmDialog',

  setup() {
    const dialogVisible = ref(false)
    const promptValue = ref('')
    let resolvePromise = null
    let rejectPromise = null

    const config = reactive({
      title: '',
      message: '',
      type: 'confirm',
      promptConfig: null,
      cancel: true,
      okLabel: null
    })

    const open = (options) => {
      config.title = options.title || ''
      config.message = options.message || ''
      config.type = options.type || 'confirm'
      config.promptConfig = options.promptConfig || null
      config.cancel = options.cancel !== false
      config.okLabel = options.okLabel || null

      if (config.type === 'prompt' && config.promptConfig) {
        promptValue.value = config.promptConfig.model || ''
      }

      dialogVisible.value = true

      return new Promise((resolve, reject) => {
        resolvePromise = resolve
        rejectPromise = reject
      })
    }

    const confirm = () => {
      dialogVisible.value = false
      if (config.type === 'prompt') {
        if (resolvePromise) {
          const value = config.promptConfig?.type === 'number' ? Number(promptValue.value) : promptValue.value
          resolvePromise(value)
        }
      } else {
        if (resolvePromise) {
          resolvePromise()
        }
      }
      reset()
    }

    const cancel = () => {
      dialogVisible.value = false
      if (rejectPromise) {
        rejectPromise()
      }
      reset()
    }

    const reset = () => {
      promptValue.value = ''
      resolvePromise = null
      rejectPromise = null
    }

    return {
      dialogVisible,
      config,
      promptValue,
      open,
      confirm,
      cancel
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

.dialog-message {
  font-size: 14px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-wrapper {
  position: relative;
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

.text-input.has-suffix {
  padding-right: 80px;
}

.input-suffix {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none;
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
  border: none;
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
