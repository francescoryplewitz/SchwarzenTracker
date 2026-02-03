<template>
  <div class="detail-page dark-page" data-test="detail-page">
    <div class="content-container">
      <header class="page-header">
        <button class="back-btn" data-test="back-btn" @click="$router.push('/exercises')">
          <q-icon name="mdi-arrow-left" size="20px" />
          <q-tooltip>{{ $t('common.back') }}</q-tooltip>
        </button>
        <div class="header-actions">
          <button
            class="action-icon-btn"
            :class="{ active: exercise.isFavorite }"
            data-test="favorite-btn"
            @click="toggleFavorite"
          >
            <q-icon :name="exercise.isFavorite ? 'mdi-star' : 'mdi-star-outline'" size="20px" />
            <q-tooltip>{{ exercise.isFavorite ? $t('exercises.favoritesRemove') : $t('exercises.favoritesAdd') }}</q-tooltip>
          </button>
          <button
            v-if="canEdit"
            class="action-icon-btn"
            data-test="edit-btn"
            @click="openEditDialog"
          >
            <q-icon name="mdi-pencil" size="20px" />
            <q-tooltip>{{ $t('exercises.form.titleEdit') }}</q-tooltip>
          </button>
          <button
            v-if="canDelete"
            class="action-icon-btn delete"
            data-test="delete-btn"
            @click="confirmDelete"
          >
            <q-icon name="mdi-delete" size="20px" />
            <q-tooltip>{{ $t('common.delete') }}</q-tooltip>
          </button>
        </div>
      </header>

      <div v-if="loading" class="loading-state" data-test="loading-state">
        <q-spinner color="primary" size="48px" />
        <span class="loading-text">{{ $t('exercises.loading') }}</span>
      </div>

      <div v-else-if="!exercise.id" class="empty-state glass-card" data-test="empty-state">
        <q-icon name="mdi-alert-circle" size="64px" class="empty-icon" />
        <span class="empty-text">{{ $t('exercises.empty') }}</span>
      </div>

      <template v-else>
        <div class="exercise-header glass-card" data-test="exercise-details">
          <h1 class="exercise-title" data-test="exercise-title">{{ exercise.name }}</h1>
          <span class="exercise-type" data-test="exercise-type">
            {{ exercise.isSystem ? $t('exercises.detail.system') : $t('exercises.detail.own') }}
            <span v-if="exercise.forkedFromId"> {{ $t('exercises.detail.forked') }}</span>
          </span>

          <div v-if="hasVariants" class="variants-tabs" data-test="variants-tabs">
            <button
              class="tab-btn"
              :class="{ active: activeTab === 'main' }"
              data-test="tab-main"
              @click="activeTab = 'main'"
            >
              {{ $t('exercises.detail.defaultVariant') }}
            </button>
            <button
              v-for="variant in exercise.variants"
              :key="variant.id"
              class="tab-btn"
              :class="{ active: activeTab === variant.id }"
              :data-test="`tab-variant-${variant.id}`"
              @click="activeTab = variant.id"
            >
              {{ variant.title }}
            </button>
          </div>

          <div class="exercise-meta" data-test="exercise-meta">
            <span
              v-for="mg in exercise.muscleGroups"
              :key="mg"
              class="meta-chip"
            >
              {{ $t(muscleGroupLabels[mg] || mg) }}
            </span>
          </div>

          <div class="exercise-tags">
            <span v-if="currentVariantData.equipment" class="tag-item" data-test="equipment-tag">
              <q-icon name="mdi-dumbbell" size="14px" />
              {{ $t(equipmentLabels[currentVariantData.equipment]) }}
            </span>
            <span class="tag-item" data-test="category-tag">
              <q-icon name="mdi-tag" size="14px" />
              {{ $t(categoryLabels[exercise.category]) }}
            </span>
            <span v-if="exercise.recommendedRestSeconds" class="tag-item" data-test="rest-tag">
              <q-icon name="mdi-timer-outline" size="14px" />
              {{ formatRestTime(exercise.recommendedRestSeconds) }} {{ $t('exercises.detail.rest') }}
            </span>
          </div>

          <div class="exercise-separator"></div>

          <div class="section-label">{{ $t('exercises.detail.execution') }}</div>
          <p class="exercise-description" data-test="exercise-description">
            {{ currentVariantData.description || $t('exercises.detail.noDescription') }}
          </p>

          <button
            v-if="exercise.videoUrl"
            class="video-btn"
            data-test="video-btn"
            @click="openVideo"
          >
            <q-icon name="mdi-play-circle" size="20px" />
            {{ $t('exercises.detail.video') }}
          </button>
        </div>

        <div v-if="exercise.muscleGroups?.length > 0" class="muscle-section glass-card" data-test="muscle-section">
          <div class="section-header-inline">
            <span class="section-label-small">{{ $t('exercises.detail.trainedMuscles') }}</span>
          </div>
          <muscle-body-diagram
            :sets="muscleGroupSets"
            :max-sets="maxMuscleSets"
            :show-sets="false"
          />
        </div>

      </template>
    </div>

    <q-fab
      v-if="exercise.id"
      v-model="fabOpen"
      icon="mdi-plus"
      active-icon="mdi-close"
      direction="up"
      class="fab-actions"
      data-test="fab-actions"
    >
      <q-fab-action
        icon="mdi-playlist-plus"
        :label="$t('exercises.detail.variantsTab')"
        label-position="left"
        external-label
        data-test="fab-variant"
        @click="openVariantDialog"
      >
        <q-tooltip anchor="center left" self="center right">{{ $t('exercises.variantDialog.title') }}</q-tooltip>
      </q-fab-action>
      <q-fab-action
        v-if="exercise.isSystem"
        icon="mdi-source-fork"
        :label="$t('exercises.detail.fork')"
        label-position="left"
        external-label
        data-test="fab-fork"
        @click="forkExercise"
      >
        <q-tooltip anchor="center left" self="center right">{{ $t('exercises.detail.forkCopy') }}</q-tooltip>
      </q-fab-action>
    </q-fab>

    <exercise-form ref="formRef" :exercises="[]" />
    <exercise-variant-dialog ref="variantRef" :exercise-id="exercise.id" @created="onVariantCreated" />
    <confirm-dialog ref="confirmDialogRef" />
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from 'boot/axios'
import { useI18n } from 'vue-i18n'
import ExerciseForm from 'components/exercises/exerciseForm.vue'
import ExerciseVariantDialog from 'components/exercises/exerciseVariantDialog.vue'
import MuscleBodyDiagram from 'components/plans/muscleBodyDiagram.vue'
import ConfirmDialog from 'components/common/confirmDialog.vue'
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
  name: 'ExerciseDetailPage',

  components: {
    ExerciseForm,
    ExerciseVariantDialog,
    MuscleBodyDiagram,
    ConfirmDialog
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const { t } = useI18n({ useScope: 'global' })

    const exercise = ref({})
    const loading = ref(true)
    const activeTab = ref('main')
    const formRef = ref(null)
    const variantRef = ref(null)
    const confirmDialogRef = ref(null)
    const fabOpen = ref(false)

    const hasVariants = computed(() => exercise.value.variants?.length > 0)
    const canEdit = computed(() => !exercise.value.isSystem)
    const canDelete = computed(() => !exercise.value.isSystem)

    const muscleGroupSets = computed(() => {
      const sets = {}
      exercise.value.muscleGroups?.forEach(mg => {
        sets[mg] = 1
      })
      return sets
    })

    const maxMuscleSets = computed(() => {
      return exercise.value.muscleGroups?.length ? 1 : 0
    })

    const currentVariantData = computed(() => {
      if (activeTab.value === 'main') {
        return {
          description: exercise.value.description,
          equipment: exercise.value.equipment
        }
      }
      const variant = exercise.value.variants?.find(v => v.id === activeTab.value)
      return {
        description: variant?.description || exercise.value.description,
        equipment: variant?.equipment || exercise.value.equipment
      }
    })

    const loadExercise = async () => {
      loading.value = true
      const { data } = await api.get(`/api/exercises/${route.params.id}`)
      exercise.value = data
      loading.value = false
    }

    const toggleFavorite = async () => {
      if (exercise.value.isFavorite) {
        await api.delete(`/api/exercises/${exercise.value.id}/favorite`)
        exercise.value.isFavorite = false
      } else {
        await api.post(`/api/exercises/${exercise.value.id}/favorite`)
        exercise.value.isFavorite = true
      }
    }

    const openEditDialog = () => {
      formRef.value.open(exercise.value)
    }

    const confirmDelete = async () => {
      try {
        await confirmDialogRef.value.open({
          title: t('exercises.detail.deleteTitle'),
          message: t('exercises.detail.deleteMessage', { name: exercise.value.name }),
          type: 'confirm'
        })
        await api.delete(`/api/exercises/${exercise.value.id}`)
        router.push('/exercises')
      } catch {
        // User cancelled
      }
    }

    const forkExercise = async () => {
      const { data } = await api.post(`/api/exercises/${exercise.value.id}/fork`)
      router.push(`/exercises/${data.id}`)
    }

    const openVariantDialog = () => {
      variantRef.value.open()
    }

    const onVariantCreated = (variant) => {
      exercise.value.variants.push(variant)
    }

    const openVideo = () => {
      window.open(exercise.value.videoUrl, '_blank')
    }

    const formatRestTime = (seconds) => {
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        const timeLabel = secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${mins}`
        return `${timeLabel} ${t('units.minutesShort')}`
      }
      return `${seconds} ${t('units.secondsShort')}`
    }

    onMounted(() => {
      loadExercise()
    })

    return {
      exercise,
      loading,
      activeTab,
      formRef,
      variantRef,
      confirmDialogRef,
      fabOpen,
      hasVariants,
      canEdit,
      canDelete,
      muscleGroupSets,
      maxMuscleSets,
      currentVariantData,
      muscleGroupLabels,
      equipmentLabels,
      categoryLabels,
      toggleFavorite,
      openEditDialog,
      confirmDelete,
      forkExercise,
      openVariantDialog,
      onVariantCreated,
      openVideo,
      formatRestTime
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

.exercise-header {
  padding: 24px;
  margin-bottom: 16px;
}

.exercise-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px;
  letter-spacing: -0.02em;
}

.exercise-type {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.variants-tabs {
  display: flex;
  gap: 8px;
  margin: 20px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  overflow-x: auto;
}

.tab-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  background: rgba(255, 255, 255, 0.06);
}

.tab-btn.active {
  background: rgba(0, 255, 194, 0.15);
  border-color: rgba(0, 255, 194, 0.3);
  color: #00ffc2;
}

.exercise-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}

.meta-chip {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.exercise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}

.tag-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.exercise-separator {
  height: 1px;
  background: rgba(255, 255, 255, 0.06);
  margin: 20px 0;
}

.section-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 12px;
}

.exercise-description {
  font-size: 15px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.7);
  white-space: pre-line;
  margin: 0;
}

.video-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  padding: 10px 16px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 10px;
  color: #00ffc2;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.video-btn:hover {
  background: rgba(0, 255, 194, 0.2);
}

.muscle-section {
  padding: 20px;
  margin-top: 16px;
}

.section-header-inline {
  margin-bottom: 8px;
}

.section-label-small {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.fab-actions {
  position: fixed;
  bottom: 80px;
  right: 20px;
  z-index: 100;
}

.fab-actions :deep(.q-btn--fab) {
  background: rgba(0, 255, 194, 0.15) !important;
  color: #00ffc2 !important;
  border-radius: 50% !important;
  border: 1px solid rgba(0, 255, 194, 0.3);
  backdrop-filter: blur(10px);
}

.fab-actions :deep(.q-fab__actions .q-btn) {
  background: rgba(0, 255, 194, 0.15);
  color: #00ffc2;
}

.fab-actions :deep(.q-fab__label) {
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

@media (max-width: 480px) {
  .content-container {
    padding: 16px 12px;
  }

  .exercise-title {
    font-size: 20px;
  }
}
</style>
