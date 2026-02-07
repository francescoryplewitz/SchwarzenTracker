<template>
  <q-dialog v-model="visible" class="plan-picker-dialog">
    <div class="dialog-card glass-card">
      <div class="dialog-header">
        <h2 class="dialog-title">{{ $t('workouts.start') }}</h2>
        <p class="dialog-subtitle">{{ $t('workouts.planPicker.subtitle') }}</p>
      </div>

      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
        <span class="loading-text">{{ $t('plans.loading') }}</span>
      </div>

      <div v-else-if="plans.length === 0" class="empty-state">
        <q-icon name="mdi-clipboard-text-outline" size="48px" class="empty-icon" />
        <span class="empty-text">{{ $t('workouts.planPicker.empty') }}</span>
        <button class="action-btn" @click="goToPlans">
          {{ $t('plans.create') }}
        </button>
      </div>

      <div v-else class="plans-list">
        <button
          v-for="plan in plans"
          :key="plan.id"
          class="plan-item"
          :class="{ selected: selectedPlanId === plan.id }"
          data-test="plan-item"
          @click="selectPlan(plan.id)"
        >
          <div class="plan-info">
            <span class="plan-name">{{ plan.name }}</span>
            <span class="plan-meta">
              {{ plan.exerciseCount }} {{ plan.exerciseCount === 1 ? $t('plans.exerciseSingular') : $t('plans.exercisePlural') }}
            </span>
          </div>
          <q-icon v-if="selectedPlanId === plan.id" name="mdi-check-circle" size="20px" class="check-icon" />
        </button>
      </div>

      <div v-if="selectedPlanMeta.splitDaysEnabled" class="day-type-section">
        <div class="day-type-headline">{{ $t('workouts.planPicker.dayTypeTitle') }}</div>
        <div v-if="selectedPlanMeta.lastCompletedWorkout && selectedPlanMeta.lastCompletedWorkout.dayType" class="day-type-last">
          {{ $t('workouts.planPicker.lastDayType', {
            dayType: selectedPlanMeta.lastCompletedWorkout.dayType,
            date: formatDate(selectedPlanMeta.lastCompletedWorkout.completedAt)
          }) }}
        </div>
        <div v-else class="day-type-last">
          {{ $t('workouts.planPicker.noLastDayType') }}
        </div>
        <div class="day-type-options">
          <button
            v-for="day in dayTypeOptions"
            :key="day.value"
            type="button"
            class="day-type-btn"
            :class="{ selected: selectedDayType === day.value, suggested: selectedPlanMeta.suggestedDayType === day.value }"
            @click="selectedDayType = day.value"
          >
            {{ $t(day.labelKey) }}
          </button>
        </div>
      </div>

      <div v-if="error" class="error-message">
        <q-icon name="mdi-alert-circle" size="16px" />
        {{ error }}
      </div>

      <div class="dialog-actions">
        <button class="cancel-btn" @click="close">
          {{ $t('common.cancel') }}
        </button>
        <button
          class="start-btn"
          :disabled="!selectedPlanId || (selectedPlanMeta.splitDaysEnabled && !selectedDayType) || !!error"
          data-test="start-btn"
          @click="startWorkout"
        >
          {{ $t('workouts.start') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  name: 'PlanPickerDialog',

  emits: ['start'],

  setup(props, { emit }) {
    const router = useRouter()
    const { t, locale } = useI18n({ useScope: 'global' })
    const visible = ref(false)
    const loading = ref(false)
    const plans = ref([])
    const selectedPlanId = ref(null)
    const selectedDayType = ref(null)
    const selectedPlanMeta = ref({
      splitDaysEnabled: false,
      lastCompletedWorkout: null,
      suggestedDayType: 'A'
    })
    const error = ref(null)
    const dayTypeOptions = [
      { value: 'A', labelKey: 'plans.dayType.a' },
      { value: 'B', labelKey: 'plans.dayType.b' }
    ]
    const defaultPlanMeta = () => ({
      splitDaysEnabled: false,
      lastCompletedWorkout: null,
      suggestedDayType: 'A'
    })
    let startOptionsRequestId = 0

    const fetchPlans = async () => {
      loading.value = true
      error.value = null
      try {
        const { data } = await api.get('/api/plans?onlyOwn=true')
        plans.value = data
      } catch (e) {
        error.value = e.response?.data?.error || t('workouts.planPicker.error')
      } finally {
        loading.value = false
      }
    }

    const open = () => {
      visible.value = true
      selectedPlanId.value = null
      selectedDayType.value = null
      selectedPlanMeta.value = defaultPlanMeta()
      startOptionsRequestId += 1
      error.value = null
      fetchPlans()
    }

    const close = () => {
      visible.value = false
      startOptionsRequestId += 1
    }

    const selectPlan = async (planId) => {
      const requestId = ++startOptionsRequestId
      selectedPlanId.value = planId
      error.value = null
      selectedDayType.value = null
      selectedPlanMeta.value = defaultPlanMeta()

      try {
        const { data } = await api.get(`/api/workouts/start-options?planId=${encodeURIComponent(planId)}`)
        if (requestId !== startOptionsRequestId) return
        selectedPlanMeta.value = data
        if (data.splitDaysEnabled) {
          selectedDayType.value = data.suggestedDayType
        }
      } catch (e) {
        if (requestId !== startOptionsRequestId) return
        error.value = e.response?.data?.error || t('workouts.planPicker.error')
      }
    }

    const startWorkout = () => {
      emit('start', {
        planId: selectedPlanId.value,
        dayType: selectedPlanMeta.value.splitDaysEnabled ? selectedDayType.value : null
      })
      close()
    }

    const formatDate = (dateString) => {
      return new Intl.DateTimeFormat(locale.value, {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(new Date(dateString))
    }

    const goToPlans = () => {
      close()
      router.push('/plans')
    }

    return {
      visible,
      loading,
      plans,
      selectedPlanId,
      selectedDayType,
      selectedPlanMeta,
      dayTypeOptions,
      error,
      open,
      close,
      selectPlan,
      startWorkout,
      goToPlans,
      formatDate
    }
  }
})
</script>

<style scoped>
.dialog-card {
  width: 100%;
  max-width: 400px;
  padding: 24px;
}

.dialog-header {
  margin-bottom: 20px;
}

.dialog-title {
  font-size: 18px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px 0;
}

.dialog-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  margin: 0;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 12px;
}

.loading-text {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px 0;
  gap: 12px;
}

.empty-icon {
  color: rgba(255, 255, 255, 0.15);
}

.empty-text {
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}

.action-btn {
  margin-top: 8px;
  padding: 10px 16px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 8px;
  color: #00ffc2;
  font-size: 13px;
  cursor: pointer;
}

.plans-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.plan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.plan-item:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15);
}

.plan-item.selected {
  background: rgba(0, 255, 194, 0.1);
  border-color: rgba(0, 255, 194, 0.3);
}

.plan-item:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.plan-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  text-align: left;
}

.plan-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.plan-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.check-icon {
  color: #00ffc2;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(255, 82, 82, 0.1);
  border: 1px solid rgba(255, 82, 82, 0.2);
  border-radius: 8px;
  color: #ff5252;
  font-size: 13px;
  margin-bottom: 16px;
}

.day-type-section {
  margin-bottom: 16px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.02);
}

.day-type-headline {
  font-size: 13px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.day-type-last {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 10px;
}

.day-type-options {
  display: flex;
  gap: 8px;
}

.day-type-btn {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  font-weight: 600;
}

.day-type-btn.selected {
  border-color: rgba(0, 255, 194, 0.35);
  background: rgba(0, 255, 194, 0.15);
  color: #00ffc2;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn {
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.05);
  color: white;
}

.cancel-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.start-btn {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  background: #00ffc2;
  border: none;
  border-radius: 8px;
  color: #040d16;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.start-btn:hover:not(:disabled) {
  background: #00e6af;
  transform: translateY(-1px);
}

.start-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
