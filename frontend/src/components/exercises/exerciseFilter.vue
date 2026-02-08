<template>
  <q-dialog v-model="dialogVisible" position="bottom" data-test="filter-dialog">
    <div class="filter-dialog">
      <div class="dialog-header">
        <span class="dialog-title">{{ $t('exercises.filters') }}</span>
        <button class="close-btn" data-test="close-btn" @click="dialogVisible = false">
          <q-icon name="mdi-close" size="20px" />
          <q-tooltip>{{ $t('common.close') }}</q-tooltip>
        </button>
      </div>

      <div class="dialog-content">
        <div class="filter-section">
          <div class="section-label">{{ $t('exercises.filter.muscleGroup') }}</div>
          <div class="filter-options">
            <button
              v-for="mg in muscleGroupOptions"
              :key="mg.value"
              class="filter-option"
              :class="{ active: filters.muscleGroup === mg.value }"
              :data-test="`muscle-filter-${mg.value}`"
              @click="filters.muscleGroup = filters.muscleGroup === mg.value ? null : mg.value"
            >
              {{ $t(mg.labelKey) }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <div class="section-label">{{ $t('exercises.filter.equipment') }}</div>
          <div class="filter-options">
            <button
              v-for="eq in equipmentOptions"
              :key="eq.value"
              class="filter-option"
              :class="{ active: filters.equipment === eq.value }"
              :data-test="`equipment-filter-${eq.value}`"
              @click="filters.equipment = filters.equipment === eq.value ? null : eq.value"
            >
              {{ $t(eq.labelKey) }}
            </button>
          </div>
        </div>

        <div class="filter-section">
          <div class="section-label">{{ $t('exercises.filter.category') }}</div>
          <div class="filter-options">
            <button
              v-for="cat in categoryOptions"
              :key="cat.value"
              class="filter-option"
              :class="{ active: filters.category === cat.value }"
              :data-test="`category-filter-${cat.value}`"
              @click="filters.category = filters.category === cat.value ? null : cat.value"
            >
              {{ $t(cat.labelKey) }}
            </button>
          </div>
        </div>

        <div class="filter-separator"></div>

        <div class="toggle-options">
          <label class="toggle-option" data-test="favorites-toggle">
            <input
              v-model="filters.onlyFavorites"
              type="checkbox"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-label">{{ $t('exercises.filter.onlyFavorites') }}</span>
          </label>

          <label class="toggle-option" data-test="own-toggle">
            <input
              v-model="filters.onlyOwn"
              type="checkbox"
              class="toggle-input"
            >
            <span class="toggle-switch"></span>
            <span class="toggle-label">{{ $t('exercises.filter.onlyOwn') }}</span>
          </label>
        </div>
      </div>

      <div class="dialog-actions">
        <button class="action-btn secondary" data-test="reset-btn" @click="resetFilters">
          {{ $t('exercises.filter.reset') }}
        </button>
        <button class="action-btn primary" data-test="apply-btn" @click="applyFilters">
          {{ $t('exercises.filter.apply') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref, reactive } from 'vue'

const muscleGroupOptions = [
  { value: 'CHEST', labelKey: 'muscleGroups.CHEST' },
  { value: 'BACK', labelKey: 'muscleGroups.BACK' },
  { value: 'SHOULDERS', labelKey: 'muscleGroups.SHOULDERS' },
  { value: 'BICEPS', labelKey: 'muscleGroups.BICEPS' },
  { value: 'TRICEPS', labelKey: 'muscleGroups.TRICEPS' },
  { value: 'ABS', labelKey: 'muscleGroups.ABS' },
  { value: 'QUADS', labelKey: 'muscleGroups.QUADS' },
  { value: 'GLUTES', labelKey: 'muscleGroups.GLUTES' }
]

const equipmentOptions = [
  { value: 'BARBELL', labelKey: 'equipment.BARBELL' },
  { value: 'DUMBBELL', labelKey: 'equipment.DUMBBELL' },
  { value: 'MACHINE', labelKey: 'equipment.MACHINE' },
  { value: 'CABLE', labelKey: 'equipment.CABLE' },
  { value: 'BODYWEIGHT', labelKey: 'equipment.BODYWEIGHT' },
  { value: 'KETTLEBELL', labelKey: 'equipment.KETTLEBELL' }
]

const categoryOptions = [
  { value: 'COMPOUND', labelKey: 'categories.COMPOUND' },
  { value: 'ISOLATION', labelKey: 'categories.ISOLATION' },
  { value: 'CARDIO', labelKey: 'categories.CARDIO' }
]

export default defineComponent({
  name: 'ExerciseFilter',

  emits: ['apply'],

  setup(props, { emit }) {
    const dialogVisible = ref(false)
    const filters = reactive({
      muscleGroup: null,
      equipment: null,
      category: null,
      onlyFavorites: false,
      onlyOwn: false
    })

    const open = (currentFilters = {}) => {
      Object.assign(filters, {
        muscleGroup: currentFilters.muscleGroup || null,
        equipment: currentFilters.equipment || null,
        category: currentFilters.category || null,
        onlyFavorites: currentFilters.onlyFavorites || false,
        onlyOwn: currentFilters.onlyOwn || false
      })
      dialogVisible.value = true
    }

    const resetFilters = () => {
      filters.muscleGroup = null
      filters.equipment = null
      filters.category = null
      filters.onlyFavorites = false
      filters.onlyOwn = false
    }

    const applyFilters = () => {
      emit('apply', { ...filters })
      dialogVisible.value = false
    }

    return {
      dialogVisible,
      filters,
      muscleGroupOptions,
      equipmentOptions,
      categoryOptions,
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

.filter-section {
  margin-bottom: 20px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-option {
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-option:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.filter-option.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.3);
  color: #00ffc2;
}

.filter-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
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
