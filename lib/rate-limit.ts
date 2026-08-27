type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

const numberEnv = (name: string, fallback: number) => {
    const value = Number(process.env[name])
    return Number.isFinite(value) && value > 0 ? value : fallback
}

export const checkRateLimit = (key: string, limitName: string, windowName: string, fallbackLimit: number, fallbackWindow: number) => {
    const limit = numberEnv(limitName, fallbackLimit)
    const windowMs = numberEnv(windowName, fallbackWindow) * 1000
    const now = Date.now()
    const current = buckets.get(key)
    const bucket = !current || current.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : current

    bucket.count += 1
    buckets.set(key, bucket)

    if (buckets.size > 10000) {
        for (const [bucketKey, value] of buckets) {
            if (value.resetAt <= now) buckets.delete(bucketKey)
        }
    }

    return {
        allowed: bucket.count <= limit,
        retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    }
}
