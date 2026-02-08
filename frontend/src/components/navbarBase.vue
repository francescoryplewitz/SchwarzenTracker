<template>
  <nav class="bottom-nav">
    <button v-for="item in menuItems" :key="item.name" class="nav-item" :class="{ active: isActive(item) }"
      @click="navigate(item.route)">
      <q-icon :name="item.icon" size="22px" />
      <span class="nav-label">{{ $t(item.labelKey) }}</span>
    </button>
    <q-btn class="nav-item nav-user" flat dense stack no-caps icon="mdi-account-circle-outline" :label="$t('nav.user')">
      <q-menu anchor="top middle" self="bottom middle" class="user-menu">
        <q-list class="user-menu-list">
          <q-item clickable v-close-popup @click="changeLocale('en')">
            <q-item-section avatar>
              <q-icon name="mdi-translate" size="18px" />
            </q-item-section>
            <q-item-section>{{ $t('locale.en') }}</q-item-section>
            <q-item-section side>
              <q-icon v-if="locale === 'en'" name="mdi-check" size="16px" />
            </q-item-section>
          </q-item>
          <q-item clickable v-close-popup @click="changeLocale('de')">
            <q-item-section avatar>
              <q-icon name="mdi-translate" size="18px" />
            </q-item-section>
            <q-item-section>{{ $t('locale.de') }}</q-item-section>
            <q-item-section side>
              <q-icon v-if="locale === 'de'" name="mdi-check" size="16px" />
            </q-item-section>
          </q-item>
          <q-separator />
          <q-item clickable v-close-popup @click="logout">
            <q-item-section avatar>
              <q-icon name="mdi-logout" size="18px" />
            </q-item-section>
            <q-item-section>{{ $t('header.logout') }}</q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </q-btn>
  </nav>
</template>

<script>
import { defineComponent } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { LocalStorage } from 'quasar'
import { useI18n } from 'vue-i18n'
import { api } from 'boot/axios'
import { setLocale } from 'src/i18n'

export default defineComponent({
  name: 'NavbarBottom',

  setup() {
    const router = useRouter()
    const route = useRoute()
    const { locale } = useI18n({ useScope: 'global' })

    const menuItems = [
      { name: 'progress', labelKey: 'nav.progress', route: '/progress', icon: 'mdi-information-outline' },
      { name: 'exercises', labelKey: 'nav.exercises', route: '/exercises', icon: 'mdi-dumbbell' },
      { name: 'plans', labelKey: 'nav.plans', route: '/plans', icon: 'mdi-clipboard-text-outline' },
      { name: 'workouts', labelKey: 'nav.workouts', route: '/workouts', icon: 'mdi-play-circle-outline' }
    ]

    const isActive = (item) => {
      if (item.route === '/') return route.path === '/'
      return route.path.startsWith(item.route)
    }

    const navigate = (path) => {
      if (route.path !== path) {
        router.push(path)
      }
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

    return {
      menuItems,
      isActive,
      navigate,
      logout,
      locale,
      changeLocale
    }
  }
})
</script>

<style scoped>
.bottom-nav {
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  height: 64px;
  padding: 8px 16px;
  padding-bottom: max(8px, env(safe-area-inset-bottom));
}

.nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 12px;
  padding: 8px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.nav-item.active {
  color: #00ffc2;
}

.nav-item.active:hover {
  background: rgba(0, 255, 194, 0.05);
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
.nav-user {
  flex: 1;
}

.user-menu {
  background: transparent;
}

.user-menu-list {
  min-width: 180px;
  background: rgba(6, 18, 25, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 6px;
}

.user-menu-list .q-item {
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.75);
}

.user-menu-list .q-item:hover {
  background: rgba(255, 255, 255, 0.05);
}
</style>
