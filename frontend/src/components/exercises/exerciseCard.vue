<template>
  <div class="exercise-card glass-card" data-test="exercise-card" @click="$router.push(`/exercises/${exercise.id}`)">
    <div class="card-content">
      <div class="card-main">
        <button
          class="favorite-btn"
          :class="{ active: exercise.isFavorite }"
          data-test="favorite-btn"
          @click.stop="toggleFavorite"
        >
          <q-icon :name="exercise.isFavorite ? 'mdi-star' : 'mdi-star-outline'" size="18px" />
          <q-tooltip>{{ exercise.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren' }}</q-tooltip>
        </button>

        <div class="card-info">
          <div class="exercise-name" data-test="exercise-name">{{ exercise.name }}</div>

          <div class="exercise-meta">
            <span
              v-for="mg in primaryMuscleGroups"
              :key="mg"
              class="meta-chip"
              data-test="muscle-chip"
            >
              {{ muscleGroupLabels[mg] || mg }}
            </span>
            <span v-if="exercise.equipment" class="meta-text" data-test="equipment-label">
              {{ equipmentLabels[exercise.equipment] }}
            </span>
            <span class="meta-text" data-test="category-label">{{ categoryLabels[exercise.category] }}</span>
          </div>

          <div v-if="exercise._count?.variants > 0" class="variants-count" data-test="variants-count">
            {{ exercise._count.variants }} {{ exercise._count.variants === 1 ? 'Variante' : 'Varianten' }}
          </div>
        </div>
      </div>

      <div class="card-arrow">
        <q-icon name="mdi-chevron-right" size="20px" />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { api } from 'boot/axios'
import { muscleGroupLabels } from 'src/constants/muscleGroups'

const equipmentLabels = {
  BARBELL: 'Langhantel',
  DUMBBELL: 'Kurzhantel',
  MACHINE: 'Maschine',
  CABLE: 'Kabelzug',
  BODYWEIGHT: 'Körpergewicht',
  KETTLEBELL: 'Kettlebell',
  BAND: 'Widerstandsband',
  OTHER: 'Sonstiges'
}

const categoryLabels = {
  COMPOUND: 'Compound',
  ISOLATION: 'Isolation',
  CARDIO: 'Cardio',
  STRETCHING: 'Dehnung'
}

export default defineComponent({
  name: 'ExerciseCard',

  props: {
    exercise: { type: Object, required: true }
  },

  setup(props) {
    const primaryMuscleGroups = computed(() => {
      return props.exercise.muscleGroups?.slice(0, 2) || []
    })

    const toggleFavorite = async () => {
      if (props.exercise.isFavorite) {
        await api.delete(`/api/exercises/${props.exercise.id}/favorite`)
        // eslint-disable-next-line vue/no-mutating-props
        props.exercise.isFavorite = false
      } else {
        await api.post(`/api/exercises/${props.exercise.id}/favorite`)
        // eslint-disable-next-line vue/no-mutating-props
        props.exercise.isFavorite = true
      }
    }

    return {
      primaryMuscleGroups,
      toggleFavorite,
      muscleGroupLabels,
      equipmentLabels,
      categoryLabels
    }
  }
})
</script>

<style scoped>
.exercise-card {
  padding: 16px;
  cursor: pointer;
}

.exercise-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(0, 255, 194, 0.25);
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
}

.favorite-btn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.favorite-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.6);
}

.favorite-btn.active {
  color: #00ffc2;
}

.favorite-btn.active:hover {
  background: rgba(0, 255, 194, 0.1);
}

.card-info {
  flex: 1;
  min-width: 0;
}

.exercise-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
  line-height: 1.3;
}

.exercise-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.meta-chip {
  display: inline-block;
  padding: 4px 10px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.meta-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.variants-count {
  margin-top: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.card-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.exercise-card:hover .card-arrow {
  color: #00ffc2;
  transform: translateX(4px);
}
</style>
