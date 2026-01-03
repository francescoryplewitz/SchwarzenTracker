<template>
  <intro></intro>
</template>

<script>
import { defineComponent } from 'vue';
import intro from 'components/intro.vue';

export default defineComponent({
  name: 'IndexPage',
  components: {
    intro
  },
});
</script>
