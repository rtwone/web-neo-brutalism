type Request = { method?: string }
type Response = { status: (status: number) => Response; setHeader: (name: string, value: string) => Response; json: (body: object) => void }
import { isSameOriginRequest } from '../../lib/csrf.js'

export default function handler(request: Request & { headers?: Record<string, string | string[] | undefined> }, response: Response) {
    if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
    if (!isSameOriginRequest(request.headers)) return response.status(403).json({ error: 'Invalid request origin' })
    response.setHeader('Set-Cookie', 'admin_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0')
    return response.status(200).json({ success: true })
}
