<template>
  <div class="trend-chart glass-card">
    <div class="chart-head">
      <h3 class="chart-title">{{ title }}</h3>
      <div v-if="series.length > 1" class="legend">
        <span v-for="item in series" :key="item.key" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: item.color }" />
          {{ item.label }}
        </span>
      </div>
    </div>

    <div v-if="hasData" class="chart-content">
      <div class="chart-body">
        <div class="y-axis-column">
          <div v-if="yAxisLabel" class="y-axis-label">{{ yAxisLabel }}</div>
          <div class="y-axis-ticks">
            <span v-for="tick in yTicks" :key="tick.key" class="y-axis-tick">
              {{ valueFormatter(tick.value) }}
            </span>
          </div>
        </div>

        <svg viewBox="0 0 100 40" preserveAspectRatio="none" class="chart-svg" @click="onChartClick">
          <line
            v-for="tick in yTicks"
            :key="tick.key"
            x1="0"
            :y1="tick.y"
            x2="100"
            :y2="tick.y"
            class="grid-line"
          />

          <line
            v-if="selectedGuideX !== null"
            :x1="selectedGuideX"
            y1="4"
            :x2="selectedGuideX"
            y2="36"
            class="selected-guide"
          />

          <g v-for="item in normalizedSeries" :key="item.key">
            <path
              v-for="segment in item.segments"
              :key="`${segment.key}-area`"
              :d="segment.areaPath"
              :fill="item.color"
              class="area-fill"
            />
            <path
              v-for="segment in item.segments"
              :key="`${segment.key}-line`"
              :d="segment.linePath"
              :stroke="item.color"
              fill="none"
              class="line-stroke"
            />
          </g>

          <g v-if="selectedPoints.length">
            <g v-for="point in selectedPoints" :key="point.key">
              <circle :cx="point.x" :cy="point.y" r="2.05" class="focus-ring" />
              <circle :cx="point.x" :cy="point.y" r="1.1" :fill="point.color" class="focus-dot" />
            </g>
          </g>
        </svg>
      </div>

      <div v-if="selectedTooltip" class="selected-tooltip">
        <div class="selected-date">{{ selectedTooltip.label }}</div>
        <div v-for="entry in selectedTooltip.entries" :key="entry.key" class="selected-entry">
          <span class="selected-dot" :style="{ backgroundColor: entry.color }" />
          <span class="selected-name">{{ entry.label }}:</span>
          <span class="selected-value">{{ valueFormatter(entry.value) }}</span>
        </div>
      </div>

      <div class="labels-row">
        <span v-for="label in visibleLabels" :key="label.key">{{ label.text }}</span>
      </div>
    </div>

    <div v-else class="empty-state">
      {{ emptyLabel }}
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, watch } from 'vue'

const CHART_TOP = 4
const CHART_BOTTOM = 36
const CHART_HEIGHT = CHART_BOTTOM - CHART_TOP

const buildSmoothPath = (points) => {
  if (points.length < 2) return ''

  let path = `M ${points[0].x},${points[0].y}`

  for (let index = 0; index < points.length - 1; index++) {
    const p0 = points[index - 1] || points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] || p2

    const cp1x = p1.x + ((p2.x - p0.x) / 6)
    const cp1y = p1.y + ((p2.y - p0.y) / 6)
    const cp2x = p2.x - ((p3.x - p1.x) / 6)
    const cp2y = p2.y - ((p3.y - p1.y) / 6)

    path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }

  return path
}

const buildAreaPath = (points, linePath) => {
  if (!linePath) return ''

  const first = points[0]
  const last = points[points.length - 1]
  return `${linePath} L ${last.x},${CHART_BOTTOM} L ${first.x},${CHART_BOTTOM} Z`
}

export default defineComponent({
  name: 'TrendChart',

  props: {
    title: { type: String, required: true },
    labels: { type: Array, required: true },
    series: { type: Array, required: true },
    valueFormatter: {
      type: Function,
      default: (value) => `${Number(value).toFixed(1)}`
    },
    yAxisTickCount: { type: Number, default: 5 },
    yAxisLabel: { type: String, default: '' },
    emptyLabel: { type: String, required: true }
  },

  setup(props) {
    const selectedIndex = ref(null)

    const allValues = computed(() => {
      const values = []
      for (const item of props.series) {
        for (const value of item.values) {
          if (value === null || value === undefined) continue
          values.push(value)
        }
      }
      return values
    })

    const hasData = computed(() => allValues.value.length > 0)

    const scale = computed(() => {
      if (!hasData.value) {
        return { min: 0, max: 1 }
      }

      const min = Math.min(...allValues.value)
      const max = Math.max(...allValues.value)
      if (min === max) {
        return {
          min: min - 1,
          max: max + 1
        }
      }

      return { min, max }
    })

    const getX = (index, length) => {
      if (length <= 1) return 50
      return (index / (length - 1)) * 100
    }

    const getY = (value) => {
      const ratio = (value - scale.value.min) / (scale.value.max - scale.value.min)
      return CHART_TOP + (CHART_HEIGHT - (ratio * CHART_HEIGHT))
    }

    const normalizedSeries = computed(() => {
      const items = []

      for (const item of props.series) {
        const segments = []
        let activePoints = []

        for (let index = 0; index < item.values.length; index++) {
          const value = item.values[index]

          if (value === null || value === undefined) {
            if (activePoints.length > 1) {
              const linePath = buildSmoothPath(activePoints)
              segments.push({
                key: `${item.key}-${segments.length}`,
                linePath,
                areaPath: buildAreaPath(activePoints, linePath)
              })
            }
            activePoints = []
            continue
          }

          activePoints.push({
            x: getX(index, item.values.length),
            y: getY(value),
            index
          })
        }

        if (activePoints.length > 1) {
          const linePath = buildSmoothPath(activePoints)
          segments.push({
            key: `${item.key}-${segments.length}`,
            linePath,
            areaPath: buildAreaPath(activePoints, linePath)
          })
        }

        items.push({
          key: item.key,
          color: item.color,
          segments
        })
      }

      return items
    })

    const yTicks = computed(() => {
      if (!hasData.value) return []

      const tickCount = Math.max(2, props.yAxisTickCount)
      const step = (scale.value.max - scale.value.min) / (tickCount - 1)
      const ticks = []

      for (let index = 0; index < tickCount; index++) {
        const value = scale.value.max - (index * step)
        ticks.push({
          key: `tick-${index}`,
          y: getY(value),
          value
        })
      }

      return ticks
    })

    const visibleLabels = computed(() => {
      const labels = props.labels
      if (!labels.length) return []

      const targetCount = Math.min(4, labels.length)
      const step = (labels.length - 1) / (targetCount - 1 || 1)
      const selected = []

      for (let index = 0; index < targetCount; index++) {
        const labelIndex = Math.round(index * step)
        selected.push({
          key: `${labelIndex}-${labels[labelIndex]}`,
          text: labels[labelIndex]
        })
      }

      return selected
    })

    const hasValueAtIndex = (index) => {
      for (const item of props.series) {
        const value = item.values[index]
        if (value !== null && value !== undefined) {
          return true
        }
      }
      return false
    }

    const getClosestIndexWithValue = (startIndex) => {
      if (!props.labels.length) return null
      if (hasValueAtIndex(startIndex)) return startIndex

      for (let offset = 1; offset < props.labels.length; offset++) {
        const left = startIndex - offset
        const right = startIndex + offset

        if (left >= 0 && hasValueAtIndex(left)) return left
        if (right < props.labels.length && hasValueAtIndex(right)) return right
      }

      return null
    }

    const onChartClick = (event) => {
      if (!props.labels.length) return

      const rect = event.currentTarget.getBoundingClientRect()
      const clickRatio = (event.clientX - rect.left) / rect.width
      const roughIndex = Math.round(clickRatio * (props.labels.length - 1))
      const boundedIndex = Math.max(0, Math.min(props.labels.length - 1, roughIndex))
      selectedIndex.value = getClosestIndexWithValue(boundedIndex)
    }

    const selectedGuideX = computed(() => {
      if (selectedIndex.value === null) return null
      return getX(selectedIndex.value, props.labels.length)
    })

    const selectedPoints = computed(() => {
      if (selectedIndex.value === null) return []

      return props.series
        .map(item => {
          const value = item.values[selectedIndex.value]
          if (value === null || value === undefined) return null

          return {
            key: `${item.key}-${selectedIndex.value}`,
            color: item.color,
            x: getX(selectedIndex.value, item.values.length),
            y: getY(value)
          }
        })
        .filter(Boolean)
    })

    const selectedTooltip = computed(() => {
      if (selectedIndex.value === null) return null

      const entries = props.series
        .map(item => ({
          key: item.key,
          label: item.label,
          color: item.color,
          value: item.values[selectedIndex.value]
        }))
        .filter(entry => entry.value !== null && entry.value !== undefined)

      if (!entries.length) return null

      return {
        label: props.labels[selectedIndex.value],
        entries
      }
    })

    watch(() => props.labels, () => {
      selectedIndex.value = null
    })

    watch(() => props.series, () => {
      selectedIndex.value = null
    }, { deep: true })

    return {
      hasData,
      yTicks,
      normalizedSeries,
      visibleLabels,
      onChartClick,
      selectedGuideX,
      selectedPoints,
      selectedTooltip
    }
  }
})
</script>

<style scoped>
.trend-chart {
  padding: 14px;
}

.chart-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}

.chart-title {
  margin: 0;
  color: white;
  font-size: 15px;
  font-weight: 700;
}

.legend {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.chart-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.chart-body {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.y-axis-column {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 34px;
}

.y-axis-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 4px;
}

.y-axis-ticks {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 180px;
}

.y-axis-tick {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.62);
  line-height: 1;
}

.chart-svg {
  flex: 1;
  height: 180px;
  cursor: pointer;
}

.grid-line {
  stroke: rgba(255, 255, 255, 0.13);
  stroke-width: 0.34;
}

.area-fill {
  opacity: 0.08;
}

.line-stroke {
  stroke-width: 0.95;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.selected-guide {
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 0.38;
  stroke-dasharray: 1.2 2.8;
}

.focus-ring {
  fill: rgba(255, 255, 255, 0.08);
  stroke: rgba(255, 255, 255, 0.72);
  stroke-width: 0.28;
}

.focus-dot {
  filter: drop-shadow(0 0 2px rgba(255, 255, 255, 0.2));
}

.selected-tooltip {
  border: 1px solid rgba(255, 255, 255, 0.13);
  border-radius: 8px;
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.selected-date {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.86);
  font-weight: 600;
  margin-bottom: 2px;
}

.selected-entry {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.selected-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.selected-name {
  color: rgba(255, 255, 255, 0.68);
}

.selected-value {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 600;
}

.labels-row {
  display: flex;
  justify-content: space-between;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);
}

.empty-state {
  border: 1px dashed rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  min-height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
}
</style>
