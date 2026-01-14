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

  // Exercises module
  {
    path: '/exercises',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'exercises',
        component: () => import('pages/exercises/indexPage.vue')
      },
      {
        path: ':id',
        name: 'exercise-detail',
        component: () => import('pages/exercises/detailPage.vue')
      }
    ]
  },

  // Dashboard
  {
    path: '/dashboard',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/dashboard/indexPage.vue')
      }
    ]
  },

  // Plans
  {
    path: '/plans',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'plans',
        component: () => import('pages/plans/indexPage.vue')
      },
      {
        path: ':id',
        name: 'plan-detail',
        component: () => import('pages/plans/detailPage.vue')
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
