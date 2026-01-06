<template>
  <div class="dev-config-page">
    <div class="background-gradient"></div>

    <div class="content-container">
      <header class="page-header">
        <div class="header-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" stroke-width="1.5"/>
            <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2327 9.63587 19.6339 9 19.4C8.38291 19.1277 7.66219 19.2583 7.18 19.73L7.12 19.79C6.74486 20.1656 6.23582 20.3766 5.705 20.3766C5.17418 20.3766 4.66514 20.1656 4.29 19.79C3.91445 19.4149 3.70343 18.9058 3.70343 18.375C3.70343 17.8442 3.91445 17.3351 4.29 16.96L4.35 16.9C4.82167 16.4178 4.95231 15.6971 4.68 15.08C4.42093 14.4755 3.82764 14.0826 3.17 14.08H3C1.89543 14.08 1 13.1846 1 12.08C1 10.9754 1.89543 10.08 3 10.08H3.09C3.76733 10.0642 4.36613 9.63587 4.6 9C4.87231 8.38291 4.74167 7.66219 4.27 7.18L4.21 7.12C3.83445 6.74486 3.62343 6.23582 3.62343 5.705C3.62343 5.17418 3.83445 4.66514 4.21 4.29C4.58514 3.91445 5.09418 3.70343 5.625 3.70343C6.15582 3.70343 6.66486 3.91445 7.04 4.29L7.1 4.35C7.58219 4.82167 8.30291 4.95231 8.92 4.68H9C9.60447 4.42093 9.99738 3.82764 10 3.17V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83445 17.7642 3.62343 18.295 3.62343C18.8258 3.62343 19.3349 3.83445 19.71 4.21C20.0856 4.58514 20.2966 5.09418 20.2966 5.625C20.2966 6.15582 20.0856 6.66486 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" stroke-width="1.5"/>
          </svg>
        </div>
        <h1 class="page-title">Developer Mode</h1>
        <p class="page-subtitle">Configure authentication for local development</p>
      </header>

      <div class="cards-container">
        <div class="glass-card user-card">
          <div class="card-header">
            <span class="card-label">Identity</span>
            <span class="status-indicator" :class="{ 'saving': saving }">
              <span class="status-dot"></span>
              {{ saving ? 'Saving...' : 'Auto-save' }}
            </span>
          </div>

          <div class="user-select-wrapper">
            <q-select
              v-model="selectedUser"
              :options="users"
              :option-label="formatUserLabel"
              option-value="id"
              borderless
              emit-value
              map-options
              :loading="loadingUsers"
              popup-content-class="user-dropdown"
              class="user-select"
              @update:model-value="onConfigChange"
            >
              <template v-slot:selected-item="scope">
                <div class="selected-user" v-if="scope.opt">
                  <div class="user-avatar">
                    {{ getInitials(scope.opt) }}
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ formatName(scope.opt) }}</div>
                    <div class="user-email">{{ scope.opt.email || 'No email' }}</div>
                  </div>
                </div>
              </template>
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps" class="user-option">
                  <div class="user-avatar small">
                    {{ getInitials(scope.opt) }}
                  </div>
                  <div class="user-info">
                    <div class="user-name">{{ formatName(scope.opt) }}</div>
                    <div class="user-email">{{ scope.opt.email || 'No email' }}</div>
                  </div>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>

        <div class="glass-card roles-card">
          <div class="card-header">
            <span class="card-label">Permissions</span>
          </div>

          <div class="roles-grid">
            <div
              v-for="role in availableRoles"
              :key="role.id"
              class="role-chip"
              :class="{ 'active': selectedRoles.includes(role.id) }"
              @click="toggleRole(role.id)"
            >
              <div class="role-icon" v-html="role.icon"></div>
              <div class="role-info">
                <span class="role-name">{{ role.name }}</span>
                <span class="role-desc">{{ role.description }}</span>
              </div>
              <div class="role-toggle">
                <div class="toggle-track">
                  <div class="toggle-thumb"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="current-session glass-card">
        <div class="session-label">Active Session</div>
        <div class="session-details">
          <div class="session-item">
            <span class="session-key">User ID</span>
            <span class="session-value">{{ currentConfig.userId || '—' }}</span>
          </div>
          <div class="session-divider"></div>
          <div class="session-item">
            <span class="session-key">Roles</span>
            <span class="session-value roles-value">
              <span v-if="currentConfig.roles?.length" class="role-badges">
                <span v-for="role in currentConfig.roles" :key="role" class="role-badge">{{ role }}</span>
              </span>
              <span v-else class="no-roles">No roles assigned</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue'
import { api } from 'boot/axios'

export default defineComponent({
  name: 'DevConfigPage',
  setup() {
    const users = ref([])
    const selectedUser = ref(1)
    const selectedRoles = ref([])
    const currentConfig = ref({ userId: 1, roles: [] })
    const loadingUsers = ref(false)
    const saving = ref(false)

    const availableRoles = [
      {
        id: 'admin',
        name: 'Admin',
        description: 'Full system access',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>'
      },
      {
        id: 'editor',
        name: 'Editor',
        description: 'Create and modify content',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
      },
      {
        id: 'viewer',
        name: 'Viewer',
        description: 'Read-only access',
        icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>'
      }
    ]

    const getInitials = (user) => {
      if (!user) return '?'
      const first = user.firstName?.[0] || ''
      const last = user.lastName?.[0] || ''
      return (first + last).toUpperCase() || user.id?.toString() || '?'
    }

    const formatName = (user) => {
      if (!user) return 'Unknown'
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ')
      return name || `User ${user.id}`
    }

    const formatUserLabel = (user) => {
      if (!user) return ''
      return formatName(user)
    }

    const loadUsers = async () => {
      loadingUsers.value = true
      try {
        const response = await api.get('/dev/users', { withCredentials: true })
        users.value = response.data
      } catch (error) {
        console.error('Failed to load users:', error)
      } finally {
        loadingUsers.value = false
      }
    }

    const loadConfig = async () => {
      try {
        const response = await api.get('/dev/config', { withCredentials: true })
        currentConfig.value = response.data
        selectedUser.value = response.data.userId || 1
        selectedRoles.value = response.data.roles || []
      } catch (error) {
        console.error('Failed to load config:', error)
      }
    }

    const saveConfig = async () => {
      saving.value = true
      try {
        const response = await api.post('/dev/config', {
          userId: selectedUser.value,
          roles: selectedRoles.value
        }, { withCredentials: true })
        currentConfig.value = response.data
      } catch (error) {
        console.error('Failed to save config:', error)
      } finally {
        setTimeout(() => {
          saving.value = false
        }, 600)
      }
    }

    const toggleRole = (roleId) => {
      const index = selectedRoles.value.indexOf(roleId)
      if (index === -1) {
        selectedRoles.value.push(roleId)
      } else {
        selectedRoles.value.splice(index, 1)
      }
      onConfigChange()
    }

    const onConfigChange = () => {
      saveConfig()
    }

    onMounted(async () => {
      await Promise.all([loadUsers(), loadConfig()])
    })

    return {
      users,
      selectedUser,
      selectedRoles,
      currentConfig,
      loadingUsers,
      saving,
      availableRoles,
      getInitials,
      formatName,
      formatUserLabel,
      toggleRole,
      onConfigChange
    }
  }
})
</script>

<style scoped>
.dev-config-page {
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
  width: 80px;
  height: 80px;
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

.page-title {
  font-size: 42px;
  font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.7) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 12px;
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
  margin-bottom: 20px;
}

.card-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(255, 255, 255, 0.4);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  transition: all 0.3s ease;
}

.status-indicator.saving {
  color: #00ffc2;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #00ffc2;
  box-shadow: 0 0 12px rgba(0, 255, 194, 0.5);
  transition: all 0.3s ease;
}

.status-indicator.saving .status-dot {
  background: #00ffc2;
  box-shadow: 0 0 16px rgba(0, 255, 194, 0.6);
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.7; }
}

.user-select-wrapper {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s ease;
}

.user-select-wrapper:hover {
  background: rgba(0, 255, 194, 0.05);
  border-color: rgba(0, 255, 194, 0.2);
}

.user-select {
  width: 100%;
}

.user-select :deep(.q-field__control) {
  color: white;
}

.user-select :deep(.q-field__native) {
  color: white;
}

.selected-user {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
}

.user-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #00ffc2 0%, #00b386 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  color: #040d16;
  flex-shrink: 0;
}

.user-avatar.small {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  font-size: 13px;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.user-email {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
}

.user-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.user-option:hover {
  background: rgba(0, 255, 194, 0.1);
}

.roles-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.role-chip {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.role-chip:hover {
  background: rgba(0, 255, 194, 0.05);
  border-color: rgba(0, 255, 194, 0.15);
  transform: translateY(-1px);
}

.role-chip.active {
  background: rgba(0, 255, 194, 0.1);
  border-color: rgba(0, 255, 194, 0.25);
}

.role-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
}

.role-chip.active .role-icon {
  background: linear-gradient(135deg, #00ffc2 0%, #00b386 100%);
  color: #040d16;
}

.role-info {
  flex: 1;
}

.role-name {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: white;
  margin-bottom: 2px;
}

.role-desc {
  display: block;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
}

.role-toggle {
  flex-shrink: 0;
}

.toggle-track {
  width: 44px;
  height: 26px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.1);
  position: relative;
  transition: all 0.3s ease;
}

.role-chip.active .toggle-track {
  background: linear-gradient(135deg, #00ffc2 0%, #00b386 100%);
}

.toggle-thumb {
  width: 22px;
  height: 22px;
  border-radius: 11px;
  background: white;
  position: absolute;
  top: 2px;
  left: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.role-chip.active .toggle-thumb {
  left: 20px;
}

.current-session {
  background: rgba(255, 255, 255, 0.02);
}

.session-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.3);
  margin-bottom: 16px;
}

.session-details {
  display: flex;
  align-items: center;
  gap: 24px;
}

.session-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.session-key {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.session-value {
  font-size: 15px;
  font-weight: 500;
  color: white;
}

.session-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
}

.roles-value {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badges {
  display: flex;
  gap: 6px;
}

.role-badge {
  padding: 4px 10px;
  background: rgba(0, 255, 194, 0.15);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #00ffc2;
}

.no-roles {
  color: rgba(255, 255, 255, 0.3);
  font-style: italic;
}

@media (max-width: 640px) {
  .content-container {
    padding: 40px 16px;
  }

  .page-title {
    font-size: 32px;
  }

  .session-details {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .session-divider {
    width: 100%;
    height: 1px;
  }
}
</style>

<style>
.user-dropdown {
  background: rgba(4, 13, 22, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border: 1px solid rgba(0, 255, 194, 0.15) !important;
  border-radius: 16px !important;
  overflow: hidden;
}

.user-dropdown .q-item {
  color: white;
}

.user-dropdown .q-item:hover {
  background: rgba(0, 255, 194, 0.1);
}
</style>
