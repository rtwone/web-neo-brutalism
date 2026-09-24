import { hasAdminSession } from '../../lib/admin.js'
import { getSupabase } from '../../lib/db.js'
import { defaultContent, sanitizeSiteContent } from '../../src/content.js'

type Request = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown }
type Response = { status: (status: number) => Response; json: (body: object) => void }

const isSessionValid = (request: Request) => {
    const cookie = request.headers?.cookie
    return hasAdminSession(Array.isArray(cookie) ? cookie[0] : cookie)
}

const ensurePortfolioSeed = async () => {
    const supabase = getSupabase()
    const seed = sanitizeSiteContent(defaultContent)
    const { data, error } = await supabase.from('site_content').select('id').eq('id', 'portfolio').maybeSingle()

    if (error) throw error
    if (data) return seed

    const { error: insertError } = await supabase.from('site_content').upsert({ id: 'portfolio', content: seed }, { onConflict: 'id' })
    if (insertError) throw insertError
    return seed
}

export default async function handler(request: Request, response: Response) {
    if (request.method === 'GET') {
        try {
            const { data, error } = await getSupabase().from('site_content').select('content').eq('id', 'portfolio').maybeSingle()
            if (error) return response.status(500).json({ error: 'Unable to load content' })
            const seeded = data?.content ? sanitizeSiteContent(data.content as Record<string, unknown>) : await ensurePortfolioSeed()
            return response.status(200).json({ content: seeded })
        } catch {
            return response.status(500).json({ error: 'Unable to initialize portfolio content' })
        }
    }

    if (request.method !== 'PUT') return response.status(405).json({ error: 'Method not allowed' })
    if (!isSessionValid(request)) return response.status(401).json({ error: 'Authentication required' })
    if (!request.body || typeof request.body !== 'object') return response.status(400).json({ error: 'Invalid content' })

    try {
        const sanitized = sanitizeSiteContent(request.body as Record<string, unknown>)
        const { error } = await getSupabase().from('site_content').upsert({ id: 'portfolio', content: sanitized }, { onConflict: 'id' })
        if (error) throw error
        return response.status(200).json({ success: true, content: sanitized })
    } catch {
        return response.status(500).json({ error: 'Unable to save content' })
    }
}