import { createHash, randomUUID } from 'node:crypto'

const COOKIE_NAME = 'visitor_id'
const COOKIE_MAX_AGE = 31536000

export type RequestLike = {
    headers?: Record<string, string | string[] | undefined>
}

export type ResponseLike = {
    setHeader: (name: string, value: string) => void
}

const headerValue = (request: RequestLike, name: string) => {
    const value = request.headers?.[name]
    return Array.isArray(value) ? value[0] : value
}

const parseCookie = (request: RequestLike, name: string) => {
    const cookieHeader = headerValue(request, 'cookie') || headerValue(request, 'Cookie') || ''
    const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
    return cookie?.slice(name.length + 1) || null
}

const isUuid = (value: string | null | undefined): value is string =>
    Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))

export const getVisitorId = (request: RequestLike, response: ResponseLike) => {
    const existingId = parseCookie(request, COOKIE_NAME)
    if (isUuid(existingId)) return existingId

    const headerId = headerValue(request, 'x-visitor-id') || headerValue(request, 'X-Visitor-Id')
    if (isUuid(headerId)) return headerId

    const visitorId = randomUUID()
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    response.setHeader('Set-Cookie', `${COOKIE_NAME}=${visitorId}; Max-Age=${COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax${secure}`)
    return visitorId
}

export const getRequestSignals = (request: RequestLike) => {
    const forwarded = headerValue(request, 'x-forwarded-for') || headerValue(request, 'X-Forwarded-For')
    const ip = forwarded?.split(',')[0]?.trim() || headerValue(request, 'x-real-ip') || headerValue(request, 'X-Real-IP') || 'unknown'
    const userAgent = headerValue(request, 'user-agent') || headerValue(request, 'User-Agent') || ''
    return { ip, userAgent }
}

export const hashSignal = (value: string) => {
    const secret = process.env.IP_HASH_SECRET
    if (!secret) throw new Error('IP_HASH_SECRET is not configured')
    return createHash('sha256').update(`${value}${secret}`).digest('hex')
}
