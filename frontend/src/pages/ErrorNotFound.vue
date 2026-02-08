<template>
  <div class="error-page dark-page">
    <div class="content-container">
      <div class="error-card glass-card">
        <div class="error-icon">
          <q-icon name="mdi-alert-circle-outline" size="80px" />
        </div>
        <h1 class="error-code">404</h1>
        <p class="error-text">{{ $t('errors.notFoundTitle') }}</p>
        <button class="home-btn" @click="$router.push('/')">
          <q-icon name="mdi-home" size="18px" />
          {{ $t('errors.goHome') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'ErrorNotFound'
})
</script>

<style scoped>
.error-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 400px;
  padding: 24px 16px;
}

.error-card {
  padding: 48px 32px;
  text-align: center;
}

.error-icon {
  color: rgba(255, 255, 255, 0.2);
  margin-bottom: 16px;
}

.error-code {
  font-size: 72px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.15);
  margin: 0 0 8px;
  letter-spacing: -0.04em;
}

.error-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 32px;
}

.home-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  background: rgba(0, 255, 194, 0.15);
  border: 1px solid rgba(0, 255, 194, 0.3);
  border-radius: 12px;
  color: #00ffc2;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.home-btn:hover {
  background: rgba(0, 255, 194, 0.25);
  transform: translateY(-2px);
}
</style>
