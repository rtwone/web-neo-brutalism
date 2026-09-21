import { adminCookie, createAdminToken, hasAdminSession, isAdminPasswordValid } from '../../lib/admin.js'

type Request = { method?: string; body?: Record<string, unknown>; headers?: Record<string, string | string[] | undefined> }
type Response = { status: (status: number) => Response; setHeader: (name: string, value: string) => void; json: (body: object) => void }

export default function handler(request: Request, response: Response) {
    if (request.method === 'GET') {
        const cookie = request.headers?.cookie
        const authenticated = hasAdminSession(Array.isArray(cookie) ? cookie[0] : cookie)
        return response.status(200).json({ authenticated })
    }
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
    console.log('DEBUG admin login', {
        envPassword: process.env.ADMIN_PASSWORD,
        providedPassword: request.body?.password,
        matches: process.env.ADMIN_PASSWORD === request.body?.password,
    })
    if (!isAdminPasswordValid(request.body?.password)) return response.status(401).json({ error: 'Invalid credentials' })
    response.setHeader('Set-Cookie', adminCookie(createAdminToken()))
    return response.status(200).json({ success: true })
}