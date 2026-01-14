<template>
  <div class="plan-card glass-card" data-test="plan-card" @click="$router.push(`/plans/${plan.id}`)">
    <div class="card-content">
      <div class="card-main">
        <button
          class="favorite-btn"
          :class="{ active: plan.isFavorite }"
          data-test="favorite-btn"
          @click.stop="toggleFavorite"
        >
          <q-icon :name="plan.isFavorite ? 'mdi-star' : 'mdi-star-outline'" size="18px" />
          <q-tooltip>{{ plan.isFavorite ? 'Favorit entfernen' : 'Als Favorit markieren' }}</q-tooltip>
        </button>

        <div class="card-info">
          <div class="plan-header">
            <span class="plan-name" data-test="plan-name">{{ plan.name }}</span>
            <span v-if="plan.isSystem" class="system-badge" data-test="system-badge">SYSTEM</span>
          </div>

          <p v-if="plan.description" class="plan-description" data-test="plan-description">
            {{ plan.description }}
          </p>

          <div class="plan-meta">
            <span class="meta-text" data-test="exercise-count">
              {{ plan.exerciseCount }} {{ plan.exerciseCount === 1 ? 'Übung' : 'Übungen' }}
            </span>
            <span v-if="plan.estimatedDuration" class="meta-text duration-text" data-test="estimated-duration">
              <q-icon name="mdi-timer-outline" size="14px" />
              {{ formatDuration(plan.estimatedDuration) }}
            </span>
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
import { defineComponent } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'PlanCard',

  props: {
    plan: { type: Object, required: true }
  },

  setup(props) {
    const toggleFavorite = async () => {
      if (props.plan.isFavorite) {
        await api.delete(`/api/plans/${props.plan.id}/favorite`)
        // eslint-disable-next-line vue/no-mutating-props
        props.plan.isFavorite = false
      } else {
        await api.post(`/api/plans/${props.plan.id}/favorite`)
        // eslint-disable-next-line vue/no-mutating-props
        props.plan.isFavorite = true
      }
    }

    const formatDuration = (seconds) => {
      if (seconds >= 60) {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return secs > 0 ? `${mins}:${secs.toString().padStart(2, '0')} Min` : `${mins} Min`
      }
      return `${seconds} Sek`
    }

    return {
      toggleFavorite,
      formatDuration
    }
  }
})
</script>

<style scoped>
.plan-card {
  padding: 16px;
  cursor: pointer;
}

.plan-card:hover {
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

.plan-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.plan-name {
  font-size: 15px;
  font-weight: 600;
  color: white;
  line-height: 1.3;
}

.system-badge {
  padding: 2px 6px;
  background: rgba(0, 255, 194, 0.15);
  border: 1px solid rgba(0, 255, 194, 0.25);
  border-radius: 4px;
  font-size: 9px;
  font-weight: 600;
  color: #00ffc2;
  letter-spacing: 0.05em;
}

.plan-description {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 8px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plan-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.35);
}

.duration-text {
  display: flex;
  align-items: center;
  gap: 4px;
  color: rgba(0, 255, 194, 0.6);
}

.duration-text .q-icon {
  color: rgba(0, 255, 194, 0.6);
}

.card-arrow {
  flex-shrink: 0;
  color: rgba(255, 255, 255, 0.25);
  transition: all 0.2s ease;
}

.plan-card:hover .card-arrow {
  color: #00ffc2;
  transform: translateX(4px);
}
</style>
