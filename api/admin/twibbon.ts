import { hasAdminSession } from '../../lib/admin.js'
import { getSupabase } from '../../lib/db.js'
import { defaultTwibbonConfig, sanitizeTwibbonConfig, type TwibbonConfig } from '../../src/content.js'

type Request = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown }
type Response = { status: (status: number) => Response; json: (body: object) => void }

const isSessionValid = (request: Request) => {
    const cookie = request.headers?.cookie
    return hasAdminSession(Array.isArray(cookie) ? cookie[0] : cookie)
}

export default async function handler(request: Request, response: Response) {
    try {
        const supabase = getSupabase()
        if (request.method === 'GET') {
            const { data, error } = await supabase.from('twibbon_config').select('config').eq('id', 'default').maybeSingle()
            if (error) throw error
            return response.status(200).json({ config: sanitizeTwibbonConfig((data?.config ?? defaultTwibbonConfig) as Partial<TwibbonConfig>) })
        }

        if (request.method !== 'PUT') return response.status(405).json({ error: 'Method not allowed' })
        if (!isSessionValid(request)) return response.status(401).json({ error: 'Authentication required' })
        if (!request.body || typeof request.body !== 'object') return response.status(400).json({ error: 'Invalid twibbon config' })

        const config = sanitizeTwibbonConfig(request.body as Partial<TwibbonConfig>)
        const { error } = await supabase.from('twibbon_config').upsert({ id: 'default', config }, { onConflict: 'id' })
        if (error) throw error
        return response.status(200).json({ success: true, config })
    } catch {
        return response.status(500).json({ error: 'Unable to load or save twibbon config' })
    }
}
