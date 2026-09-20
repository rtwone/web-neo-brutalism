import { getRequestSignals, hashVisitorIp } from '../lib/visitor.js'
import { checkGlobalRateLimit, checkRateLimit } from '../lib/rate-limit.js'
import { getStats, recordLike, recordView } from '../lib/stats.js'

export type VercelRequest = {
    method?: string
    url?: string
    body?: Record<string, unknown>
    headers?: Record<string, string | string[] | undefined>
    query?: Record<string, string | string[] | undefined>
}

export type VercelResponse = {
    status: (status: number) => VercelResponse
    json: (body: object) => void
    setHeader: (name: string, value: string) => void
}

const pageFromRequest = (request: VercelRequest) => {
    const value = request.query?.page
    return Array.isArray(value) ? value[0] : value || '/'
}

const fail = (response: VercelResponse, status: number, error: string) => response.status(status).json({ success: false, error })

const responseBody = (stats: Awaited<ReturnType<typeof getStats>>) => ({
    success: true,
    likes: stats.likes,
    views: stats.views,
    isLiked: stats.isLiked,
})

export default async function handler(request: VercelRequest, response: VercelResponse) {
    const pathAction = request.url?.split('?')[0].endsWith('/like')
        ? 'like'
        : request.url?.split('?')[0].endsWith('/view')
            ? 'view'
            : undefined
    const action = request.query?.action || pathAction
    const actionName = Array.isArray(action) ? action[0] : action
    if (!['GET', 'POST'].includes(request.method || '')) return fail(response, 405, 'Method not allowed')

    try {
        const { ip } = getRequestSignals(request)
        const globalRate = checkGlobalRateLimit(ip)
        if (!globalRate.allowed) {
            response.setHeader('Retry-After', String(globalRate.retryAfter))
            return fail(response, 429, 'Too many requests')
        }

        const visitorId = hashVisitorIp(ip)
        const page = pageFromRequest(request)

        if (request.method === 'GET') {
            const stats = await getStats(visitorId, page)
            return response.status(200).json(responseBody(stats))
        }

        if (actionName !== 'like' && actionName !== 'view') return fail(response, 400, 'Invalid action')
        const rate = actionName === 'like'
            ? checkRateLimit(`like:${ip}`, 'LIKE_RATE_LIMIT', 'LIKE_RATE_WINDOW', 5, 60)
            : checkRateLimit(`view:${ip}`, 'VIEW_RATE_LIMIT', 'VIEW_RATE_WINDOW', 30, 60)
        if (!rate.allowed) {
            response.setHeader('Retry-After', String(rate.retryAfter))
            return fail(response, 429, 'Too many requests')
        }

        const stats = actionName === 'like'
            ? await recordLike(visitorId, page)
            : await recordView(visitorId, page)
        return response.status(200).json(responseBody(stats))
    } catch {
        return fail(response, 500, 'Stats service unavailable')
    }
}
