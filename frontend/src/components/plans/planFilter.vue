<template>
  <q-dialog v-model="dialogVisible" position="bottom" data-test="filter-dialog">
    <div class="filter-dialog">
      <div class="dialog-header">
        <span class="dialog-title">{{ $t('plans.filter.title') }}</span>
        <button class="close-btn" data-test="close-btn" @click="dialogVisible = false">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <div class="toggle-options">
          <label class="toggle-option" data-test="favorites-toggle">
            <input
              v-model="filters.onlyFavorites"
              type="checkbox"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-label">{{ $t('plans.filter.onlyFavorites') }}</span>
          </label>

          <label class="toggle-option" data-test="own-toggle">
            <input
              v-model="filters.onlyOwn"
              type="checkbox"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-label">{{ $t('plans.filter.onlyOwn') }}</span>
          </label>

          <label class="toggle-option" data-test="system-toggle">
            <input
              v-model="filters.onlySystem"
              type="checkbox"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-label">{{ $t('plans.filter.onlySystem') }}</span>
          </label>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="reset-btn" @click="resetFilters">
          {{ $t('plans.filter.reset') }}
        </button>
        <button class="action-btn primary" data-test="apply-btn" @click="applyFilters">
          {{ $t('plans.filter.apply') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'

export default defineComponent({
  name: 'PlanFilter',

  emits: ['apply'],

  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const filters = reactive({
      onlyFavorites: false,
      onlyOwn: false,
      onlySystem: false
    })

    const open = (currentFilters = {}) => {
      Object.assign(filters, {
        onlyFavorites: currentFilters.onlyFavorites || false,
        onlyOwn: currentFilters.onlyOwn || false,
        onlySystem: currentFilters.onlySystem || false
      })
      dialogVisible.value = true
    }

    const resetFilters = () => {
      filters.onlyFavorites = false
      filters.onlyOwn = false
      filters.onlySystem = false
    }

    const applyFilters = () => {
      emit('apply', { ...filters })
      dialogVisible.value = false
    }

    return {
      dialogVisible,
      filters,
      open,
      resetFilters,
      applyFilters
    }
  }
})
</script>

<style scoped>
.filter-dialog {
  width: 100%;
  max-width: 500px;
  background: rgba(4, 13, 22, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 20px 20px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-bottom: none;
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

.toggle-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.toggle-option {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.toggle-input {
  display: none;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  position: relative;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.toggle-switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.toggle-input:checked + .toggle-switch {
  background: rgba(0, 255, 194, 0.3);
}

.toggle-input:checked + .toggle-switch::after {
  left: 22px;
  background: #00ffc2;
}

.toggle-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
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
