import { defineRouter } from '#q-app/wrappers'
import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import { LocalStorage } from 'quasar'
import { api } from 'boot/axios'
import routes from './routes'

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory)

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  if (process.env.NODE_ENV === 'production') {
    Router.beforeEach(async (to, from, next) => {
      if (to.meta.public || to.path === '/dev') return next()
      const user = LocalStorage.getItem('user')
      if (user) return next()

      const result = await api.get('/user/current', { withCredentials: true }).catch(() => null)
      if (result) {
        LocalStorage.set('user', result.data)
        return next()
      }
      next('/login')
    })
  }

  return Router
})
