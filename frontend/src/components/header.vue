<template>
  <div class="app-header-content">
    <div class="header-left">
      <div class="logo-container" @click="router.push('/')">
        <img v-if="logoUrl" :src="logoUrl" alt="Logo" class="header-logo" />
        <span v-else class="logo-text">ST</span>
      </div>

      <nav v-if="!isMobile" class="desktop-nav">
        <button
          v-for="item in menuItems"
          :key="item.name"
          class="nav-btn"
          :class="{ active: isActive(item) }"
          @click="navigate(item.route)"
        >
          {{ $t(item.labelKey) }}
        </button>
      </nav>
    </div>

    <div class="header-right">
      <div v-if="stage !== 'production' && environment" class="env-badge">
        {{ environment }}
      </div>
      <div class="locale-toggle">
        <button class="locale-btn" :class="{ active: locale === 'en' }" @click="changeLocale('en')">
          EN
          <q-tooltip>{{ $t('locale.en') }}</q-tooltip>
        </button>
        <button class="locale-btn" :class="{ active: locale === 'de' }" @click="changeLocale('de')">
          DE
          <q-tooltip>{{ $t('locale.de') }}</q-tooltip>
        </button>
      </div>
      <button class="logout-btn" @click="logout">
        <q-icon name="mdi-logout" size="18px" />
        <q-tooltip>{{ $t('header.logout') }}</q-tooltip>
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { api } from 'boot/axios'
import { LocalStorage } from 'quasar'
import { useI18n } from 'vue-i18n'
import { setLocale } from 'src/i18n'

export default defineComponent({
  name: 'HeaderComponent',

  props: {
    isMobile: { type: Boolean, default: false }
  },

  setup() {
    const environment = ref('')
    const stage = ref('')
    const router = useRouter()
    const route = useRoute()
    const logoUrl = ref(null)
    const { locale } = useI18n({ useScope: 'global' })

    const menuItems = [
      { name: 'progress', labelKey: 'nav.progress', route: '/progress' },
      { name: 'exercises', labelKey: 'nav.exercises', route: '/exercises' },
      { name: 'plans', labelKey: 'nav.plans', route: '/plans' }
    ]

    const isActive = (item) => {
      return route.path.includes(item.route)
    }

    const navigate = (path) => {
      if (route.path !== path) {
        router.push(path)
      }
    }

    async function fetchEnvironment() {
      const result = await api({
        url: '/version',
        method: 'GET',
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
      window.open('/logout', '_self')
    }

    const changeLocale = async (nextLocale) => {
      const { data } = await api.patch('/user/locale', { locale: nextLocale })
      LocalStorage.set('user', data)
      setLocale(nextLocale)
    }

    onMounted(() => {
      fetchEnvironment()
    })

    return {
      logout,
      environment,
      stage,
      router,
      logoUrl,
      menuItems,
      isActive,
      navigate,
      locale,
      changeLocale
    }
  }
})
</script>

<style scoped>
.app-header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 16px;
  max-width: 1200px;
  margin: 0 auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.logo-container:hover {
  opacity: 0.8;
}

.header-logo {
  height: 32px;
  width: auto;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #00ffc2;
  font-family: 'SF Mono', 'Fira Code', monospace;
}

.desktop-nav {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-btn {
  padding: 8px 16px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.9);
}

.nav-btn.active {
  background: rgba(0, 255, 194, 0.1);
  border-color: rgba(0, 255, 194, 0.2);
  color: #00ffc2;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.locale-toggle {
  display: flex;
  align-items: center;
  gap: 6px;
}

.locale-btn {
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.locale-btn.active {
  border-color: rgba(0, 255, 194, 0.5);
  color: #00ffc2;
  background: rgba(0, 255, 194, 0.12);
}

.locale-btn:hover {
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
}

.env-badge {
  padding: 4px 10px;
  background: rgba(240, 101, 117, 0.15);
  border: 1px solid rgba(240, 101, 117, 0.3);
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #f06575;
  text-transform: uppercase;
}

.logout-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.15);
  color: white;
}

@media (max-width: 640px) {
  .app-header-content {
    padding: 0 12px;
  }
}
</style>
