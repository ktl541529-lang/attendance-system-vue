import { useAuthStore } from '../stores/auth.js'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    component: () => import('../views/LoginView.vue')
  },
  {
    path: '/dashboard',
    component: () => import('../views/DashboardView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/my-requests',
    component: () => import('../views/MyRequestsView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/review',
    component: () => import('../views/ReviewView.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/all-records',
    component: () => import('../views/AllRecordsView.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/users',
    component: () => import('../views/UsersView.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/logs',
    component: () => import('../views/LogsView.vue'),
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
  path: '/my-logs',
  component: () => import('../views/MyLogsView.vue'),
  meta: { requiresAuth: true }
},
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) return '/login'
  if (to.meta.adminOnly && !auth.isAdmin) return '/dashboard'
})

export default router