import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin, defineConfig } from 'vite'
import handler from './api/contact.js'
import type { VercelRequest, VercelResponse } from './api/contact.js'

function contactApi(): Plugin {
  return {
    name: 'local-contact-api',
    configureServer(server) {
      const environment = loadEnv('', process.cwd(), '')
      Object.assign(process.env, environment)

      server.middlewares.use('/api/contact', (request, response, next) => {
        if (request.method !== 'POST') {
          next()
          return
        }

        const chunks: Buffer[] = []
        request.on('data', (chunk: Buffer) => chunks.push(chunk))
        request.on('end', async () => {
          try {
            const body = JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
            const apiResponse: VercelResponse = {
              status: (status: number) => {
                response.statusCode = status
                return apiResponse
              },
              json: (body: object) => {
                response.setHeader('Content-Type', 'application/json')
                response.end(JSON.stringify(body))
              },
              setHeader: (name: string, value: string) => response.setHeader(name, value),
            }

            await handler({ method: request.method, body } satisfies VercelRequest, apiResponse)
          } catch {
            response.statusCode = 400
            response.end(JSON.stringify({ error: 'Invalid request body' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contactApi()],
})
