type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()
const MAX_BUCKETS = 10000

const numberEnv = (name: string, fallback: number) => {
    const value = Number(process.env[name])
    return Number.isFinite(value) && value > 0 ? value : fallback
}

export const checkRateLimit = (key: string, limitName: string, windowName: string, fallbackLimit: number, fallbackWindow: number) => {
    const limit = numberEnv(limitName, fallbackLimit)
    const windowMs = numberEnv(windowName, fallbackWindow) * 1000
    const now = Date.now()

    for (const [bucketKey, value] of buckets) {
        if (value.resetAt <= now) buckets.delete(bucketKey)
    }

    const current = buckets.get(key)
    const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current

    bucket.count += 1
    buckets.set(key, bucket)

    while (buckets.size > MAX_BUCKETS) {
        const oldestKey = buckets.keys().next().value
        if (oldestKey === undefined) break
        buckets.delete(oldestKey)
    }

    return {
        allowed: bucket.count <= limit,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
}

export const checkGlobalRateLimit = (ip: string) =>
    checkRateLimit(`global:${ip}`, 'GLOBAL_RATE_LIMIT', 'GLOBAL_RATE_WINDOW', 120, 60)
