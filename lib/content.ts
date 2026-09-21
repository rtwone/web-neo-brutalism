import { getSupabase } from './db.js'

export const getStoredContactEmail = async () => {
    const { data, error } = await getSupabase().from('site_content').select('content').eq('id', 'portfolio').maybeSingle()
    if (error) throw error
    const content = data?.content as { contactEmail?: unknown } | null
    return typeof content?.contactEmail === 'string' && content.contactEmail.includes('@') ? content.contactEmail : undefined
}