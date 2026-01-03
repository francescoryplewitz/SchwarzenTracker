<template>
  <div class="flex flex-center">
    <div class="row items-center q-mt-md">
      <!-- Bild (maximal 60% Breite) -->
      <img src="~/assets/404.png" alt="404 Fehlerseite" style="max-width: 60%; height: auto;" />

      <!-- Button mit etwas Abstand links und größerer Größe -->
      <q-btn class="q-ml-md" color="primary" unelevated to="/" label="Ab nach Hause!" no-caps size="lg" />
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ErrorNotFound',
  setup() {
    return {};
  }
});
</script>
