import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '@/composables/useSupabase'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/Home.vue'),
      meta: { requiresAuth: true },
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
