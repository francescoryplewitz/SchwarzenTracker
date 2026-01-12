<template>
  <div class="dashboard-page dark-page" data-test="dashboard-page">
    <div class="content-container">
      <header class="page-header">
        <div class="header-icon accent-box">
          <q-icon name="mdi-view-dashboard-outline" size="32px" />
        </div>
        <div class="header-text">
          <h1 class="page-title" data-test="page-title">Dashboard</h1>
          <p class="page-subtitle">Deine Trainingsübersicht</p>
        </div>
      </header>

      <div class="placeholder-card glass-card" data-test="placeholder-card">
        <span class="placeholder-label" data-test="coming-soon-label">Coming Soon</span>
        <p class="placeholder-text">Das Dashboard wird später implementiert.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'DashboardIndexPage'
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  padding-bottom: 24px;
}

.content-container {
  max-width: 720px;
  margin: 0 auto;
  padding: 24px 16px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header-icon {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-text {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  color: white;
  margin: 0 0 4px;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

.placeholder-card {
  padding: 32px;
  text-align: center;
}

.placeholder-label {
  display: inline-block;
  padding: 6px 12px;
  background: rgba(0, 255, 194, 0.1);
  border: 1px solid rgba(0, 255, 194, 0.2);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: #00ffc2;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 16px;
}

.placeholder-text {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

@media (max-width: 480px) {
  .content-container {
    padding: 16px 12px;
  }

  .page-header {
    gap: 12px;
  }

  .header-icon {
    width: 48px;
    height: 48px;
  }

  .page-title {
    font-size: 20px;
  }
}
</style>
