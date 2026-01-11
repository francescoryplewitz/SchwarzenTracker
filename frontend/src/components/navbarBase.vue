<template>
  <!-- Desktop Card -->
  <q-card v-if="!isMobile" class="bg-white q-ma-md">
    <div class="row items-center no-wrap q-px-sm q-my-md">
      <q-btn v-for="item in menuItems" :key="item.name" flat dense :label="item.label" @click="navigate(item)"
        :color="isActive(item) ? 'primary' : 'black'" :class="isActive(item) ? 'tab-active' : ''"
        class="no-uppercase q-mx-xs" />
    </div>
  </q-card>

  <!-- Mobile Card -->
  <q-card v-else class="bg-white q-my-md q-mx-md q-pa-sm">
    <div class="row items-stretch">
      <q-btn v-for="item in menuItems" :key="item.name" flat no-caps class="col tab-btn" @click="navigate(item.route)"
        :class="isActive(item) ? 'text-primary tab-active' : 'text-grey-7'">
        <q-icon :name="item.icon" size="sm" class="q-mr-sm" />
        <span>{{ item.label }}</span>
      </q-btn>
    </div>
  </q-card>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'

export default defineComponent({

  setup() {
    const router = useRouter()
    const route = useRoute()
    const q = useQuasar()
    const isMobile = computed(() => q.platform.is.mobile)

    const menuItems = []

    const isActive = item => {
      return route.path.includes(item.route)
    }
    
    function navigate(path) {
      if (route.path !== path && path) {
        router.push(typeof path === 'string' ? path : path.route)
      }
    }

    return {
      menuItems,
      isMobile,
      isActive,
      navigate
    }
  }
})
</script>

<style scoped>
.no-uppercase {
  text-transform: none
}
.tab-active {
  border-bottom: 2px solid #23a0df;
}
</style>
