<template>
  <div class="detail-page dark-page" data-test="detail-page">
    <div class="content-container">
      <header class="page-header">
        <button class="back-btn" data-test="back-btn" @click="$router.push('/plans')">
          <q-icon name="mdi-arrow-left" size="20px" />
          <q-tooltip>Zurück zur Liste</q-tooltip>
        </button>
        <div class="header-actions">
          <button class="action-icon-btn" :class="{ active: plan.isFavorite }" data-test="favorite-btn"
            @click="toggleFavorite">
            <q-icon :name="plan.isFavorite ? 'mdi-star' : 'mdi-star-outline'" size="20px" />
            <q-tooltip>{{ plan.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren' }}</q-tooltip>
          </button>
          <button class="action-icon-btn" data-test="copy-btn" @click="copyPlan">
            <q-icon name="mdi-content-copy" size="20px" />
            <q-tooltip>Plan kopieren</q-tooltip>
          </button>
          <button v-if="canEdit" class="action-icon-btn" data-test="edit-btn" @click="openEditDialog">
            <q-icon name="mdi-pencil" size="20px" />
            <q-tooltip>Plan bearbeiten</q-tooltip>
          </button>
          <button v-if="canDelete" class="action-icon-btn delete" data-test="delete-btn" @click="confirmDelete">
            <q-icon name="mdi-delete" size="20px" />
            <q-tooltip>Plan löschen</q-tooltip>
          </button>
        </div>
      </header>

      <div v-if="loading" class="loading-state" data-test="loading-state">
        <q-spinner color="primary" size="48px" />
        <span class="loading-text">Lade Plan...</span>
      </div>

      <div v-else-if="!plan.id" class="empty-state glass-card" data-test="empty-state">
        <q-icon name="mdi-alert-circle" size="64px" class="empty-icon" />
        <span class="empty-text">Plan nicht gefunden</span>
      </div>

      <template v-else>
        <div class="plan-header glass-card" data-test="plan-details">
          <h1 class="plan-title" data-test="plan-title">{{ plan.name }}</h1>
          <span class="plan-type" data-test="plan-type">
            {{ plan.isSystem ? 'System-Plan' : 'Eigener Plan' }}
          </span>

          <p v-if="plan.description" class="plan-description" data-test="plan-description">
            {{ plan.description }}
          </p>

          <div v-if="plan.exercises?.length > 0" class="plan-duration" data-test="plan-duration">
            <q-icon name="mdi-timer-outline" size="16px" />
            <span>Geschätzte Dauer: {{ formatRestTime(estimatedDuration) }}</span>
          </div>
        </div>

        <div v-if="plan.exercises?.length > 0" class="muscle-section glass-card" data-test="muscle-section">
          <div class="section-header-inline">
            <span class="section-label">Trainierte Muskelgruppen</span>
          </div>
          <muscle-body-diagram :sets="muscleGroupSets" :max-sets="maxMuscleSets" />
        </div>

        <div class="exercises-section">
          <div class="section-header">
            <span class="section-title">Übungen ({{ plan.exercises?.length || 0 }})</span>
          </div>

          <div v-if="plan.exercises?.length === 0" class="empty-exercises glass-card">
            <q-icon name="mdi-dumbbell" size="48px" class="empty-icon" />
            <span class="empty-text">Noch keine Übungen hinzugefügt</span>
          </div>

          <div
            v-else
            ref="exerciseListRef"
            class="exercises-list"
            :class="{ 'exercises-list--drag-mode': isDragMode }"
          >
            <template v-for="(planExercise, index) in plan.exercises" :key="planExercise.id">
              <div
                v-if="isDragMode && dropTargetIndex === index"
                class="drop-indicator"
              />
              <plan-exercise-item
                :plan-exercise="planExercise"
                :index="index"
                :can-edit="canEdit"
                :compact="isDragMode"
                :is-dragged="draggedIndex === index"
                @remove="removeExercise(planExercise)"
                @touchstart.passive="handleDragStart($event, index)"
                @touchend.passive="onTouchEnd"
                @mousedown="handleDragStart($event, index)"
                @contextmenu.prevent
              />

              <div v-if="index < plan.exercises.length - 1 && !isDragMode" class="rest-between-exercises">
                <div class="rest-line" />
                <button class="rest-badge" :class="{ editable: canEdit }"
                  @click="canEdit && editRestAfter(planExercise)">
                  <q-icon name="mdi-timer-sand" size="14px" />
                  <span>{{ formatRestTime(planExercise.restAfterSeconds || 90) }}</span>
                  <q-icon v-if="canEdit" name="mdi-pencil" size="12px" class="edit-icon" />
                </button>
                <div class="rest-line" />
              </div>
            </template>
            <div
              v-if="isDragMode && dropTargetIndex === plan.exercises.length"
              class="drop-indicator"
            />
          </div>

          <button v-if="canEdit" class="add-exercise-btn glass-card" data-test="add-exercise-btn"
            @click="openExercisePicker">
            <q-icon name="mdi-plus" size="20px" />
            <span>Übung hinzufügen</span>
          </button>
        </div>
      </template>
    </div>

    <plan-form ref="formRef" :plans="[]" />
    <exercise-picker ref="pickerRef" :plan-id="plan.id" @added="onExerciseAdded" />
    <confirm-dialog ref="confirmDialogRef" />

    <div
      v-if="draggedIndex !== null"
      class="drag-ghost glass-card"
      :style="{
        left: ghostPosition.x + 'px',
        top: ghostPosition.y + 'px'
      }"
    >
      <div class="ghost-number">{{ draggedIndex + 1 }}</div>
      <span class="ghost-name">{{ plan.exercises[draggedIndex]?.exercise.name }}</span>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import PlanForm from 'components/plans/planForm.vue'
import PlanExerciseItem from 'components/plans/planExerciseItem.vue'
import ExercisePicker from 'components/plans/exercisePicker.vue'
import MuscleBodyDiagram from 'components/plans/muscleBodyDiagram.vue'
import ConfirmDialog from 'components/common/confirmDialog.vue'
import { useDragReorder } from 'src/composables/useDragReorder'

export default defineComponent({
  name: 'PlanDetailPage',

  components: {
    PlanForm,
    PlanExerciseItem,
    ExercisePicker,
    MuscleBodyDiagram,
    ConfirmDialog
  },

  setup() {
    const route = useRoute()
    const router = useRouter()

    const plan = ref({})
    const loading = ref(true)
    const formRef = ref(null)
    const pickerRef = ref(null)
    const confirmDialogRef = ref(null)
    const exerciseListRef = ref(null)

    const performReorder = async (fromIndex, toIndex) => {
      const exercises = plan.value.exercises
      const [moved] = exercises.splice(fromIndex, 1)
      exercises.splice(toIndex, 0, moved)

      const order = exercises.map((pe, idx) => ({
        id: pe.id,
        sortOrder: idx
      }))

      await api.patch(`/api/plans/${plan.value.id}/exercises/reorder`, { order })
    }

    const {
      isDragMode,
      draggedIndex,
      ghostPosition,
      dropTargetIndex,
      onTouchStart,
      onTouchEnd,
      onMouseDown
    } = useDragReorder({
      longPressDelay: 500,
      onDrop: performReorder
    })

    const canEdit = computed(() => !plan.value.isSystem)
    const canDelete = computed(() => !plan.value.isSystem)

    const muscleGroupSets = computed(() => {
      const sets = {}
      plan.value.exercises?.forEach(pe => {
        pe.exercise.muscleGroups?.forEach(mg => {
          sets[mg] = (sets[mg] || 0) + (pe.sets || 0)
        })
      })
      return sets
    })

    const maxMuscleSets = computed(() => {
      const values = Object.values(muscleGroupSets.value)
      return values.length ? Math.max(...values) : 0
    })

    const estimatedDuration = computed(() => {
      if (!plan.value.exercises || plan.value.exercises.length === 0) return 0

      let totalDuration = 0

      plan.value.exercises.forEach((exercise, index) => {
        // Pausen zwischen Sätzen (n-1 Pausen für n Sätze)
        if (exercise.sets > 1) {
          const restSeconds = exercise.restSeconds || 90
          totalDuration += (exercise.sets - 1) * restSeconds
        }

        // Pause nach der Übung (außer bei der letzten)
        if (index < plan.value.exercises.length - 1) {
          const restAfterSeconds = exercise.restAfterSeconds || 90
          totalDuration += restAfterSeconds
        }
      })

      return totalDuration
    })

    const loadPlan = async () => {
      loading.value = true
      const { data } = await api.get(`/api/plans/${route.params.id}`)
      plan.value = data
      loading.value = false
    }

    const toggleFavorite = async () => {
      if (plan.value.isFavorite) {
        await api.delete(`/api/plans/${plan.value.id}/favorite`)
        plan.value.isFavorite = false
      } else {
        await api.post(`/api/plans/${plan.value.id}/favorite`)
        plan.value.isFavorite = true
      }
    }

    const copyPlan = async () => {
      const { data } = await api.post(`/api/plans/${plan.value.id}/copy`)
      router.push(`/plans/${data.id}`)
    }

    const openEditDialog = () => {
      formRef.value.open(plan.value)
    }

    const confirmDelete = async () => {
      try {
        await confirmDialogRef.value.open({
          title: 'Plan löschen',
          message: `Möchtest du "${plan.value.name}" wirklich löschen?`,
          type: 'confirm'
        })
        await api.delete(`/api/plans/${plan.value.id}`)
        router.push('/plans')
      } catch {
        // User cancelled
      }
    }

    const openExercisePicker = () => {
      pickerRef.value.open()
    }

    const onExerciseAdded = (planExercise) => {
      plan.value.exercises.push(planExercise)
    }

    const removeExercise = async (planExercise) => {
      try {
        await confirmDialogRef.value.open({
          title: 'Übung entfernen',
          message: `Möchtest du "${planExercise.exercise.name}" aus dem Plan entfernen?`,
          type: 'confirm'
        })
        await api.delete(`/api/plans/${plan.value.id}/exercises/${planExercise.exerciseId}`)
        const index = plan.value.exercises.findIndex(e => e.id === planExercise.id)
        plan.value.exercises.splice(index, 1)
      } catch {
        // User cancelled
      }
    }

    const formatRestTime = (seconds) => {
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')} Min` : `${mins} Min`
      }
      return `${seconds} Sek`
    }

    const editRestAfter = async (planExercise) => {
      try {
        const value = await confirmDialogRef.value.open({
          title: 'Pause zur nächsten Übung',
          message: 'Wie lange soll die Pause nach dieser Übung sein?',
          type: 'prompt',
          promptConfig: {
            model: String(planExercise.restAfterSeconds || 90),
            type: 'number',
            suffix: 'Sekunden'
          }
        })
        const restAfterSeconds = parseInt(value) || 90
        const { data } = await api.patch(
          `/api/plans/${plan.value.id}/exercises/${planExercise.exerciseId}`,
          { restAfterSeconds }
        )
        Object.assign(planExercise, data)
      } catch {
        // User cancelled
      }
    }

    const getItemRects = () => {
      if (!exerciseListRef.value) return []
      const items = exerciseListRef.value.querySelectorAll('[data-test="exercise-item"]')
      return Array.from(items).map(el => el.getBoundingClientRect())
    }

    const handleDragStart = (event, index) => {
      if (!canEdit.value) return

      if (event.type === 'touchstart') {
        onTouchStart(event, index, getItemRects)
      } else {
        onMouseDown(event, index, getItemRects)
      }
    }

    onMounted(() => {
      loadPlan()
    })

    return {
      plan,
      loading,
      formRef,
      pickerRef,
      confirmDialogRef,
      exerciseListRef,
      canEdit,
      canDelete,
      muscleGroupSets,
      maxMuscleSets,
      estimatedDuration,
      isDragMode,
      draggedIndex,
      ghostPosition,
      dropTargetIndex,
      toggleFavorite,
      copyPlan,
      openEditDialog,
      confirmDelete,
      openExercisePicker,
      onExerciseAdded,
      removeExercise,
      formatRestTime,
      editRestAfter,
      handleDragStart,
      onTouchEnd
    }
  }
})
</script>

<style scoped>
.detail-page {
  min-height: 100vh;
  padding-bottom: 24px;
}

.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(0, 255, 194, 0.2);
  color: white;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.action-icon-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  color: white;
}

.action-icon-btn.active {
  color: #00ffc2;
  border-color: rgba(0, 255, 194, 0.2);
}

.action-icon-btn.active:hover {
  background: rgba(0, 255, 194, 0.1);
}

.action-icon-btn.delete:hover {
  color: #f06575;
  border-color: rgba(240, 101, 117, 0.3);
  background: rgba(240, 101, 117, 0.1);
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

.plan-header {
  padding: 24px;
  margin-bottom: 24px;
}

.plan-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.plan-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.plan-description {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.6);
  margin: 16px 0 0;
}

.plan-duration {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.plan-duration .q-icon {
  color: rgba(0, 255, 194, 0.6);
}
.muscle-section {
  padding: 20px;
  margin-bottom: 24px;
}

.section-header-inline {
  margin-bottom: 8px;
}

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.exercises-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.empty-exercises {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 12px;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercises-list--drag-mode {
  gap: 6px;
}

.rest-between-exercises {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.rest-line {
  flex: 1;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
}

.rest-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.2s ease;
}

.rest-badge.editable {
  cursor: pointer;
}

.rest-badge.editable:hover {
  border-color: rgba(0, 255, 194, 0.3);
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 255, 194, 0.05);
}

.rest-badge .edit-icon {
  opacity: 0;
  margin-left: 2px;
  transition: opacity 0.2s ease;
}

.rest-badge.editable:hover .edit-icon {
  opacity: 1;
}

.add-exercise-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  margin-top: 12px;
  background: rgba(0, 255, 194, 0.05);
  border: 1px dashed rgba(0, 255, 194, 0.2);
  border-radius: 16px;
  color: #00ffc2;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-exercise-btn:hover {
  background: rgba(0, 255, 194, 0.1);
  border-style: solid;
}

.drop-indicator {
  height: 3px;
  background: #00ffc2;
  border-radius: 2px;
  margin: 2px 0;
  animation: pulse 0.8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.drag-ghost {
  position: fixed;
  z-index: 1000;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  transform: translate(-50%, -50%);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border-color: rgba(0, 255, 194, 0.4);
}

.ghost-number {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(0, 255, 194, 0.15);
  border: 1px solid rgba(0, 255, 194, 0.3);
  color: #00ffc2;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ghost-name {
  font-size: 13px;
  font-weight: 600;
  color: white;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .content-container {
    padding: 16px 12px;
  }

  .plan-title {
    font-size: 20px;
  }
}
</style>
