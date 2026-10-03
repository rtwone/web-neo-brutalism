import { hasAdminSession } from '../../lib/admin.js'
import { isSameOriginRequest } from '../../lib/csrf.js'
import { getSupabase } from '../../lib/db.js'

type Request = { method?: string; headers?: Record<string, string | string[] | undefined>; body?: unknown }
type Response = { status: (status: number) => Response; json: (body: object) => void }
type MediaAsset = {
    name: string
    bucket: string
    path: string
    url: string
    size?: number
    updated_at?: string
    mimetype?: string
}

const header = (request: Request, name: string) => {
    const value = request.headers?.[name]
    return Array.isArray(value) ? value[0] : value
}

export default async function handler(request: Request, response: Response) {
    if (!hasAdminSession(header(request, 'cookie'))) return response.status(401).json({ error: 'Authentication required' })
    if (request.method !== 'GET' && (!isSameOriginRequest(request.headers) || request.method !== 'DELETE')) {
        return response.status(403).json({ error: 'Invalid origin' })
    }

    try {
        const supabase = getSupabase()
        if (request.method === 'GET') {
            const assets: MediaAsset[] = []
            const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
            if (bucketsError) throw bucketsError

            for (const bucketInfo of buckets ?? []) {
                const bucket = supabase.storage.from(bucketInfo.name)
                const pendingFolders = ['']

                while (pendingFolders.length > 0) {
                    const folder = pendingFolders.pop() as string
                    let offset = 0
                    while (true) {
                        const { data: entries, error } = await bucket.list(folder, {
                            limit: 1000,
                            offset,
                            sortBy: { column: 'created_at', order: 'desc' },
                        })
                        if (error) throw error
                        if (!entries?.length) break

                        for (const entry of entries) {
                            const path = folder ? `${folder}/${entry.name}` : entry.name
                            if (entry.id) {
                                assets.push({
                                    name: entry.name,
                                    bucket: bucketInfo.name,
                                    path,
                                    url: bucket.getPublicUrl(path).data.publicUrl,
                                    size: entry.metadata?.size,
                                    updated_at: entry.updated_at ?? undefined,
                                    mimetype: entry.metadata?.mimetype,
                                })
                            } else {
                                pendingFolders.push(path)
                            }
                        }
                        if (entries.length < 1000) break
                        offset += entries.length
                    }
                }
            }
            assets.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''))
            return response.status(200).json({ assets })
        }
        if (request.method !== 'DELETE') return response.status(405).json({ error: 'Method not allowed' })
        const body = request.body as { bucket?: unknown; path?: unknown } | undefined
        const bucketName = typeof body?.bucket === 'string' ? body.bucket : ''
        const path = typeof body?.path === 'string' ? body.path : ''
        if (!path || path.startsWith('/') || path.includes('..') || path.split('/').some((segment) => !segment || segment === '.' || segment === '..')) {
            return response.status(400).json({ error: 'Invalid asset path' })
        }
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
        if (bucketsError) throw bucketsError
        if (!bucketName || !buckets?.some((bucket) => bucket.name === bucketName)) return response.status(400).json({ error: 'Invalid storage bucket' })
        const { error } = await supabase.storage.from(bucketName).remove([path])
        if (error) throw error
        return response.status(200).json({ success: true, bucket: bucketName, path })
    } catch {
        return response.status(500).json({ error: 'Unable to manage media assets' })
    }
}
