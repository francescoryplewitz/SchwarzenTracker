<template>
  <q-layout v-if="isAuthenticated" view="hHh lpR fFf" class="bg-grey-2">
    <q-header class="bg-grey-2">
      <headerComponent />
      <navbar></navbar>
    </q-header>

    <q-page-container v-if="route">
      <router-view :key="route.fullPath" />
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent, onBeforeMount, ref } from 'vue'
import { LocalStorage } from 'quasar'
import { api } from 'boot/axios'
import { useRoute, useRouter } from "vue-router"
import headerComponent from 'components/header.vue'
import { hasRole } from 'src/components/common/helper.js'
import { Platform } from 'quasar'
import navbar from 'src/components/navbarBase.vue';

export default defineComponent({
  name: 'internLayout',

  components: {
    headerComponent, navbar
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const isAuthenticated = ref(false)

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

      if (!hasRole('USER')) {
        router.push('/')
        return
      }
    })

    return {
      route,
      isAuthenticated
    }
  }
})
</script>