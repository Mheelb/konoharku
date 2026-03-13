import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/layouts/DefaultLayout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          component: () => import('@/pages/Home.vue'),
        },
        // Ajoute tes futures pages ici, elles auront toutes la navbar
        // { path: 'builds', component: () => import('@/pages/Builds.vue') },
        // { path: 'stocks', component: () => import('@/pages/Stocks.vue') },
        // { path: 'actualites', component: () => import('@/pages/Actualites.vue') },
        // { path: 'objectifs', component: () => import('@/pages/Objectifs.vue') },
      ],
    },
    {
      path: '/auth',
      component: () => import('@/pages/Auth.vue'),
      meta: { requiresGuest: true },
    },
  ],
})

router.beforeEach(async (to) => {
  const { data: { session } } = await supabase.auth.getSession()
  if (to.meta.requiresAuth && !session) return '/auth'
  if (to.meta.requiresGuest && session) return '/'
})

export default router
