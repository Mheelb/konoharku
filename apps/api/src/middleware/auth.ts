import { createMiddleware } from 'hono/factory'
import { supabase } from '../lib/supabase'
import type { Variables } from '../index'

export const authMiddleware = createMiddleware<{ Variables: Variables }>(async (c, next) => {
  const token = c.req.header('Authorization')?.replace('Bearer ', '')
  if (!token) return c.json({ error: 'Unauthorized' }, 401)

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return c.json({ error: 'Unauthorized' }, 401)

  c.set('user', user)
  await next()
})
