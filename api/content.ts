import { getSupabase } from '../lib/db.js'
import { defaultContent, sanitizeSiteContent } from '../src/content.js'

type Request = { method?: string }
type Response = { status: (status: number) => Response; json: (body: object) => void }

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
    if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })

    try {
        const { data, error } = await getSupabase().from('site_content').select('content').eq('id', 'portfolio').maybeSingle()
        if (error) return response.status(500).json({ error: 'Unable to load content' })
        const content = data?.content
            ? sanitizeSiteContent(data.content as Record<string, unknown>)
            : await ensurePortfolioSeed()
        return response.status(200).json({ content })
    } catch {
        return response.status(500).json({ error: 'Unable to initialize portfolio content' })
    }
}
