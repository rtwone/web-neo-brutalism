import { getSupabase } from './db.js'

export type StatsResult = {
    likes: number
    views: number
    isLiked: boolean
}

const pageName = (value: unknown) => typeof value === 'string' && value.length <= 255 && value.startsWith('/') ? value : '/'

const ensurePage = async (page: string) => {
    const { error } = await getSupabase().from('site_stats').upsert({ page }, { onConflict: 'page', ignoreDuplicates: true })
    if (error) throw error
}

const ensureVisitor = async (visitorId: string) => {
    const { error } = await getSupabase().from('visitors').upsert({ visitor_id: visitorId }, { onConflict: 'visitor_id', ignoreDuplicates: true })
    if (error) throw error
}

const readStats = async (page: string, visitorId: string): Promise<StatsResult> => {
    const supabase = getSupabase()
    const [{ data: stats, error: statsError }, { count, error: likeError }] = await Promise.all([
        supabase.from('site_stats').select('likes, views').eq('page', page).single(),
        supabase.from('visitor_likes').select('id', { count: 'exact', head: true }).eq('visitor_id', visitorId).eq('page', page),
    ])
    if (statsError) throw statsError
    if (likeError) throw likeError
    return {
        likes: stats?.likes || 0,
        views: stats?.views || 0,
        isLiked: (count || 0) > 0,
    }
}

export const getStats = async (visitorId: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    await ensureVisitor(visitorId)
    await ensurePage(page)
    return readStats(page, visitorId)
}

export const recordLike = async (visitorId: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    await ensureVisitor(visitorId)
    await ensurePage(page)
    const { error } = await getSupabase().rpc('record_like', { p_visitor_id: visitorId, p_page: page })
    if (error) throw error
    return readStats(page, visitorId)
}

export const recordView = async (visitorId: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    const dedupMinutes = Number(process.env.VIEW_DEDUP_MINUTES) > 0 ? Number(process.env.VIEW_DEDUP_MINUTES) : 180
    await ensureVisitor(visitorId)
    await ensurePage(page)
    const { error } = await getSupabase().rpc('record_view', {
        p_visitor_id: visitorId,
        p_page: page,
        p_dedup_minutes: dedupMinutes,
    })
    if (error) throw error
    return readStats(page, visitorId)
}
