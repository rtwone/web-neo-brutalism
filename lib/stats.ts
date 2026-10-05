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

const syncLikeSummary = async (page: string) => {
    const supabase = getSupabase()
    const { count, error: countError } = await supabase
        .from('visitor_likes')
        .select('id', { count: 'exact', head: true })
        .eq('page', page)
    if (countError) throw countError

    const { error: summaryError } = await supabase
        .from('site_stats')
        .update({ likes: count ?? 0 })
        .eq('page', page)
    if (summaryError) throw summaryError
}

const readStats = async (page: string, visitorId: string): Promise<StatsResult> => {
    const supabase = getSupabase()
    const [{ data: stats, error: statsError }, { count: likesCount, error: likesError }, { count: visitorLikeCount, error: visitorLikeError }] = await Promise.all([
        supabase.from('site_stats').select('likes, views').eq('page', page).single(),
        supabase.from('visitor_likes').select('id', { count: 'exact', head: true }).eq('page', page),
        supabase.from('visitor_likes').select('id', { count: 'exact', head: true }).eq('visitor_id', visitorId).eq('page', page),
    ])
    if (statsError) throw statsError
    if (likesError) throw likesError
    if (visitorLikeError) throw visitorLikeError
    return {
        likes: likesCount ?? stats?.likes ?? 0,
        views: stats?.views || 0,
        isLiked: (visitorLikeCount || 0) > 0,
    }
}

export const getStats = async (visitorId: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    await ensureVisitor(visitorId)
    await ensurePage(page)
    await syncLikeSummary(page)
    return readStats(page, visitorId)
}

export const recordLike = async (visitorId: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    const supabase = getSupabase()
    await ensureVisitor(visitorId)
    await ensurePage(page)
    const { error } = await supabase.from('visitor_likes').upsert(
        { visitor_id: visitorId, page },
        { onConflict: 'visitor_id,page', ignoreDuplicates: true },
    )
    if (error) throw error
    await syncLikeSummary(page)
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
