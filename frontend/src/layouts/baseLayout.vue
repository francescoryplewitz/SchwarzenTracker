<template>
  <q-layout v-if="isAuthenticated" view="hHh lpR fFf" class="app-layout">
    <q-header class="app-header">
      <header-component :is-mobile="isMobile" />
    </q-header>

    <q-page-container>
      <router-view :key="route.fullPath" />
    </q-page-container>

    <q-footer v-if="isMobile" class="app-footer">
      <navbar-bottom />
    </q-footer>
  </q-layout>
</template>

<script>
import { defineComponent, onBeforeMount, ref } from 'vue'
import { LocalStorage, Platform } from 'quasar'
import { api } from 'boot/axios'
import { useRoute, useRouter } from 'vue-router'
import HeaderComponent from 'components/header.vue'
import NavbarBottom from 'src/components/navbarBase.vue'
import { hasRole } from 'src/components/common/helper.js'

export default defineComponent({
  name: 'BaseLayout',

  components: {
    HeaderComponent,
    NavbarBottom
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const isAuthenticated = ref(false)
    const isMobile = ref(false)

    async function getCurrentUser() {
      const result = await api.get(`/user/current`, {
        withCredentials: true,
      }).catch(() => { })

      if (result) {
        LocalStorage.set('user', result.data)
        isAuthenticated.value = true
      }
    }

    onBeforeMount(async () => {
      const [response] = await Promise.all([
        api.get('/device'),
        getCurrentUser()
      ])

      Platform.is.mobile = response.data.isMobile
      isMobile.value = response.data.isMobile

      if (!hasRole('user')) {
        router.push('/')
        return
      }
    })

    return {
      route,
      isAuthenticated,
      isMobile
    }
  }
})
</script>

<style>
.app-layout {
  background:
    radial-gradient(ellipse at top left, rgba(0, 255, 194, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(0, 255, 194, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at center, rgba(0, 255, 194, 0.03) 0%, transparent 70%),
    linear-gradient(135deg, #040d16 0%, #061219 50%, #040d16 100%);
  min-height: 100vh;
}

.app-header {
  background: rgba(4, 13, 22, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.app-footer {
  background: rgba(4, 13, 22, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
</style>
