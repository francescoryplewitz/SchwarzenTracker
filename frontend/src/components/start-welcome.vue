<template>
  <div class="start-page" data-test="start-page">
    <div class="background-gradient"></div>

    <div class="content-container">
      <header class="page-header">
        <div class="header-icon">
          <img :src="logoUrl" alt="Logo" class="header-logo" />
        </div>
        <h1 class="page-title" data-test="page-title">Ryplewitz Consulting</h1>
        <p class="page-subtitle" data-test="page-subtitle">Project base for new applications</p>
      </header>

      <div class="cards-container">
        <div class="glass-card info-card" data-test="info-card">
          <div class="card-header">
            <span class="card-label">Getting Started</span>
          </div>
          <div class="card-content">
            <p class="info-text">
              This is your starter template for new Express.js + Vue projects.
              Fork this repository and start developing.
            </p>
          </div>
        </div>

        <div class="glass-card dev-card" data-test="dev-card" @click="goToDev">
          <div class="card-header">
            <span class="card-label">Development</span>
            <span class="card-arrow">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
          <div class="card-content">
            <div class="dev-info">
              <div class="dev-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"/>
                  <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z"/>
                </svg>
              </div>
              <div class="dev-text">
                <span class="dev-title">/dev</span>
                <span class="dev-desc">Local auth configuration</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="glass-card stack-card" data-test="stack-card">
        <div class="stack-label">Tech Stack</div>
        <div class="stack-items">
          <div class="stack-item">
            <span class="stack-name">Vue 3</span>
          </div>
          <div class="stack-divider"></div>
          <div class="stack-item">
            <span class="stack-name">Quasar</span>
          </div>
          <div class="stack-divider"></div>
          <div class="stack-item">
            <span class="stack-name">Express.js</span>
          </div>
          <div class="stack-divider"></div>
          <div class="stack-item">
            <span class="stack-name">Prisma</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import logoUrl from '../static/logo.png'

export default defineComponent({
  name: 'StartWelcome',
  setup() {
    const router = useRouter()

    const goToDev = () => {
      router.push('/dev')
    }

    return { goToDev, logoUrl }
  }
})
</script>

<style scoped>
.start-page {
  min-height: 100vh;
  width: 100%;
  position: relative;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
}

.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(ellipse at top left, rgba(0, 255, 194, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at bottom right, rgba(0, 255, 194, 0.05) 0%, transparent 50%),
    radial-gradient(ellipse at center, rgba(0, 255, 194, 0.03) 0%, transparent 70%),
    linear-gradient(135deg, #040d16 0%, #061219 50%, #040d16 100%);
  z-index: 0;
}

.content-container {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0 auto;
  padding: 60px 24px;
}

.page-header {
  text-align: center;
  margin-bottom: 48px;
}

.header-icon {
  width: 320px;
  height: 110px;
  margin: 0 auto 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 255, 194, 0.1);
  border-radius: 24px;
  color: #00ffc2;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 255, 194, 0.2);
}

.header-logo {
  width: 300px;
  height: 300px;
  object-fit: contain;
}

.page-title {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.page-subtitle {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  font-weight: 400;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 20px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(0, 255, 194, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
}

.card-arrow {
  color: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.dev-card {
  cursor: pointer;
}

.dev-card:hover {
  transform: translateY(-2px);
  border-color: rgba(0, 255, 194, 0.25);
}

.dev-card:hover .card-arrow {
  color: #00ffc2;
  transform: translateX(4px);
}

.info-text {
  font-size: 15px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.dev-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dev-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: rgba(0, 255, 194, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #00ffc2;
  flex-shrink: 0;
}

.dev-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.dev-title {
  font-size: 16px;
  font-weight: 600;
  color: white;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.dev-desc {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.stack-card {
  background: rgba(255, 255, 255, 0.02);
}

.stack-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.stack-items {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.stack-item {
  display: flex;
  align-items: center;
}

.stack-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
}

.stack-divider {
  width: 1px;
  height: 16px;
  background: rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .content-container {
    padding: 40px 16px;
  }

  .page-title {
    font-size: 36px;
  }

  .stack-items {
    justify-content: center;
  }
}
</style>
