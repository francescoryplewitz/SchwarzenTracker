<template>
  <div class="progress-page dark-page" data-test="progress-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="mdi-information-outline" size="22px" />
        </div>
        <div class="header-text">
          <h1 class="page-title">{{ $t('progress.title') }}</h1>
          <p class="page-subtitle">{{ $t('progress.subtitle') }}</p>
        </div>
      </header>

      <div class="filter-row glass-card">
        <button
          v-for="option in rangeOptions"
          :key="option.value"
          class="filter-chip"
          :class="{ active: range === option.value }"
          @click="selectRange(option.value)"
        >
          {{ option.label }}
        </button>
      </div>

      <q-tabs
        v-model="activeTab"
        class="progress-tabs"
        indicator-color="primary"
        active-color="primary"
        dense
        align="justify"
      >
        <q-tab name="training" :label="$t('progress.tabs.training')" />
        <q-tab name="exercises" :label="$t('progress.tabs.exercises')" />
        <q-tab name="muscleGroups" :label="$t('progress.tabs.muscleGroups')" />
      </q-tabs>

      <q-tab-panels v-model="activeTab" animated class="progress-panels">
        <q-tab-panel name="training">
          <div class="avg-card glass-card">
            <div class="avg-label">{{ $t('progress.training.averageLabel', { range: range.toUpperCase() }) }}</div>
            <div class="avg-value">{{ averageWorkoutsPerWeek }}</div>
          </div>

          <trend-chart
            :title="$t('progress.training.chartTitle')"
            :labels="workoutTrendLabels"
            :series="workoutTrendSeries"
            :value-formatter="formatInteger"
            :empty-label="$t('progress.empty')"
          />
        </q-tab-panel>

        <q-tab-panel name="exercises">
          <div class="selector-card glass-card">
            <label class="selector-label">{{ $t('progress.exercises.selectExercise') }}</label>
            <input
              v-model="exerciseSearch"
              type="text"
              class="selector-input"
              :placeholder="$t('progress.exercises.searchPlaceholder')"
            >

            <div v-if="filteredExerciseOptions.length" class="exercise-cards-row">
              <button
                v-for="exercise in filteredExerciseOptions"
                :key="exercise.id"
                class="exercise-card"
                :class="{ active: selectedExerciseId === exercise.id }"
                @click="selectExercise(exercise.id)"
              >
                {{ exercise.name }}
              </button>
            </div>

            <div v-else class="exercise-empty">
              {{ $t('progress.exercises.noResults') }}
            </div>
          </div>

          <trend-chart
            :title="$t('progress.exercises.chartTitle')"
            :labels="exerciseTrendLabels"
            :series="exerciseTrendSeries"
            :value-formatter="formatKg"
            :empty-label="$t('progress.empty')"
          />

          <div class="formula-card glass-card">
            <div class="formula-title">{{ $t('progress.exercises.formulaTitle') }}</div>
            <div class="formula-value">{{ $t('progress.exercises.formulaValue') }}</div>
            <p class="formula-text">{{ $t('progress.exercises.formulaHint') }}</p>
          </div>
        </q-tab-panel>

        <q-tab-panel name="muscleGroups">
          <div class="muscle-picker-card glass-card">
            <div class="muscle-picker-head">
              <label class="selector-label">{{ $t('progress.muscleGroups.selectGroup') }}</label>
              <span class="muscle-active">{{ $t(`muscleGroups.${selectedMuscleGroup}`) }}</span>
            </div>
            <muscle-body-diagram
              :sets="muscleSelectionSets"
              :max-sets="2"
              :show-sets="false"
              :interactive="true"
              :selected-muscle="selectedMuscleGroup"
              @select-muscle="selectMuscleGroup"
            />
          </div>

          <trend-chart
            :title="$t('progress.muscleGroups.chartTitle')"
            :labels="muscleGroupTrendLabels"
            :series="muscleGroupTrendSeries"
            :value-formatter="formatOneDecimal"
            :empty-label="$t('progress.empty')"
          />

          <div class="index-explanation glass-card">
            <div class="index-title">{{ $t('progress.muscleGroups.indexTitle') }}</div>
            <p class="index-text">
              {{ $t('progress.muscleGroups.indexIntro', { muscle: $t(`muscleGroups.${selectedMuscleGroup}`) }) }}
            </p>
            <ol class="index-list">
              <li>{{ $t('progress.muscleGroups.indexStep1') }}</li>
              <li>{{ $t('progress.muscleGroups.indexStep2') }}</li>
              <li>{{ $t('progress.muscleGroups.indexStep3') }}</li>
              <li>{{ $t('progress.muscleGroups.indexStep4') }}</li>
            </ol>
            <div class="factor-row">
              <span class="factor-chip">{{ $t('progress.muscleGroups.factorCompound') }}</span>
              <span class="factor-chip">{{ $t('progress.muscleGroups.factorIsolation') }}</span>
            </div>
            <div class="index-values">
              <div class="index-pill">{{ $t('progress.muscleGroups.indexValue100') }}</div>
              <div class="index-pill">{{ $t('progress.muscleGroups.indexValue110') }}</div>
              <div class="index-pill">{{ $t('progress.muscleGroups.indexValue90') }}</div>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { api } from 'boot/axios'
import { useI18n } from 'vue-i18n'
import TrendChart from 'components/progress/trendChart.vue'
import MuscleBodyDiagram from 'components/plans/muscleBodyDiagram.vue'

const MUSCLE_GROUP_OPTIONS = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'OBLIQUES',
  'QUADS',
  'HAMSTRINGS',
  'GLUTES',
  'CALVES'
]

export default defineComponent({
  name: 'ProgressIndexPage',

  components: {
    TrendChart,
    MuscleBodyDiagram
  },

  setup() {
    const { locale, t } = useI18n({ useScope: 'global' })

    const activeTab = ref('training')
    const range = ref('12w')
    const selectedExerciseId = ref('')
    const selectedMuscleGroup = ref('BACK')
    const exerciseSearch = ref('')

    const workoutsTrend = ref([])
    const exerciseTrend = ref([])
    const exerciseOptions = ref([])
    const muscleGroupTrend = ref([])

    const rangeOptions = [
      { value: '8w', label: '8W' },
      { value: '12w', label: '12W' },
      { value: '24w', label: '24W' }
    ]

    const muscleGroupOptions = MUSCLE_GROUP_OPTIONS

    const formatDateLabel = (value) => {
      const date = new Date(`${value}T00:00:00.000Z`)
      return new Intl.DateTimeFormat(locale.value, { month: 'short', day: '2-digit' }).format(date)
    }

    const getIsoWeekYear = (value) => {
      const date = new Date(`${value}T00:00:00.000Z`)
      const normalized = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
      const day = normalized.getUTCDay() || 7
      normalized.setUTCDate(normalized.getUTCDate() + 4 - day)
      const yearStart = new Date(Date.UTC(normalized.getUTCFullYear(), 0, 1))
      const week = Math.ceil((((normalized - yearStart) / 86400000) + 1) / 7)
      return {
        week,
        year: normalized.getUTCFullYear()
      }
    }

    const formatInteger = (value) => {
      return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 0 }).format(value)
    }

    const formatOneDecimal = (value) => {
      return new Intl.NumberFormat(locale.value, { maximumFractionDigits: 1 }).format(value)
    }

    const formatKg = (value) => {
      return `${formatOneDecimal(value)} ${t('units.kg')}`
    }

    const workoutTrendLabels = computed(() => {
      return workoutsTrend.value.map(point => {
        const iso = getIsoWeekYear(point.weekStart)
        const week = iso.week.toString().padStart(2, '0')
        return t('progress.training.calendarWeek', { week, year: iso.year })
      })
    })
    const workoutTrendSeries = computed(() => [{
      key: 'workouts',
      label: 'Workouts',
      color: '#00ffc2',
      values: workoutsTrend.value.map(point => point.completedWorkouts)
    }])

    const averageWorkoutsPerWeek = computed(() => {
      if (!workoutsTrend.value.length) return formatOneDecimal(0)
      const total = workoutsTrend.value.reduce((sum, point) => sum + point.completedWorkouts, 0)
      return formatOneDecimal(total / workoutsTrend.value.length)
    })

    const exerciseTrendLabels = computed(() => exerciseTrend.value.map(point => formatDateLabel(point.date)))
    const exerciseTrendSeries = computed(() => [
      {
        key: 'topSet',
        label: `Topset (${t('units.kg')})`,
        color: '#00ffc2',
        values: exerciseTrend.value.map(point => point.topSetWeight)
      },
      {
        key: 'e1rm',
        label: `e1RM (${t('units.kg')})`,
        color: '#2196f3',
        values: exerciseTrend.value.map(point => point.e1rm)
      }
    ])

    const muscleGroupTrendLabels = computed(() => muscleGroupTrend.value.map(point => formatDateLabel(point.weekStart)))
    const muscleGroupTrendSeries = computed(() => [{
      key: 'muscleIndex',
      label: 'Index',
      color: '#00ffc2',
      values: muscleGroupTrend.value.map(point => point.muscleGroupIndex)
    }])

    const muscleSelectionSets = computed(() => {
      const sets = {}
      for (const group of muscleGroupOptions) {
        sets[group] = group === selectedMuscleGroup.value ? 2 : 1
      }
      return sets
    })

    const filteredExerciseOptions = computed(() => {
      const query = exerciseSearch.value.trim().toLowerCase()
      if (!query) return exerciseOptions.value
      return exerciseOptions.value.filter(exercise => exercise.name.toLowerCase().includes(query))
    })

    const fetchWorkoutTrend = async () => {
      const { data } = await api.get(`/api/stats/workouts-trend?range=${range.value}`)
      workoutsTrend.value = data.points
    }

    const fetchExerciseTrend = async () => {
      const query = new URLSearchParams({ range: range.value })
      if (selectedExerciseId.value) {
        query.set('exerciseId', selectedExerciseId.value)
      }

      const { data } = await api.get(`/api/stats/exercise-trend?${query.toString()}`)
      exerciseOptions.value = data.availableExercises
      selectedExerciseId.value = data.selectedExerciseId || ''
      exerciseTrend.value = data.points
    }

    const selectExercise = (exerciseId) => {
      if (selectedExerciseId.value === exerciseId) return
      selectedExerciseId.value = exerciseId
      fetchExerciseTrend()
    }

    const fetchMuscleGroupTrend = async () => {
      const query = new URLSearchParams({
        range: range.value,
        muscleGroup: selectedMuscleGroup.value
      })

      const { data } = await api.get(`/api/stats/muscle-group-trend?${query.toString()}`)
      muscleGroupTrend.value = data.points
    }

    const selectMuscleGroup = (muscleGroup) => {
      if (selectedMuscleGroup.value === muscleGroup) return
      selectedMuscleGroup.value = muscleGroup
      fetchMuscleGroupTrend()
    }

    const fetchAll = async () => {
      await Promise.all([
        fetchWorkoutTrend(),
        fetchExerciseTrend(),
        fetchMuscleGroupTrend()
      ])
    }

    const selectRange = (value) => {
      if (range.value === value) return
      range.value = value
    }

    watch(range, fetchAll)

    onMounted(fetchAll)

    return {
      activeTab,
      range,
      rangeOptions,
      muscleGroupOptions,
      selectedExerciseId,
      selectedMuscleGroup,
      exerciseSearch,
      exerciseOptions,
      filteredExerciseOptions,
      muscleSelectionSets,
      workoutTrendLabels,
      workoutTrendSeries,
      averageWorkoutsPerWeek,
      exerciseTrendLabels,
      exerciseTrendSeries,
      muscleGroupTrendLabels,
      muscleGroupTrendSeries,
      selectRange,
      selectExercise,
      selectMuscleGroup,
      fetchExerciseTrend,
      fetchMuscleGroupTrend,
      formatInteger,
      formatOneDecimal,
      formatKg
    }
  }
})
</script>

<style scoped>
.progress-page {
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
  margin-top: 16px;
  line-height: 1.1;
}

.page-subtitle {
  margin: 2px 0 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}

.filter-row {
  padding: 8px;
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-chip {
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.03);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 12px;
  cursor: pointer;
}

.filter-chip.active {
  border-color: rgba(0, 255, 194, 0.4);
  background: rgba(0, 255, 194, 0.12);
  color: #00ffc2;
}

.progress-tabs {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  margin-bottom: 10px;
}

.progress-tabs :deep(.q-tab) {
  color: rgba(255, 255, 255, 0.78);
}

.progress-tabs :deep(.q-tab--active) {
  color: #00ffc2;
}

.progress-panels {
  background: transparent;
  padding: 0;
}

.progress-panels :deep(.q-tab-panel) {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avg-card {
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avg-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.68);
}

.avg-value {
  font-size: 22px;
  font-weight: 700;
  color: #00ffc2;
}

.selector-card {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.selector-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.selector-input {
  width: 100%;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  color: white;
  padding: 8px 10px;
  font-size: 13px;
}

.selector-input:focus {
  outline: none;
  border-color: rgba(0, 255, 194, 0.4);
}

.exercise-cards-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 2px;
  overflow-x: auto;
  padding-bottom: 2px;
}

.exercise-cards-row::-webkit-scrollbar {
  height: 4px;
}

.exercise-cards-row::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.18);
  border-radius: 999px;
}

.exercise-card {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: linear-gradient(150deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.02));
  color: rgba(255, 255, 255, 0.86);
  border-radius: 10px;
  min-width: 128px;
  max-width: 180px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.2;
  text-align: left;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.18s ease;
}

.exercise-card:hover {
  border-color: rgba(0, 255, 194, 0.32);
  transform: translateY(-1px);
}

.exercise-card.active {
  border-color: rgba(0, 255, 194, 0.42);
  background: linear-gradient(150deg, rgba(0, 255, 194, 0.22), rgba(0, 255, 194, 0.1));
  color: #00ffc2;
}

.exercise-empty {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.muscle-picker-card {
  padding: 10px 12px;
}

.muscle-picker-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.muscle-active {
  font-size: 12px;
  font-weight: 600;
  color: #00ffc2;
}

.index-explanation {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.index-title {
  font-size: 14px;
  font-weight: 700;
  color: white;
}

.index-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.78);
}

.index-list {
  margin: 0;
  padding-left: 18px;
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  line-height: 1.45;
}

.index-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.factor-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.factor-chip {
  border: 1px solid rgba(0, 255, 194, 0.28);
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  color: rgba(0, 255, 194, 0.92);
  background: rgba(0, 255, 194, 0.08);
}

.index-pill {
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.88);
  background: rgba(255, 255, 255, 0.03);
}

.formula-card {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.formula-title {
  font-size: 13px;
  font-weight: 700;
  color: white;
}

.formula-value {
  font-size: 12px;
  color: #00ffc2;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.formula-text {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.74);
}

@media (min-width: 768px) {
  .content-container {
    padding-top: 12px;
  }
}
</style>
