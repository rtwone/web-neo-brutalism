import { adminCookie, createAdminToken, hasAdminSession, isAdminPasswordValid } from '../../lib/admin.js'
import { checkRateLimit } from '../../lib/rate-limit.js'
import { getRequestSignals } from '../../lib/visitor.js'
import { isSameOriginRequest } from '../../lib/csrf.js'

type Request = { method?: string; body?: Record<string, unknown>; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (status: number) => Response; setHeader: (name: string, value: string) => void; json: (body: object) => void }

export default function handler(request: Request, response: Response) {
    if (request.method === 'GET') {
        const cookie = request.headers?.cookie
        const authenticated = hasAdminSession(Array.isArray(cookie) ? cookie[0] : cookie)
        return response.status(200).json({ authenticated })
    }
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
    if (!isSameOriginRequest(request.headers)) return response.status(403).json({ error: 'Invalid request origin' })
    const { ip } = getRequestSignals(request)
    const ipLimit = checkRateLimit(`admin-login:${ip}`, 'ADMIN_LOGIN_RATE_LIMIT', 'ADMIN_LOGIN_RATE_WINDOW', 5, 60)
    const accountLimit = checkRateLimit('admin-login:account', 'ADMIN_LOGIN_ACCOUNT_RATE_LIMIT', 'ADMIN_LOGIN_ACCOUNT_RATE_WINDOW', 20, 60)
    if (!ipLimit.allowed || !accountLimit.allowed) {
        response.setHeader('Retry-After', String(Math.max(ipLimit.retryAfter, accountLimit.retryAfter)))
        return response.status(429).json({ error: 'Too many login attempts' })
    }
    if (!isAdminPasswordValid(request.body?.password)) return response.status(401).json({ error: 'Invalid credentials' })
    response.setHeader('Set-Cookie', adminCookie(createAdminToken()))
    return response.status(200).json({ success: true })
}