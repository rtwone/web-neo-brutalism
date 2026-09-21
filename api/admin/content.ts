import { hasAdminSession } from '../../lib/admin.js'
import { getSupabase } from '../../lib/db.js'

type Request = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown }
type Response = { status: (status: number) => Response; json: (body: object) => void }

const isSessionValid = (request: Request) => {
    const cookie = request.headers?.cookie
    return hasAdminSession(Array.isArray(cookie) ? cookie[0] : cookie)
}

export default async function handler(request: Request, response: Response) {
    if (request.method === 'GET') {
        const { data, error } = await getSupabase().from('site_content').select('content').eq('id', 'portfolio').maybeSingle()
        if (error) return response.status(500).json({ error: 'Unable to load content' })
        return response.status(200).json({ content: data?.content || null })
    }

    if (request.method !== 'PUT') return response.status(405).json({ error: 'Method not allowed' })
    if (!isSessionValid(request)) return response.status(401).json({ error: 'Authentication required' })
    if (!request.body || typeof request.body !== 'object') return response.status(400).json({ error: 'Invalid content' })

    const { error } = await getSupabase().from('site_content').upsert({ id: 'portfolio', content: request.body }, { onConflict: 'id' })
    if (error) return response.status(500).json({ error: 'Unable to save content' })
    return response.status(200).json({ success: true, content: request.body })
}