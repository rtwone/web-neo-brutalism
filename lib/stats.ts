import { getSql } from './db.js'

export type StatsResult = {
    likes: number
    views: number
    isAway: boolean
    isLiked: boolean
}

const pageName = (value: unknown) => typeof value === 'string' && value.length <= 255 && value.startsWith('/') ? value : '/'

const ensurePage = async (page: string) => {
    await getSql()`INSERT INTO site_stats (page) VALUES (${page}) ON CONFLICT (page) DO NOTHING`
}

const ensureVisitor = async (visitorId: string) => {
    await getSql()`
        INSERT INTO visitors (visitor_id)
        VALUES (${visitorId}::uuid)
        ON CONFLICT (visitor_id)
        DO UPDATE SET last_seen_at = NOW()
    `
}

const readStats = async (page: string, visitorId: string, ipHash: string): Promise<StatsResult> => {
    const rows = await getSql()`
        SELECT
            stats.likes::int,
            stats.views::int,
            stats.is_away,
            EXISTS (
                SELECT 1 FROM visitor_likes
                WHERE (visitor_id = ${visitorId}::uuid OR ip_hash = ${ipHash}) AND page = ${page}
            ) AS is_liked
        FROM site_stats stats
        WHERE stats.page = ${page}
    ` as unknown as Array<{ likes: number; views: number; is_away: boolean; is_liked: boolean }>
    const row = rows[0]
    return {
        likes: row?.likes || 0,
        views: row?.views || 0,
        isAway: row?.is_away || false,
        isLiked: row?.is_liked || false,
    }
}

export const getStats = async (visitorId: string, ipHash: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    await ensureVisitor(visitorId)
    await ensurePage(page)
    return readStats(page, visitorId, ipHash)
}

export const recordLike = async (visitorId: string, ipHash: string, requestedPage: unknown) => {
    const page = pageName(requestedPage)
    await ensureVisitor(visitorId)
    await ensurePage(page)
    await getSql()`
        WITH inserted AS (
            INSERT INTO visitor_likes (visitor_id, page, ip_hash)
            VALUES (${visitorId}::uuid, ${page}, ${ipHash})
            ON CONFLICT DO NOTHING
            RETURNING 1
        )
        UPDATE site_stats
        SET likes = likes + (SELECT COUNT(*) FROM inserted), updated_at = NOW()
        WHERE site_stats.page = ${page}
    `
    return readStats(page, visitorId, ipHash)
}

export const recordView = async (visitorId: string, requestedPage: unknown, ipHash: string, userAgentHash: string) => {
    const page = pageName(requestedPage)
    const dedupMinutes = Number(process.env.VIEW_DEDUP_MINUTES) > 0 ? Number(process.env.VIEW_DEDUP_MINUTES) : 180
    await ensureVisitor(visitorId)
    await ensurePage(page)
    await getSql()`
        WITH locked AS (
            SELECT pg_advisory_xact_lock(hashtextextended(${`${ipHash}:${page}`}, 0))
        ), eligible AS (
            SELECT NOT EXISTS (
                SELECT 1 FROM page_views
                                WHERE (visitor_id = ${visitorId}::uuid OR ip_hash = ${ipHash})
                  AND page = ${page}
                  AND created_at > NOW() - (${dedupMinutes} * INTERVAL '1 minute')
            ) AS should_count
            FROM locked
        ), inserted AS (
            INSERT INTO page_views (visitor_id, page, ip_hash, user_agent_hash)
            SELECT ${visitorId}::uuid, ${page}, ${ipHash}, ${userAgentHash}
            FROM eligible
            WHERE should_count
            RETURNING 1
        )
        UPDATE site_stats
        SET views = views + (SELECT COUNT(*) FROM inserted), updated_at = NOW()
        WHERE site_stats.page = ${page}
    `
    return readStats(page, visitorId, ipHash)
}
