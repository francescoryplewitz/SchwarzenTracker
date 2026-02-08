const routes = [
  // Dev config page - standalone without layout
  {
    path: '/dev',
    component: () => import('pages/DevConfigPage.vue')
  },

  // Login / Landing page
  {
    path: '/login',
    component: () => import('pages/loginPage.vue'),
    meta: { public: true }
  },

  // Dashboard (Home)
  {
    path: '/',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('pages/dashboard/indexPage.vue')
      }
    ]
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

  // Workouts
  {
    path: '/workouts',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'workouts',
        component: () => import('pages/workouts/indexPage.vue')
      },
      {
        path: ':id',
        name: 'workout-active',
        component: () => import('pages/workouts/activePage.vue')
      }
    ]
  },

  // Progress
  {
    path: '/progress',
    component: () => import('layouts/baseLayout.vue'),
    children: [
      {
        path: '',
        name: 'progress',
        component: () => import('pages/progress/indexPage.vue')
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
