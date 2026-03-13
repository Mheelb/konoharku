import { createMiddleware } from 'hono/factory'
import { hasRole, type Role } from '@konoharku/types'
import type { Variables } from '../index'

export const requireRole = (required: Role) =>
  createMiddleware<{ Variables: Variables }>(async (c, next) => {
    const user = c.get('user')
    const role = (user.app_metadata?.role as Role) ?? 'user'

    if (!hasRole(role, required)) {
      return c.json({ error: 'Forbidden' }, 403)
    }

    await next()
  })
