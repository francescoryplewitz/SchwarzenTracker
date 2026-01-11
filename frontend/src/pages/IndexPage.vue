<template>
  <start-welcome />
</template>

<script>
import { defineComponent } from 'vue'
import StartWelcome from 'components/start-welcome.vue'

export default defineComponent({
  name: 'IndexPage',
  components: {
    StartWelcome
  }
})
</script>
