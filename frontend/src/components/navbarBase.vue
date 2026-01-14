<template>
  <nav class="bottom-nav">
    <button
      v-for="item in menuItems"
      :key="item.name"
      class="nav-item"
      :class="{ active: isActive(item) }"
      @click="navigate(item.route)"
    >
      <q-icon :name="item.icon" size="22px" />
      <span class="nav-label">{{ item.label }}</span>
    </button>
  </nav>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'

export default defineComponent({
  name: 'NavbarBottom',

  setup() {
    const router = useRouter()
    const route = useRoute()

    const menuItems = [
      { name: 'dashboard', label: 'Dashboard', route: '/dashboard', icon: 'mdi-view-dashboard-outline' },
      { name: 'exercises', label: 'Übungen', route: '/exercises', icon: 'mdi-dumbbell' },
      { name: 'plans', label: 'Pläne', route: '/plans', icon: 'mdi-clipboard-text-outline' },
      { name: 'workouts', label: 'Workouts', route: '/workouts', icon: 'mdi-play-circle-outline' }
    ]

    const isActive = (item) => {
      return route.path.includes(item.route)
    }

    const navigate = (path) => {
      if (route.path !== path) {
        router.push(path)
      }
    }

    return {
      menuItems,
      isActive,
      navigate
    }
  }
})
</script>

<style scoped>
.bottom-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  height: 64px;
  padding: 8px 16px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  padding: 8px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  color: #00ffc2;
}

.nav-item.active:hover {
  background: rgba(0, 255, 194, 0.05);
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
