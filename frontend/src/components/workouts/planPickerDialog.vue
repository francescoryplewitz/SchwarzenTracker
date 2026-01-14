<template>
  <q-dialog v-model="visible" class="plan-picker-dialog">
    <div class="dialog-card glass-card">
      <div class="dialog-header">
        <h2 class="dialog-title">Workout starten</h2>
        <p class="dialog-subtitle">Wähle einen Trainingsplan</p>
      </div>

      <div v-if="loading" class="loading-state">
        <q-spinner color="primary" size="32px" />
        <span class="loading-text">Lade Pläne...</span>
      </div>

      <div v-else-if="plans.length === 0" class="empty-state">
        <q-icon name="mdi-clipboard-text-outline" size="48px" class="empty-icon" />
        <span class="empty-text">Du hast noch keine Trainingspläne</span>
        <button class="action-btn" @click="goToPlans">
          Plan erstellen
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
            <span class="plan-meta">{{ plan.exerciseCount }} Übungen</span>
          </div>
          <q-icon v-if="selectedPlanId === plan.id" name="mdi-check-circle" size="20px" class="check-icon" />
        </button>
      </div>

      <div v-if="error" class="error-message">
        <q-icon name="mdi-alert-circle" size="16px" />
        {{ error }}
      </div>

      <div class="dialog-actions">
        <button class="cancel-btn" @click="close">
          Abbrechen
        </button>
        <button
          class="start-btn"
          :disabled="!selectedPlanId"
          data-test="start-btn"
          @click="startWorkout"
        >
          Workout starten
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'PlanPickerDialog',

  emits: ['start'],

  setup(props, { emit }) {
    const router = useRouter()
    const visible = ref(false)
    const loading = ref(false)
    const plans = ref([])
    const selectedPlanId = ref(null)
    const error = ref(null)

    const fetchPlans = async () => {
      loading.value = true
      error.value = null
      try {
        const { data } = await api.get('/api/plans?onlyOwn=true')
        plans.value = data
      } catch (e) {
        error.value = e.response?.data?.error || 'Fehler beim Laden der Pläne'
      } finally {
        loading.value = false
      }
    }

    const open = () => {
      visible.value = true
      selectedPlanId.value = null
      error.value = null
      fetchPlans()
    }

    const close = () => {
      visible.value = false
    }

    const selectPlan = (planId) => {
      selectedPlanId.value = planId
      error.value = null
    }

    const startWorkout = () => {
      emit('start', selectedPlanId.value)
      close()
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
      error,
      open,
      close,
      selectPlan,
      startWorkout,
      goToPlans
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
