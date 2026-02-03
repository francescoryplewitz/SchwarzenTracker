<template>
  <div class="exercises-page dark-page" data-test="exercises-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="mdi-dumbbell" size="24px" />
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ $t('exercises.title') }}</h1>
          <p class="page-subtitle">{{ $t('exercises.subtitle') }}</p>
        </div>
        <button class="add-btn" data-test="add-btn" @click="openCreateDialog">
          <q-icon name="mdi-plus" size="20px" />
          <q-tooltip>{{ $t('exercises.create') }}</q-tooltip>
        </button>
      </header>

      <div class="search-section glass-card">
        <div class="search-row">
          <div class="search-input-wrapper">
            <q-icon name="mdi-magnify" class="search-icon" />
            <input v-model="search" type="text" :placeholder="$t('exercises.searchPlaceholder')" class="search-input"
              data-test="search-input" @input="debouncedSearch">
            <button v-if="search" class="clear-btn" data-test="clear-search-btn" @click="clearSearch">
              <q-icon name="mdi-close" size="16px" />
            </button>
          </div>
          <button class="filter-btn" data-test="filter-btn" @click="openFilterDialog">
            <q-icon name="mdi-filter-outline" size="20px" />
            <span v-if="activeFilterCount > 0" class="filter-badge" data-test="filter-badge">{{ activeFilterCount }}</span>
            <q-tooltip>{{ $t('exercises.filters') }}</q-tooltip>
          </button>
        </div>

        <div v-if="activeFilterCount > 0" class="active-filters" data-test="active-filters">
          <span v-if="filters.muscleGroup" class="filter-chip" data-test="filter-chip-muscleGroup" @click="removeFilter('muscleGroup')">
            {{ $t(muscleGroupLabels[filters.muscleGroup]) }}
            <q-icon name="mdi-close" size="12px" />
          </span>
          <span v-if="filters.equipment" class="filter-chip" data-test="filter-chip-equipment" @click="removeFilter('equipment')">
            {{ $t(equipmentLabels[filters.equipment]) }}
            <q-icon name="mdi-close" size="12px" />
          </span>
          <span v-if="filters.category" class="filter-chip" data-test="filter-chip-category" @click="removeFilter('category')">
            {{ $t(categoryLabels[filters.category]) }}
            <q-icon name="mdi-close" size="12px" />
          </span>
          <span v-if="filters.onlyFavorites" class="filter-chip" data-test="filter-chip-favorites" @click="removeFilter('onlyFavorites')">
            {{ $t('exercises.favorites') }}
            <q-icon name="mdi-close" size="12px" />
          </span>
          <span v-if="filters.onlyOwn" class="filter-chip" data-test="filter-chip-own" @click="removeFilter('onlyOwn')">
            {{ $t('exercises.own') }}
            <q-icon name="mdi-close" size="12px" />
          </span>
        </div>
      </div>

      <div v-if="loading" class="loading-state" data-test="loading-state">
        <q-spinner color="primary" size="48px" />
        <span class="loading-text">{{ $t('exercises.loading') }}</span>
      </div>

      <div v-else-if="exercises.length === 0" class="empty-state glass-card" data-test="empty-state">
        <q-icon name="mdi-dumbbell" size="64px" class="empty-icon" />
        <span class="empty-text">{{ $t('exercises.empty') }}</span>
      </div>

      <div v-else class="exercises-list" data-test="exercises-list">
        <exercise-card v-for="exercise in exercises" :key="exercise.id" :exercise="exercise" />

        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" data-test="load-more-btn" :disabled="loadingMore" @click="loadMore">
            <q-spinner v-if="loadingMore" color="primary" size="16px" class="q-mr-sm" />
            {{ loadingMore ? $t('exercises.loadingMore') : $t('exercises.loadMore') }}
          </button>
        </div>
      </div>
    </div>

    <exercise-filter ref="filterRef" @apply="applyFilters" />
    <exercise-form ref="formRef" :exercises="exercises" />
  </div>
</template>

<script>
import { defineComponent, ref, reactive, computed, onMounted } from 'vue'
import { debounce } from 'quasar'
import { api } from 'boot/axios'
import ExerciseCard from 'components/exercises/exerciseCard.vue'
import ExerciseFilter from 'components/exercises/exerciseFilter.vue'
import ExerciseForm from 'components/exercises/exerciseForm.vue'
import { muscleGroupLabels } from 'src/constants/muscleGroups'

const equipmentLabels = {
  BARBELL: 'equipment.BARBELL',
  DUMBBELL: 'equipment.DUMBBELL',
  MACHINE: 'equipment.MACHINE',
  CABLE: 'equipment.CABLE',
  BODYWEIGHT: 'equipment.BODYWEIGHT',
  KETTLEBELL: 'equipment.KETTLEBELL',
  BAND: 'equipment.BAND',
  OTHER: 'equipment.OTHER'
}

const categoryLabels = {
  COMPOUND: 'categories.COMPOUND',
  ISOLATION: 'categories.ISOLATION',
  CARDIO: 'categories.CARDIO',
  STRETCHING: 'categories.STRETCHING'
}

export default defineComponent({
  name: 'ExercisesIndexPage',

  components: {
    ExerciseCard,
    ExerciseFilter,
    ExerciseForm
  },

  setup() {
    const exercises = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const hasMore = ref(false)
    const search = ref('')
    const filterRef = ref(null)
    const formRef = ref(null)

    const filters = reactive({
      muscleGroup: null,
      equipment: null,
      category: null,
      onlyFavorites: false,
      onlyOwn: false
    })

    const activeFilterCount = computed(() => {
      let count = 0
      if (filters.muscleGroup) count++
      if (filters.equipment) count++
      if (filters.category) count++
      if (filters.onlyFavorites) count++
      if (filters.onlyOwn) count++
      return count
    })

    const buildQueryParams = (skip = 0) => {
      const params = new URLSearchParams()
      if (search.value) params.append('search', search.value)
      if (filters.muscleGroup) params.append('muscleGroup', filters.muscleGroup)
      if (filters.equipment) params.append('equipment', filters.equipment)
      if (filters.category) params.append('category', filters.category)
      if (filters.onlyFavorites) params.append('onlyFavorites', 'true')
      if (filters.onlyOwn) params.append('onlyOwn', 'true')
      if (skip > 0) params.append('skip', skip)
      return params.toString()
    }

    const fetchExercises = async (append = false) => {
      const skip = append ? exercises.value.length : 0
      const query = buildQueryParams(skip)
      const url = `/api/exercises${query ? '?' + query : ''}`

      const { data } = await api.get(url)

      if (append) {
        exercises.value.push(...data)
      } else {
        exercises.value = data
      }

      hasMore.value = data.length === 30
    }

    const loadExercises = async () => {
      loading.value = true
      await fetchExercises()
      loading.value = false
    }

    const loadMore = async () => {
      loadingMore.value = true
      await fetchExercises(true)
      loadingMore.value = false
    }

    const debouncedSearch = debounce(() => {
      loadExercises()
    }, 500)

    const clearSearch = () => {
      search.value = ''
      loadExercises()
    }

    const openFilterDialog = () => {
      filterRef.value.open(filters)
    }

    const applyFilters = (newFilters) => {
      Object.assign(filters, newFilters)
      loadExercises()
    }

    const removeFilter = (key) => {
      if (key === 'onlyFavorites' || key === 'onlyOwn') {
        filters[key] = false
      } else {
        filters[key] = null
      }
      loadExercises()
    }

    const openCreateDialog = () => {
      formRef.value.open()
    }

    onMounted(() => {
      loadExercises()
    })

    return {
      exercises,
      loading,
      loadingMore,
      hasMore,
      search,
      filters,
      filterRef,
      formRef,
      activeFilterCount,
      muscleGroupLabels,
      equipmentLabels,
      categoryLabels,
      debouncedSearch,
      clearSearch,
      loadMore,
      openFilterDialog,
      applyFilters,
      removeFilter,
      openCreateDialog
    }
  }
})
</script>

<style scoped>
.exercises-page {
  min-height: 100vh;
  padding-bottom: 24px;
}

.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 0 16px 24px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.header-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin: 0;
  line-height: 1.1;
  margin-top: 16px
}

.page-subtitle {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin: 2px 0 0 0;
}

.add-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  color: #00ffc2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: rgba(0, 255, 194, 0.2);
  border-color: rgba(0, 255, 194, 0.4);
  transform: scale(1.05);
}

.search-section {
  padding: 16px;
  margin-bottom: 20px;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: rgba(255, 255, 255, 0.3);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 12px 40px 12px 40px;
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

.clear-btn {
  position: absolute;
  right: 8px;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.filter-btn {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 255, 194, 0.2);
  color: white;
}

.filter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  border-radius: 9px;
  background: #00ffc2;
  color: #040d16;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

.active-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 20px;
  color: #00ffc2;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-chip:hover {
  background: rgba(0, 255, 194, 0.2);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  gap: 16px;
}

.loading-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 24px;
  gap: 16px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.15);
}

.empty-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 15px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.load-more {
  display: flex;
  justify-content: center;
  padding: 16px 0;
}

.load-more-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 255, 194, 0.2);
  color: white;
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .content-container {
    padding: 0 12px 16px;
  }

  .header-icon {
    width: 40px;
    height: 40px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
