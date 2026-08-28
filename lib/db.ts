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
