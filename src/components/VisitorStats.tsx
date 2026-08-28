import { useEffect, useState } from 'react'

const page = '/'
const viewStorageKey = 'visitor_viewed_home'
const viewTimeStorageKey = 'visitor_viewed_at_wib'
const viewDedupMs = 3 * 60 * 60 * 1000

const statsRequest = (url: string, options: RequestInit = {}) => fetch(url, options)

const statsUrl = (path: string) => path

const wibTimestamp = (date: Date) => new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
}).format(date).replace(' ', 'T') + '+07:00'

const hasRecentView = () => {
    const viewedAtWib = window.localStorage.getItem(viewTimeStorageKey)
    const viewedAt = viewedAtWib ? Date.parse(viewedAtWib) : Number.NaN
    if (!viewedAtWib || Number.isNaN(viewedAt) || Date.now() - viewedAt >= viewDedupMs) {
        window.localStorage.removeItem(viewStorageKey)
        window.localStorage.removeItem(viewTimeStorageKey)
        return false
    }
    return true
}

type Stats = {
    likes: number
    views: number
    isLiked: boolean
}

const initialStats: Stats = { likes: 0, views: 0, isLiked: false }

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
            if (hasRecentView()) return
            try {
                const response = await statsRequest(statsUrl(`/api/stats/view?page=${encodeURIComponent(page)}`), { method: 'POST' })
                if (!response.ok) return
                const data = await response.json() as Stats & { success: boolean }
                if (data.success) {
                    window.localStorage.setItem(viewStorageKey, '1')
                    window.localStorage.setItem(viewTimeStorageKey, wibTimestamp(new Date()))
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
        <div className="visitor-stats-wrap">
            <section className="visitor-stats" aria-label="Visitor stats">
                <div className="visitor-stat visitor-like-stat">
                    <button type="button" className={`visitor-like-button ${stats.isLiked ? 'liked' : ''}`} onClick={like} disabled={liking || stats.isLiked} aria-pressed={stats.isLiked}>
                        <span aria-hidden="true">{stats.isLiked ? '♥' : '♡'}</span>
                        <strong>{loading ? '—' : stats.likes}</strong>
                        <small>{stats.isLiked ? 'Liked' : 'Likes'}</small>
                    </button>
                </div>
                <div className="visitor-stat">
                    <span className="visitor-stat-icon" aria-hidden="true">◉</span>
                    <strong>{loading ? '—' : stats.views}</strong>
                    <small>Views</small>
                </div>
                {error && <span className="visitor-stats-error" role="status">{error}</span>}
            </section>
            <p className="visitor-stats-hint">Mungkin kamu suka dengan Web ini? Kasih satu love, dong!</p>
        </div>
    )
}
