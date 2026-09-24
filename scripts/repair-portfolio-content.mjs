import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const projectRoot = process.cwd()
const envPath = path.join(projectRoot, '.env')

if (fs.existsSync(envPath)) {
    process.loadEnvFile(envPath)
}

const url = process.env.SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceRoleKey) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
}

const looksLikeDummyText = (input) => {
    if (typeof input !== 'string') return true

    const trimmed = input.trim()
    if (!trimmed) return true

    const normalized = trimmed.toLowerCase()
    if (['test', 'dummy', 'sample', 'placeholder', 'lorem', 'ipsum', 'example', 'abc', 'qwe', 'asdf', 'zxcv', 'null', 'undefined'].includes(normalized)) return true
    if (normalized.length <= 2) return true

    const lettersOnly = normalized.replace(/[^a-z]/g, '')
    if (lettersOnly.length >= 4 && !/[aeiou]/i.test(lettersOnly)) return true
    if (/^[a-z0-9]{4,}$/.test(normalized) && !/[aeiou]/i.test(normalized)) return true
    if (/^(?:[a-z0-9]{1,}\s+){2,}[a-z0-9]{1,}$/.test(normalized) && !/[aeiou]/i.test(normalized)) return true
    if (/^(?:[bcdfghjklmnpqrstvwxyz]){4,}$/i.test(normalized)) return true
    if (/^\d+$/.test(normalized)) return true

    return false
}

const isMeaningfulText = (value) => typeof value === 'string' && value.trim().length > 0 && !looksLikeDummyText(value)
const isMeaningfulEntry = (item) => isMeaningfulText(item?.title) || isMeaningfulText(item?.period) || isMeaningfulText(item?.subtitle) || isMeaningfulText(item?.badge)

const supabase = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
const { data: currentRow, error: loadError } = await supabase.from('site_content').select('content').eq('id', 'portfolio').maybeSingle()
if (loadError) throw loadError

const source = currentRow?.content ?? {}

const cleaned = {
    ...source,
    education: Array.isArray(source.education) ? source.education.filter(isMeaningfulEntry) : [],
    experience: Array.isArray(source.experience) ? source.experience.filter(isMeaningfulEntry) : [],
    socials: Array.isArray(source.socials) ? source.socials.filter((item) => isMeaningfulText(item?.label) || isMeaningfulText(item?.url)) : [],
    skills: Array.isArray(source.skills) ? source.skills.filter((item) => isMeaningfulText(item?.name) || isMeaningfulText(item?.mark)) : [],
    projects: Array.isArray(source.projects)
        ? source.projects.filter((project) => {
            if (project?.category === 'Design') return isMeaningfulText(project?.image) || isMeaningfulText(project?.url)

            const type = project?.type ?? {}
            const desc = project?.description ?? {}
            const role = project?.role ?? {}

            return isMeaningfulText(project?.title)
                || isMeaningfulText(project?.year)
                || isMeaningfulText(type?.id)
                || isMeaningfulText(type?.en)
                || isMeaningfulText(desc?.id)
                || isMeaningfulText(desc?.en)
                || isMeaningfulText(role?.id)
                || isMeaningfulText(role?.en)
                || (Array.isArray(project?.tech) && project.tech.length > 0)
                || isMeaningfulText(project?.github)
                || isMeaningfulText(project?.url)
        })
        : [],
}

const { data, error } = await supabase.from('site_content').upsert({ id: 'portfolio', content: cleaned }, { onConflict: 'id' }).select('content')
if (error) throw error

const saved = data?.[0]?.content ?? cleaned
console.log(JSON.stringify({
    education: saved.education?.length ?? 0,
    experience: saved.experience?.length ?? 0,
    skills: saved.skills?.length ?? 0,
    projects: saved.projects?.length ?? 0,
    socials: saved.socials?.length ?? 0,
}, null, 2))
