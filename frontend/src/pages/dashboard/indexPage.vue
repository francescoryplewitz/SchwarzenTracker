<template>
  <div class="dashboard-page dark-page" data-test="dashboard-page">
    <div class="content-container">
      <header class="welcome-section">
        <div class="logo-wrapper">
          <div class="logo-glow"></div>
          <div class="logo-container">
            <img :src="logoUrl" alt="SchwarzenTracker" class="app-logo" />
          </div>
        </div>
        <h1 class="app-name">SchwarzenTracker</h1>
        <p class="welcome-text">{{ $t('dashboard.subtitle') }}</p>
      </header>

      <div class="quick-actions">
        <button class="action-card glass-card" data-test="start-workout-btn" @click="$router.push('/workouts')">
          <div class="action-icon workout-icon">
            <q-icon name="mdi-play-circle" size="28px" />
          </div>
          <div class="action-content">
            <span class="action-title">{{ $t('dashboard.actions.startWorkout') }}</span>
            <span class="action-desc">{{ $t('dashboard.actions.startWorkoutDesc') }}</span>
          </div>
          <q-icon name="mdi-chevron-right" size="20px" class="action-arrow" />
        </button>

        <button class="action-card glass-card" data-test="progress-btn" @click="$router.push('/progress')">
          <div class="action-icon progress-icon">
            <q-icon name="mdi-information-outline" size="28px" />
          </div>
          <div class="action-content">
            <span class="action-title">{{ $t('dashboard.actions.progress') }}</span>
            <span class="action-desc">{{ $t('dashboard.actions.progressDesc') }}</span>
          </div>
          <q-icon name="mdi-chevron-right" size="20px" class="action-arrow" />
        </button>

        <button class="action-card glass-card" data-test="plans-btn" @click="$router.push('/plans')">
          <div class="action-icon plans-icon">
            <q-icon name="mdi-clipboard-text-outline" size="28px" />
          </div>
          <div class="action-content">
            <span class="action-title">{{ $t('dashboard.actions.plans') }}</span>
            <span class="action-desc">{{ $t('dashboard.actions.plansDesc') }}</span>
          </div>
          <q-icon name="mdi-chevron-right" size="20px" class="action-arrow" />
        </button>

        <button class="action-card glass-card" data-test="exercises-btn" @click="$router.push('/exercises')">
          <div class="action-icon exercises-icon">
            <q-icon name="mdi-dumbbell" size="28px" />
          </div>
          <div class="action-content">
            <span class="action-title">{{ $t('dashboard.actions.exercises') }}</span>
            <span class="action-desc">{{ $t('dashboard.actions.exercisesDesc') }}</span>
          </div>
          <q-icon name="mdi-chevron-right" size="20px" class="action-arrow" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import logoUrl from '../../static/app-logo.png'

export default defineComponent({
  name: 'DashboardIndexPage',

  setup() {
    return { logoUrl }
  }
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

.welcome-section {
  text-align: center;
  margin-bottom: 32px;
  padding-top: 16px;
}

.logo-wrapper {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 20px;
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, rgba(0, 255, 194, 0.4) 0%, rgba(0, 255, 194, 0.1) 40%, transparent 70%);
  border-radius: 50%;
  filter: blur(30px);
}

.logo-container {
  position: relative;
  width: 220px;
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  z-index: 1;
}

.app-logo {
  width: 220px;
  height: 220px;
  object-fit: contain;
}

.app-name {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #00ffc2 0%, #00e6af 50%, #00ffc2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 8px;
  text-shadow: 0 0 40px rgba(0, 255, 194, 0.5);
}

.welcome-text {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  letter-spacing: 0.02em;
}
  
  .quick-actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .action-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px;
    cursor: pointer;
    border: none;
    text-align: left;
    width: 100%;
    transition: all 0.2s ease;
  }
  
  .action-card:hover {
    transform: translateY(-2px);
    border-color: rgba(0, 255, 194, 0.25);
  }
  
  .action-card:hover .action-arrow {
    color: #00ffc2;
    transform: translateX(4px);
  }
  
  .action-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  
  .workout-icon {
    background: rgba(0, 255, 194, 0.12);
    color: #00ffc2;
  }
  
  .plans-icon {
    background: rgba(33, 150, 243, 0.12);
    color: #2196f3;
  }

  .progress-icon {
    background: rgba(255, 255, 255, 0.12);
    color: rgba(255, 255, 255, 0.88);
  }
  
  .exercises-icon {
    background: rgba(255, 193, 7, 0.12);
    color: #ffc107;
  }
  
  .action-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .action-title {
    font-size: 16px;
    font-weight: 600;
    color: white;
  }
  
  .action-desc {
    font-size: 13px;
    color: rgba(255, 255, 255, 0.4);
  }
  
  .action-arrow {
    color: rgba(255, 255, 255, 0.25);
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  
  @media (max-width: 480px) {
  .content-container {
    padding: 16px 12px;
  }

  .logo-wrapper {
    width: 180px;
    height: 180px;
  }

  .logo-glow {
    width: 140px;
    height: 140px;
  }

  .logo-container {
    width: 180px;
    height: 180px;
  }

  .app-logo {
    width: 180px;
    height: 180px;
  }

  .app-name {
    font-size: 28px;
  }

  .action-icon {
    width: 46px;
    height: 46px;
  }
}
</style>
