const routes = [
  // Start page - standalone without layout
  {
    path: '/',
    component: () => import('pages/IndexPage.vue')
  },

  // Dev config page - standalone without layout
  {
    path: '/dev',
    component: () => import('pages/DevConfigPage.vue')
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
