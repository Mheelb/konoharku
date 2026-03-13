import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { authMiddleware } from './middleware/auth'
import authRoutes from './routes/auth'
import type { User } from '@supabase/supabase-js'

export type Variables = {
  user: User
}

const app = new Hono<{ Variables: Variables }>()

app.use('*', cors({ origin: [process.env.FRONTEND_URL ?? 'http://localhost:5173', 'http://localhost:5174'] }))

app.get('/public', (c) => c.json({ message: 'route publique' }))

app.route('/auth', authRoutes)

app.use('/private/*', authMiddleware)
app.get('/private/me', (c) => c.json({ user: c.get('user') }))

Bun.serve({ port: 3000, fetch: app.fetch })
console.log('API running on http://localhost:3000')
