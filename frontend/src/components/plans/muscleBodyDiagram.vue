<template>
  <div class="muscle-diagram" :class="{ interactive: interactive }" data-test="muscle-diagram">
    <div class="diagram-container">
      <div class="view-column">
        <span class="view-label">{{ $t('plans.muscleView.front') }}</span>
        <svg viewBox="0 0 100 200" class="body-svg" @click="onDiagramClick">
          <g class="body-outline">
            <ellipse cx="50" cy="20" rx="15" ry="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M35 38 L30 45 L25 80 L30 82 L35 55 L35 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M65 38 L70 45 L75 80 L70 82 L65 55 L65 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M35 38 L35 100 L30 100 L25 160 L35 160 L40 130 L50 130 L60 130 L65 160 L75 160 L70 100 L65 100 L65 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M25 160 L22 195 L32 195 L35 160" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M75 160 L78 195 L68 195 L65 160" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
          </g>

          <path
            data-muscle="SHOULDERS"
            d="M32 40 Q25 42 28 52 L35 50 L35 40 Z"
            :style="getMuscleStyle('SHOULDERS')"
          >
            <title>{{ $t(muscleGroupLabels.SHOULDERS) }}: {{ sets.SHOULDERS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="SHOULDERS"
            d="M68 40 Q75 42 72 52 L65 50 L65 40 Z"
            :style="getMuscleStyle('SHOULDERS')"
          >
            <title>{{ $t(muscleGroupLabels.SHOULDERS) }}: {{ sets.SHOULDERS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="CHEST"
            d="M38 42 L50 45 L62 42 L62 55 Q50 60 38 55 Z"
            :style="getMuscleStyle('CHEST')"
          >
            <title>{{ $t(muscleGroupLabels.CHEST) }}: {{ sets.CHEST || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="BICEPS"
            d="M30 52 L35 50 L35 70 L28 72 Q27 62 30 52"
            :style="getMuscleStyle('BICEPS')"
          >
            <title>{{ $t(muscleGroupLabels.BICEPS) }}: {{ sets.BICEPS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="BICEPS"
            d="M70 52 L65 50 L65 70 L72 72 Q73 62 70 52"
            :style="getMuscleStyle('BICEPS')"
          >
            <title>{{ $t(muscleGroupLabels.BICEPS) }}: {{ sets.BICEPS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="FOREARMS"
            d="M28 74 L35 72 L35 82 L30 82 L26 80 Z"
            :style="getMuscleStyle('FOREARMS')"
          >
            <title>{{ $t(muscleGroupLabels.FOREARMS) }}: {{ sets.FOREARMS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="FOREARMS"
            d="M72 74 L65 72 L65 82 L70 82 L74 80 Z"
            :style="getMuscleStyle('FOREARMS')"
          >
            <title>{{ $t(muscleGroupLabels.FOREARMS) }}: {{ sets.FOREARMS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="ABS"
            d="M42 58 L50 60 L58 58 L58 88 L50 90 L42 88 Z"
            :style="getMuscleStyle('ABS')"
          >
            <title>{{ $t(muscleGroupLabels.ABS) }}: {{ sets.ABS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="OBLIQUES"
            d="M38 56 L42 58 L42 88 L38 86 L36 70 Z"
            :style="getMuscleStyle('OBLIQUES')"
          >
            <title>{{ $t(muscleGroupLabels.OBLIQUES) }}: {{ sets.OBLIQUES || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="OBLIQUES"
            d="M62 56 L58 58 L58 88 L62 86 L64 70 Z"
            :style="getMuscleStyle('OBLIQUES')"
          >
            <title>{{ $t(muscleGroupLabels.OBLIQUES) }}: {{ sets.OBLIQUES || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="QUADS"
            d="M38 100 L48 100 L46 135 L36 135 L32 118 Z"
            :style="getMuscleStyle('QUADS')"
          >
            <title>{{ $t(muscleGroupLabels.QUADS) }}: {{ sets.QUADS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="QUADS"
            d="M62 100 L52 100 L54 135 L64 135 L68 118 Z"
            :style="getMuscleStyle('QUADS')"
          >
            <title>{{ $t(muscleGroupLabels.QUADS) }}: {{ sets.QUADS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="CALVES"
            d="M28 165 L34 162 L34 185 L28 188 Z"
            :style="getMuscleStyle('CALVES')"
          >
            <title>{{ $t(muscleGroupLabels.CALVES) }}: {{ sets.CALVES || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="CALVES"
            d="M72 165 L66 162 L66 185 L72 188 Z"
            :style="getMuscleStyle('CALVES')"
          >
            <title>{{ $t(muscleGroupLabels.CALVES) }}: {{ sets.CALVES || 0 }} {{ $t('units.sets') }}</title>
          </path>
        </svg>
      </div>

      <div class="view-column">
        <span class="view-label">{{ $t('plans.muscleView.back') }}</span>
        <svg viewBox="0 0 100 200" class="body-svg" @click="onDiagramClick">
          <g class="body-outline">
            <ellipse cx="50" cy="20" rx="15" ry="18" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M35 38 L30 45 L25 80 L30 82 L35 55 L35 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M65 38 L70 45 L75 80 L70 82 L65 55 L65 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M35 38 L35 100 L30 100 L25 160 L35 160 L40 130 L50 130 L60 130 L65 160 L75 160 L70 100 L65 100 L65 38" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M25 160 L22 195 L32 195 L35 160" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
            <path d="M75 160 L78 195 L68 195 L65 160" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" />
          </g>

          <path
            data-muscle="SHOULDERS"
            d="M32 40 Q25 42 28 52 L35 50 L35 40 Z"
            :style="getMuscleStyle('SHOULDERS')"
          >
            <title>{{ $t(muscleGroupLabels.SHOULDERS) }}: {{ sets.SHOULDERS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="SHOULDERS"
            d="M68 40 Q75 42 72 52 L65 50 L65 40 Z"
            :style="getMuscleStyle('SHOULDERS')"
          >
            <title>{{ $t(muscleGroupLabels.SHOULDERS) }}: {{ sets.SHOULDERS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="BACK"
            d="M38 42 L50 40 L62 42 L64 75 L50 80 L36 75 Z"
            :style="getMuscleStyle('BACK')"
          >
            <title>{{ $t(muscleGroupLabels.BACK) }}: {{ sets.BACK || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="TRICEPS"
            d="M30 52 L35 50 L35 70 L28 72 Q27 62 30 52"
            :style="getMuscleStyle('TRICEPS')"
          >
            <title>{{ $t(muscleGroupLabels.TRICEPS) }}: {{ sets.TRICEPS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="TRICEPS"
            d="M70 52 L65 50 L65 70 L72 72 Q73 62 70 52"
            :style="getMuscleStyle('TRICEPS')"
          >
            <title>{{ $t(muscleGroupLabels.TRICEPS) }}: {{ sets.TRICEPS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="FOREARMS"
            d="M28 74 L35 72 L35 82 L30 82 L26 80 Z"
            :style="getMuscleStyle('FOREARMS')"
          >
            <title>{{ $t(muscleGroupLabels.FOREARMS) }}: {{ sets.FOREARMS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="FOREARMS"
            d="M72 74 L65 72 L65 82 L70 82 L74 80 Z"
            :style="getMuscleStyle('FOREARMS')"
          >
            <title>{{ $t(muscleGroupLabels.FOREARMS) }}: {{ sets.FOREARMS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="GLUTES"
            d="M36 88 L50 92 L64 88 L64 102 L50 105 L36 102 Z"
            :style="getMuscleStyle('GLUTES')"
          >
            <title>{{ $t(muscleGroupLabels.GLUTES) }}: {{ sets.GLUTES || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="HAMSTRINGS"
            d="M38 105 L48 108 L46 135 L36 135 L34 120 Z"
            :style="getMuscleStyle('HAMSTRINGS')"
          >
            <title>{{ $t(muscleGroupLabels.HAMSTRINGS) }}: {{ sets.HAMSTRINGS || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="HAMSTRINGS"
            d="M62 105 L52 108 L54 135 L64 135 L66 120 Z"
            :style="getMuscleStyle('HAMSTRINGS')"
          >
            <title>{{ $t(muscleGroupLabels.HAMSTRINGS) }}: {{ sets.HAMSTRINGS || 0 }} {{ $t('units.sets') }}</title>
          </path>

          <path
            data-muscle="CALVES"
            d="M28 165 L34 162 L34 185 L28 188 Z"
            :style="getMuscleStyle('CALVES')"
          >
            <title>{{ $t(muscleGroupLabels.CALVES) }}: {{ sets.CALVES || 0 }} {{ $t('units.sets') }}</title>
          </path>
          <path
            data-muscle="CALVES"
            d="M72 165 L66 162 L66 185 L72 188 Z"
            :style="getMuscleStyle('CALVES')"
          >
            <title>{{ $t(muscleGroupLabels.CALVES) }}: {{ sets.CALVES || 0 }} {{ $t('units.sets') }}</title>
          </path>
        </svg>
      </div>
    </div>

    <div v-if="activeMuscles.length > 0" class="muscle-legend">
      <div
        v-for="muscle in activeMuscles"
        :key="muscle"
        class="legend-item"
        :class="{ interactive: interactive, active: selectedMuscle === muscle }"
        @click="onLegendClick(muscle)"
      >
        <span class="legend-dot" :style="getDotStyle(muscle)" />
        <span class="legend-name">{{ $t(muscleGroupLabels[muscle]) }}</span>
        <span v-if="showSets" class="legend-count">{{ sets[muscle] }} {{ $t('units.sets') }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { muscleGroupLabels } from 'src/constants/muscleGroups'

export default defineComponent({
  name: 'MuscleBodyDiagram',

  emits: ['select-muscle'],

  props: {
    sets: { type: Object, required: true },
    maxSets: { type: Number, required: true },
    showSets: { type: Boolean, default: true },
    interactive: { type: Boolean, default: false },
    selectedMuscle: { type: String, default: '' }
  },

  setup(props, { emit }) {
    const activeMuscles = computed(() => {
      return Object.entries(props.sets)
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([muscle]) => muscle)
    })

    const getMuscleStyle = (muscle) => {
      if (props.selectedMuscle) {
        if (props.selectedMuscle === muscle) {
          return {
            fill: 'rgba(0, 255, 194, 0.85)',
            stroke: 'rgba(0, 255, 194, 1)',
            filter: 'drop-shadow(0 0 8px rgba(0, 255, 194, 0.55))'
          }
        }

        return {
          fill: 'rgba(255, 255, 255, 0.03)',
          stroke: 'rgba(255, 255, 255, 0.08)'
        }
      }

      const count = props.sets[muscle] || 0
      if (!count) return { fill: 'rgba(255, 255, 255, 0.03)', stroke: 'rgba(255, 255, 255, 0.05)' }
      const intensity = 0.25 + (count / props.maxSets) * 0.55
      return {
        fill: `rgba(0, 255, 194, ${intensity})`,
        stroke: `rgba(0, 255, 194, ${intensity + 0.2})`,
        filter: `drop-shadow(0 0 ${3 + Math.min(count, 10)}px rgba(0, 255, 194, 0.4))`
      }
    }

    const getDotStyle = (muscle) => {
      if (props.selectedMuscle) {
        if (props.selectedMuscle === muscle) {
          return { background: 'rgba(0, 255, 194, 0.95)' }
        }
        return { background: 'rgba(255, 255, 255, 0.25)' }
      }

      const count = props.sets[muscle] || 0
      const intensity = 0.4 + (count / props.maxSets) * 0.6
      return { background: `rgba(0, 255, 194, ${intensity})` }
    }

    const onDiagramClick = (event) => {
      if (!props.interactive) return
      const target = event.target.closest('[data-muscle]')
      if (!target) return
      emit('select-muscle', target.dataset.muscle)
    }

    const onLegendClick = (muscle) => {
      if (!props.interactive) return
      emit('select-muscle', muscle)
    }

    return {
      muscleGroupLabels,
      activeMuscles,
      getMuscleStyle,
      getDotStyle,
      onDiagramClick,
      onLegendClick
    }
  }
})
</script>

<style scoped>
.muscle-diagram {
  padding: 16px 0;
}

.diagram-container {
  display: flex;
  justify-content: center;
  gap: 32px;
}

.view-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.view-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.body-svg {
  width: 100px;
  height: 200px;
}

.body-svg path[data-muscle] {
  transition: all 0.3s ease;
  cursor: default;
}

.muscle-diagram.interactive .body-svg path[data-muscle] {
  cursor: pointer;
}

.muscle-diagram.interactive .body-svg path[data-muscle]:hover {
  filter: brightness(1.08);
}

.muscle-diagram :deep(svg) {
  user-select: none;
}

.muscle-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px 20px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  border: none;
  background: transparent;
  padding: 0;
}

.legend-item.interactive {
  cursor: pointer;
}

.legend-item.interactive.active .legend-name {
  color: #00ffc2;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-name {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-count {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

@media (max-width: 480px) {
  .diagram-container {
    gap: 16px;
  }

  .body-svg {
    width: 80px;
    height: 160px;
  }

  .muscle-legend {
    gap: 8px 16px;
  }
}
</style>
