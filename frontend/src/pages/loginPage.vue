<template>
  <div class="login-page dark-page">
    <div class="content-container">
      <header class="page-header">
        <div class="logo-icon accent-box">
          <q-icon name="mdi-dumbbell" size="32px" />
        </div>
        <h1 class="logo-title">SchwarzenTracker</h1>
        <p class="logo-subtitle">{{ $t('login.subtitle') }}</p>
      </header>

      <div class="info-section glass-card">
        <p class="info-text">
          {{ $t('login.info') }}
        </p>
      </div>

      <div class="login-section">
        <a href="/login" class="login-btn">
          <q-icon name="mdi-login" size="20px" class="q-mr-sm" />
          {{ $t('login.action') }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginPage'
})
</script>

<style scoped>
.content-container {
  max-width: 480px;
  margin: 0 auto;
  padding: 80px 24px;
  text-align: center;
}

.page-header {
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-title {
  font-size: 36px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
}

.logo-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.info-section {
  padding: 24px;
  margin-bottom: 32px;
}

.info-text {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.login-section {
  display: flex;
  justify-content: center;
}

.login-btn {
  display: inline-flex;
  align-items: center;
  padding: 14px 32px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.3);
  border-radius: 14px;
  color: #00ffc2;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background: rgba(0, 255, 194, 0.2);
  border-color: rgba(0, 255, 194, 0.5);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .content-container {
    padding: 60px 16px;
  }

  .logo-title {
    font-size: 28px;
  }
}
</style>
