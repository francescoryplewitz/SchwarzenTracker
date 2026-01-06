<template>
  <q-card flat class="q-pa-xs">
    <div class="row items-center text-black">
      <!-- Logo + Badge -->
      <div class="col-auto self-center flex column items-center text-center">
        <img @click="router.push('/')" alt="BRALE Energy Toolbox" class="logo pointer q-pr-md q-ml-md"
          style="width: 100px; max-width: 100%; max-height: 100%;" />
        <q-badge v-if="stage === 'production'" text-color="black" color="white" :label="environment" />
      </div>

      <!-- Environment-Chip (dev/stage) -->
      <div class="col-auto self-center">
        <q-chip v-if="stage !== 'production'" outline square color="red" :label="environment" />
      </div>

      <!-- Logout-Button ganz rechts -->
      <div class="col flex justify-end">
        <q-btn flat dense icon="fa-solid fa-right-from-bracket" @click="logout()">
          <q-tooltip>Hier können Sie sich ausloggen!</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card>
</template>

<script>
import { defineComponent, ref, onMounted, } from 'vue'
import { useRouter } from "vue-router"
import { api } from 'boot/axios'
import { LocalStorage } from 'quasar'


export default defineComponent({
  name: 'headerComponent',

  components: {
  },

  setup() {
    const environment = ref('')
    const stage = ref('')
    const router = useRouter()

    async function fetchEnvironment() {
      const result = await api({
        url: "/version",
        method: "GET",
        withCredentials: true
      })
      if (result.data.stage !== 'production') {
        environment.value = result.data.stage
      }
      environment.value = `${environment.value} ${result.data.version}`
      stage.value = result.data.stage
    }

    async function logout() {
      LocalStorage.remove('user')
      window.open('/logout', "_self")
    }

    onMounted(() => {
      fetchEnvironment()
    })
    return {
      logout,
      environment,
      stage,
      router
    }
  }
})
</script>
