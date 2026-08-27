import { useEffect, useState } from 'react'

const page = '/'
const visitorStorageKey = 'visitor_id'
const viewStorageKey = 'visitor_viewed_home'

const getVisitorId = () => {
    const existingId = window.localStorage.getItem(visitorStorageKey)
    if (existingId) return existingId
    const visitorId = crypto.randomUUID()
    window.localStorage.setItem(visitorStorageKey, visitorId)
    return visitorId
}

const statsRequest = (url: string, options: RequestInit = {}) => fetch(url, {
    ...options,
    headers: { ...options.headers, 'x-visitor-id': getVisitorId() },
})

const statsUrl = (path: string) => `${path}&visitor_id=${encodeURIComponent(getVisitorId())}`

type Stats = {
    likes: number
    views: number
    isLiked: boolean
    isAway: boolean
}

const initialStats: Stats = { likes: 0, views: 0, isLiked: false, isAway: false }

export function VisitorStats() {
    const [stats, setStats] = useState(initialStats)
    const [loading, setLoading] = useState(true)
    const [liking, setLiking] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        let active = true
        const loadStats = async () => {
            try {
                const response = await statsRequest(statsUrl(`/api/stats?page=${encodeURIComponent(page)}`))
                if (!response.ok) throw new Error('Stats unavailable')
                const data = await response.json() as Stats & { success: boolean }
                if (active && data.success) setStats(data)
                if (active) setLoading(false)
            } catch {
                if (active) {
                    setError('Stats belum tersedia')
                    setLoading(false)
                }
            }
        }
        loadStats()
        return () => { active = false }
    }, [])

    useEffect(() => {
        const recordView = async () => {
            if (window.localStorage.getItem(viewStorageKey) === '1') return
            try {
                const response = await statsRequest(statsUrl(`/api/stats/view?page=${encodeURIComponent(page)}`), { method: 'POST' })
                if (!response.ok) return
                const data = await response.json() as Stats & { success: boolean }
                if (data.success) {
                    window.localStorage.setItem(viewStorageKey, '1')
                    setStats(data)
                }
            } catch {
                // View counting is non-blocking for the portfolio experience.
            }
        }
        const timer = window.setTimeout(() => {
            if (document.visibilityState === 'visible') recordView()
        }, 2000)
        return () => window.clearTimeout(timer)
    }, [])

    const like = async () => {
        if (liking || stats.isLiked) return
        const previous = stats
        setLiking(true)
        setError('')
        setStats((current) => ({ ...current, likes: current.likes + 1, isLiked: true }))
        try {
            const response = await statsRequest(statsUrl(`/api/stats/like?page=${encodeURIComponent(page)}`), { method: 'POST' })
            const data = await response.json() as Stats & { success: boolean; error?: string }
            if (!response.ok || !data.success) throw new Error(data.error || 'Like failed')
            setStats(data)
        } catch {
            setStats(previous)
            setError('Like belum tersimpan. Coba lagi.')
        } finally {
            setLiking(false)
        }
    }

    return (
        <section className="visitor-stats" aria-label="Visitor stats">
            <div className="visitor-stat visitor-like-stat">
                <button type="button" className={`visitor-like-button ${stats.isLiked ? 'liked' : ''}`} onClick={like} disabled={liking || stats.isLiked} aria-pressed={stats.isLiked}>
                    <span aria-hidden="true">♥</span>
                    <strong>{loading ? '—' : stats.likes}</strong>
                    <small>{stats.isLiked ? 'Liked' : 'Likes'}</small>
                </button>
            </div>
            <div className="visitor-stat">
                <span className="visitor-stat-icon" aria-hidden="true">◉</span>
                <strong>{loading ? '—' : stats.views}</strong>
                <small>Views</small>
            </div>
            <div className="visitor-stat visitor-away-stat">
                <span className={`away-dot ${stats.isAway ? 'away' : ''}`} aria-hidden="true" />
                <strong>{stats.isAway ? 'Away' : 'Online'}</strong>
                <small>Status</small>
            </div>
            {error && <span className="visitor-stats-error" role="status">{error}</span>}
        </section>
    )
}
