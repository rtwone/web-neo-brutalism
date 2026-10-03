import { createHmac, timingSafeEqual } from 'node:crypto'

const sessionDuration = 60 * 60 * 24

const secret = () => process.env.ADMIN_SESSION_SECRET || ''

const signature = (value: string) => createHmac('sha256', secret()).update(value).digest('base64url')

export const isAdminPasswordValid = (password: unknown) =>
    typeof password === 'string' && Boolean(process.env.ADMIN_PASSWORD) && Boolean(process.env.ADMIN_SESSION_SECRET) && password === process.env.ADMIN_PASSWORD

export const createAdminToken = () => {
    const expiresAt = Math.floor(Date.now() / 1000) + sessionDuration
    const payload = String(expiresAt)
    return `${payload}.${signature(payload)}`
}

export const isAdminTokenValid = (token: unknown) => {
    if (typeof token !== 'string' || !secret()) return false
    const [expiresAt, providedSignature] = token.split('.')
    if (!expiresAt || !providedSignature || Number(expiresAt) < Math.floor(Date.now() / 1000)) return false
    const expected = signature(expiresAt)
    if (providedSignature.length !== expected.length) return false
    return timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expected))
}

export const adminCookie = (token: string) => {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
    return `admin_session=${token}; Path=/; HttpOnly${secure}; SameSite=Lax; Max-Age=${sessionDuration}`
}

export const hasAdminSession = (cookieHeader: string | undefined) => {
    const token = cookieHeader?.split(';').map((part) => part.trim()).find((part) => part.startsWith('admin_session='))?.slice('admin_session='.length)
    return isAdminTokenValid(token)
}