<template>
  <div class="plans-page dark-page" data-test="plans-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="mdi-clipboard-text-outline" size="24px" />
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ $t('plans.title') }}</h1>
          <p class="page-subtitle">{{ activeTab === 'library' ? $t('plans.librarySubtitle') : $t('plans.mySubtitle') }}</p>
        </div>
        <button v-if="activeTab === 'myPlans'" class="add-btn" data-test="add-btn" @click="openCreateDialog">
          <q-icon name="mdi-plus" size="20px" />
          <q-tooltip>{{ $t('plans.create') }}</q-tooltip>
        </button>
      </header>

      <div class="search-section glass-card">
        <div class="search-input-wrapper">
          <q-icon name="mdi-magnify" class="search-icon" />
          <input v-model="search" type="text" :placeholder="$t('plans.searchPlaceholder')" class="search-input"
            data-test="search-input" @input="debouncedSearch">
          <button v-if="search" class="clear-btn" data-test="clear-search-btn" @click="clearSearch">
            <q-icon name="mdi-close" size="16px" />
          </button>
        </div>
      </div>

      <q-tabs
        v-model="activeTab"
        class="plans-tabs"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        narrow-indicator
      >
        <q-tab name="library" :label="$t('plans.tabs.library')" data-test="tab-library" />
        <q-tab name="myPlans" :label="$t('plans.tabs.myPlans')" data-test="tab-my-plans" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="plans-tab-panels">
        <q-tab-panel name="library" class="tab-panel">
          <div class="filter-row muscle-filters">
            <button
              v-for="group in muscleGroupOptions"
              :key="group.key"
              class="muscle-chip"
            :class="{ active: selectedMuscleGroups.includes(group.key) }"
            :data-test="`muscle-filter-${group.key}`"
            @click="toggleMuscleGroup(group.key)"
          >
            {{ $t(group.labelKey) }}
          </button>
        </div>

        <div v-if="libraryLoading" class="loading-state" data-test="library-loading">
          <q-spinner color="primary" size="48px" />
          <span class="loading-text">{{ $t('plans.libraryLoading') }}</span>
        </div>

        <div v-else-if="libraryPlans.length === 0" class="empty-state glass-card" data-test="library-empty">
          <q-icon name="mdi-bookshelf" size="64px" class="empty-icon" />
          <span class="empty-text">{{ $t('plans.libraryEmpty') }}</span>
        </div>

          <div v-else class="plans-list" data-test="library-list">
            <plan-card v-for="plan in libraryPlans" :key="plan.id" :plan="plan" />

            <div v-if="libraryHasMore" class="load-more">
              <button class="load-more-btn" data-test="library-load-more" :disabled="libraryLoadingMore" @click="loadMoreLibrary">
                <q-spinner v-if="libraryLoadingMore" color="primary" size="16px" class="q-mr-sm" />
                {{ libraryLoadingMore ? $t('plans.loadingMore') : $t('plans.loadMore') }}
              </button>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="myPlans" class="tab-panel">
          <div class="filter-row">
            <button
              class="favorite-filter-chip"
              :class="{ active: onlyFavorites }"
              data-test="favorites-filter"
              @click="toggleFavorites"
            >
              <q-icon :name="onlyFavorites ? 'mdi-star' : 'mdi-star-outline'" size="16px" />
              {{ $t('plans.favorites') }}
            </button>
          </div>

          <div v-if="myPlansLoading" class="loading-state" data-test="my-plans-loading">
            <q-spinner color="primary" size="48px" />
            <span class="loading-text">{{ $t('plans.myLoading') }}</span>
          </div>

          <div v-else-if="myPlans.length === 0" class="empty-state glass-card" data-test="my-plans-empty">
            <q-icon name="mdi-clipboard-text-outline" size="64px" class="empty-icon" />
            <span class="empty-text">{{ onlyFavorites ? $t('plans.emptyFavorites') : $t('plans.emptyOwn') }}</span>
            <button v-if="!onlyFavorites" class="create-first-btn" @click="openCreateDialog">
              <q-icon name="mdi-plus" size="18px" />
              {{ $t('plans.createFirst') }}
            </button>
          </div>

          <div v-else class="plans-list" data-test="my-plans-list">
            <plan-card v-for="plan in myPlans" :key="plan.id" :plan="plan" />

            <div v-if="myPlansHasMore" class="load-more">
              <button class="load-more-btn" data-test="my-plans-load-more" :disabled="myPlansLoadingMore" @click="loadMoreMyPlans">
                <q-spinner v-if="myPlansLoadingMore" color="primary" size="16px" class="q-mr-sm" />
                {{ myPlansLoadingMore ? $t('plans.loadingMore') : $t('plans.loadMore') }}
              </button>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>

    <plan-form ref="formRef" :plans="myPlans" :redirect-after-create="true" />
  </div>
</template>

<script>
import { defineComponent, ref, watch, onMounted } from 'vue'
import { debounce } from 'quasar'
import { api } from 'boot/axios'
import PlanCard from 'components/plans/planCard.vue'
import PlanForm from 'components/plans/planForm.vue'

const MUSCLE_GROUP_OPTIONS = [
  { key: 'chest', labelKey: 'muscleGroups.CHEST', values: ['CHEST'] },
  { key: 'back', labelKey: 'muscleGroups.BACK', values: ['BACK'] },
  { key: 'shoulders', labelKey: 'muscleGroups.SHOULDERS', values: ['SHOULDERS'] },
  { key: 'arms', labelKey: 'plans.muscleGroups.arms', values: ['BICEPS', 'TRICEPS', 'FOREARMS'] },
  { key: 'core', labelKey: 'plans.muscleGroups.core', values: ['ABS', 'OBLIQUES'] },
  { key: 'legs', labelKey: 'plans.muscleGroups.legs', values: ['QUADS', 'HAMSTRINGS', 'GLUTES', 'CALVES'] }
]

export default defineComponent({
  name: 'PlansIndexPage',

  components: {
    PlanCard,
    PlanForm
  },

  setup() {
    const activeTab = ref('library')
    const search = ref('')
    const onlyFavorites = ref(false)
    const selectedMuscleGroups = ref([])
    const formRef = ref(null)

    const libraryPlans = ref([])
    const libraryLoading = ref(true)
    const libraryLoadingMore = ref(false)
    const libraryHasMore = ref(false)
    const libraryLoaded = ref(false)

    const myPlans = ref([])
    const myPlansLoading = ref(true)
    const myPlansLoadingMore = ref(false)
    const myPlansHasMore = ref(false)
    const myPlansLoaded = ref(false)

    const getMuscleGroupValues = () => {
      const values = []
      selectedMuscleGroups.value.forEach(key => {
        const group = MUSCLE_GROUP_OPTIONS.find(g => g.key === key)
        if (group) values.push(...group.values)
      })
      return values
    }

    const buildLibraryParams = (skip = 0) => {
      const params = new URLSearchParams()
      params.append('onlySystem', 'true')
      if (search.value) params.append('search', search.value)
      const muscleValues = getMuscleGroupValues()
      if (muscleValues.length > 0) params.append('muscleGroups', muscleValues.join(','))
      if (skip > 0) params.append('skip', skip)
      return params.toString()
    }

    const buildMyPlansParams = (skip = 0) => {
      const params = new URLSearchParams()
      params.append('onlyOwn', 'true')
      if (search.value) params.append('search', search.value)
      if (onlyFavorites.value) params.append('onlyFavorites', 'true')
      if (skip > 0) params.append('skip', skip)
      return params.toString()
    }

    const fetchLibrary = async (append = false) => {
      const skip = append ? libraryPlans.value.length : 0
      const query = buildLibraryParams(skip)
      const { data } = await api.get(`/api/plans?${query}`)

      if (append) {
        libraryPlans.value.push(...data)
      } else {
        libraryPlans.value = data
      }
      libraryHasMore.value = data.length === 30
      libraryLoaded.value = true
    }

    const fetchMyPlans = async (append = false) => {
      const skip = append ? myPlans.value.length : 0
      const query = buildMyPlansParams(skip)
      const { data } = await api.get(`/api/plans?${query}`)

      if (append) {
        myPlans.value.push(...data)
      } else {
        myPlans.value = data
      }
      myPlansHasMore.value = data.length === 30
      myPlansLoaded.value = true
    }

    const loadLibrary = async () => {
      libraryLoading.value = true
      await fetchLibrary()
      libraryLoading.value = false
    }

    const loadMyPlans = async () => {
      myPlansLoading.value = true
      await fetchMyPlans()
      myPlansLoading.value = false
    }

    const loadMoreLibrary = async () => {
      libraryLoadingMore.value = true
      await fetchLibrary(true)
      libraryLoadingMore.value = false
    }

    const loadMoreMyPlans = async () => {
      myPlansLoadingMore.value = true
      await fetchMyPlans(true)
      myPlansLoadingMore.value = false
    }

    const loadCurrentTab = () => {
      if (activeTab.value === 'library') {
        loadLibrary()
      } else {
        loadMyPlans()
      }
    }

    const debouncedSearch = debounce(() => {
      loadCurrentTab()
    }, 500)

    const clearSearch = () => {
      search.value = ''
      loadCurrentTab()
    }

    const toggleFavorites = () => {
      onlyFavorites.value = !onlyFavorites.value
      loadMyPlans()
    }

    const toggleMuscleGroup = (key) => {
      const idx = selectedMuscleGroups.value.indexOf(key)
      if (idx === -1) {
        selectedMuscleGroups.value.push(key)
      } else {
        selectedMuscleGroups.value.splice(idx, 1)
      }
      loadLibrary()
    }

    const openCreateDialog = () => {
      formRef.value.open()
    }

    watch(activeTab, (newTab) => {
      if (newTab === 'library' && !libraryLoaded.value) {
        loadLibrary()
      } else if (newTab === 'myPlans' && !myPlansLoaded.value) {
        loadMyPlans()
      }
    })

    onMounted(() => {
      loadLibrary()
    })

    return {
      activeTab,
      search,
      onlyFavorites,
      selectedMuscleGroups,
      muscleGroupOptions: MUSCLE_GROUP_OPTIONS,
      formRef,
      libraryPlans,
      libraryLoading,
      libraryLoadingMore,
      libraryHasMore,
      myPlans,
      myPlansLoading,
      myPlansLoadingMore,
      myPlansHasMore,
      debouncedSearch,
      clearSearch,
      toggleFavorites,
      toggleMuscleGroup,
      loadMoreLibrary,
      loadMoreMyPlans,
      openCreateDialog
    }
  }
})
</script>

<style scoped>
.plans-page {
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
  margin-bottom: 12px;
}

.search-input-wrapper {
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

.plans-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 16px;
}

.plans-tabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.5);
  text-transform: none;
  font-weight: 500;
}

.plans-tabs :deep(.q-tab--active) {
  color: #00ffc2;
}

.plans-tabs :deep(.q-tab__indicator) {
  background: #00ffc2;
  height: 3px;
}

.plans-tab-panels {
  background: transparent;
}

.tab-panel {
  padding: 0;
}

.filter-row {
  margin-bottom: 16px;
}

.muscle-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.muscle-chip {
  display: inline-flex;
  align-items: center;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.muscle-chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.muscle-chip.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.4);
  color: #00ffc2;
}

.favorite-filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.favorite-filter-chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.favorite-filter-chip.active {
  background: rgba(255, 193, 7, 0.15);
  border-color: rgba(255, 193, 7, 0.4);
  color: #ffc107;
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

.create-first-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  padding: 12px 20px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 12px;
  color: #00ffc2;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.create-first-btn:hover {
  background: rgba(0, 255, 194, 0.2);
  border-color: rgba(0, 255, 194, 0.4);
}

.plans-list {
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
