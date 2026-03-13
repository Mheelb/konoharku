import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.json({ message: 'Hello from API' }))

Bun.serve({
  port: 3000,
  fetch: app.fetch
})

console.log('API running on http://localhost:3000')