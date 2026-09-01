import react from '@vitejs/plugin-react'
import { loadEnv, type Plugin, defineConfig } from 'vite'
import handler from './api/contact.js'
import type { VercelRequest, VercelResponse } from './api/contact.js'
import statsHandler from './api/stats.js'
import type { VercelRequest as StatsRequest, VercelResponse as StatsResponse } from './api/stats.js'
import spinViewHandler from './api/spin-view.js'
import type { VercelRequest as SpinRequest, VercelResponse as SpinResponse } from './api/spin-view.js'

function loadRuntimeEnv() {
  const environment = loadEnv('', process.cwd(), '')
  Object.assign(process.env, environment)
}

function contactApi(): Plugin {
  return {
    name: 'local-contact-api',
    configureServer(server) {
      loadRuntimeEnv()

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

function statsApi(): Plugin {
  return {
    name: 'local-stats-api',
    configureServer(server) {
      loadRuntimeEnv()

      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url || '/', 'http://localhost')
        const action = url.pathname === '/api/stats/like'
          ? 'like'
          : url.pathname === '/api/stats/view'
            ? 'view'
            : url.pathname === '/api/stats'
              ? undefined
              : null
        if (action === null) {
          next()
          return
        }

        const query: Record<string, string> = { page: url.searchParams.get('page') || '/' }
        if (action) query.action = action
        const apiResponse: StatsResponse = {
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

        statsHandler({
          method: request.method,
          headers: request.headers as Record<string, string | string[] | undefined>,
          query,
        } satisfies StatsRequest, apiResponse)
          .catch(() => {
            response.statusCode = 500
            response.end(JSON.stringify({ success: false, error: 'Stats service unavailable' }))
          })
      })
    },
  }
}

function spinViewApi(): Plugin {
  return {
    name: 'local-spin-view-api',
    configureServer(server) {
      server.middlewares.use('/spin-view', (request, response, next) => {
        if (request.method !== 'POST') { next(); return }
        const apiResponse: SpinResponse = {
          status: (status: number) => { response.statusCode = status; return apiResponse },
          setHeader: (name: string, value: string) => response.setHeader(name, value),
          end: (body?: string | Buffer) => response.end(body),
        }
        spinViewHandler({ method: request.method, headers: request.headers, pipe: (stream) => request.pipe(stream) } satisfies SpinRequest, apiResponse)
          .catch(() => { if (!response.writableEnded) { response.statusCode = 500; response.end(JSON.stringify({ error: 'Media gagal diproses.' })) } })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), contactApi(), statsApi(), spinViewApi()],
})
