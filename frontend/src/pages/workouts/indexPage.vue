<template>
  <div class="workouts-page dark-page" data-test="workouts-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="mdi-play-circle-outline" size="24px" />
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ $t('workouts.title') }}</h1>
          <p class="page-subtitle">{{ $t('workouts.subtitle') }}</p>
        </div>
        <button class="add-btn" data-test="add-btn" @click="openPlanPicker">
          <q-icon name="mdi-plus" size="20px" />
          <q-tooltip>{{ $t('workouts.start') }}</q-tooltip>
        </button>
      </header>

      <div class="filter-row">
        <button
          v-for="filter in statusFilters"
          :key="filter.value"
          class="status-chip"
          :class="{ active: selectedStatus === filter.value }"
          :data-test="`status-filter-${filter.value}`"
          @click="selectStatus(filter.value)"
        >
          {{ $t(filter.labelKey) }}
        </button>
      </div>

      <div v-if="loading" class="loading-state" data-test="loading">
        <q-spinner color="primary" size="48px" />
        <span class="loading-text">{{ $t('workouts.loading') }}</span>
      </div>

      <div v-else-if="workouts.length === 0" class="empty-state glass-card" data-test="empty">
        <q-icon name="mdi-play-circle-outline" size="64px" class="empty-icon" />
        <span class="empty-text">{{ $t('workouts.empty') }}</span>
        <button class="create-first-btn" @click="openPlanPicker">
          <q-icon name="mdi-plus" size="18px" />
          {{ $t('workouts.start') }}
        </button>
      </div>

      <div v-else class="workouts-list" data-test="workouts-list">
        <workout-card v-for="workout in workouts" :key="workout.id" :workout="workout" />

        <div v-if="hasMore" class="load-more">
          <button class="load-more-btn" data-test="load-more" :disabled="loadingMore" @click="loadMore">
            <q-spinner v-if="loadingMore" color="primary" size="16px" class="q-mr-sm" />
            {{ loadingMore ? $t('workouts.loadingMore') : $t('workouts.loadMore') }}
          </button>
        </div>
      </div>
    </div>

    <plan-picker-dialog ref="planPickerRef" @start="startWorkout" />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import WorkoutCard from 'components/workouts/workoutCard.vue'
import PlanPickerDialog from 'components/workouts/planPickerDialog.vue'

const STATUS_FILTERS = [
  { value: '', labelKey: 'workouts.filters.all' },
  { value: 'COMPLETED', labelKey: 'workouts.filters.completed' },
  { value: 'ABANDONED', labelKey: 'workouts.filters.abandoned' }
]

export default defineComponent({
  name: 'WorkoutsIndexPage',

  components: {
    WorkoutCard,
    PlanPickerDialog
  },

  setup() {
    const router = useRouter()
    const workouts = ref([])
    const loading = ref(true)
    const loadingMore = ref(false)
    const hasMore = ref(false)
    const selectedStatus = ref('')
    const planPickerRef = ref(null)

    const buildParams = (skip = 0) => {
      const params = new URLSearchParams()
      if (selectedStatus.value) params.append('status', selectedStatus.value)
      if (skip > 0) params.append('skip', skip)
      return params.toString()
    }

    const fetchWorkouts = async (append = false) => {
      const skip = append ? workouts.value.length : 0
      const query = buildParams(skip)
      const { data } = await api.get(`/api/workouts?${query}`)

      if (append) {
        workouts.value.push(...data)
      } else {
        workouts.value = data
      }
      hasMore.value = data.length === 30
    }

    const loadWorkouts = async () => {
      loading.value = true
      await fetchWorkouts()
      loading.value = false
    }

    const loadMore = async () => {
      loadingMore.value = true
      await fetchWorkouts(true)
      loadingMore.value = false
    }

    const selectStatus = (status) => {
      selectedStatus.value = status
      loadWorkouts()
    }

    const openPlanPicker = () => {
      planPickerRef.value.open()
    }

    const startWorkout = async (planId) => {
      const { data } = await api.post('/api/workouts', { planId })
      router.push(`/workouts/${data.id}`)
    }

    onMounted(() => {
      loadWorkouts()
    })

    return {
      workouts,
      loading,
      loadingMore,
      hasMore,
      selectedStatus,
      statusFilters: STATUS_FILTERS,
      planPickerRef,
      selectStatus,
      loadMore,
      openPlanPicker,
      startWorkout
    }
  }
})
</script>

<style scoped>
.workouts-page {
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
  margin-top: 16px;
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

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.status-chip {
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

.status-chip:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.status-chip.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.4);
  color: #00ffc2;
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

.workouts-list {
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

  .page-title {
    font-size: 20px;
  }
}
</style>
