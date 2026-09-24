import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export const getSupabase = () => {
    if (client) return client
    const url = process.env.SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !serviceRoleKey) throw new Error('Supabase environment variables are not configured')
    client = createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
    return client
}

export const getSupabaseBrowser = () => {
    const browserEnv = (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env
    const url = browserEnv?.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL
    const anonKey = browserEnv?.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new Error('Supabase browser environment variables are not configured')

    const globalStore = globalThis as typeof globalThis & { __supabaseBrowserClient?: SupabaseClient }
    if (!globalStore.__supabaseBrowserClient) {
        globalStore.__supabaseBrowserClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    }

    return globalStore.__supabaseBrowserClient
}