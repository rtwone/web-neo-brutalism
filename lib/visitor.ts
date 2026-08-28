import { createHash } from 'node:crypto'

export type RequestLike = {
    headers?: Record<string, string | string[] | undefined>
}

const headerValue = (request: RequestLike, name: string) => {
    const value = request.headers?.[name]
    return Array.isArray(value) ? value[0] : value
}

export const getRequestSignals = (request: RequestLike) => {
    const forwarded = headerValue(request, 'x-forwarded-for') || headerValue(request, 'X-Forwarded-For')
    const ip = forwarded?.split(',')[0]?.trim() || headerValue(request, 'x-real-ip') || headerValue(request, 'X-Real-IP') || 'unknown'
    return { ip }
}

export const hashVisitorIp = (ip: string) => {
    const secret = process.env.IP_HASH_SECRET
    if (!secret) throw new Error('IP_HASH_SECRET is not configured')
    return createHash('sha256').update(`${ip}:${secret}`).digest('hex')
}
