import { serve } from '@hono/node-server'
import { buildApp } from './build-app.ts'

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: buildApp().fetch, port }, () => {
  console.log(`Studio Riff API on http://localhost:${port} (open it in a browser to try the API)`)
})
