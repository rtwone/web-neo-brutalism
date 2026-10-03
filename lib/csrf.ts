type RequestHeaders = Record<string, string | string[] | undefined>

const firstHeader = (headers: RequestHeaders | undefined, name: string) => {
    const value = headers?.[name] ?? headers?.[name.toLowerCase()]
    return Array.isArray(value) ? value[0] : value
}

export const isSameOriginRequest = (headers?: RequestHeaders) => {
    const origin = firstHeader(headers, 'origin')
    if (!origin) return true

    try {
        const originUrl = new URL(origin)
        const forwardedHost = firstHeader(headers, 'x-forwarded-host')
        const host = forwardedHost || firstHeader(headers, 'host')
        return Boolean(host) && originUrl.host === host
    } catch {
        return false
    }
}
