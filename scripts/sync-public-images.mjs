import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const bucket = 'portfolio-assets'
const root = join(process.cwd(), 'public', 'images')
const iconsRoot = join(process.cwd(), 'public', 'icons')

const files = []

const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const full = join(dir, entry.name)
        if (entry.isDirectory()) walk(full)
        else if (entry.isFile()) files.push(full)
    }
}

walk(root)
walk(iconsRoot)

const uploadFile = async (filePath) => {
    const isIcon = filePath.startsWith(iconsRoot)
    const relative = filePath.replace(`${process.cwd()}\\`, '').replace(/\\/g, '/').replace(/^public\//, '')
    if (isIcon) {
        const objectName = `portfolio/icons/${relative.replace(/^icons\//, '')}`
        const buffer = readFileSync(filePath)
        const { error } = await supabase.storage.from(bucket).upload(objectName, buffer, {
            upsert: true,
            contentType: 'image/svg+xml',
        })
        if (error) {
            console.error(`Upload failed: ${relative} => ${error.message}`)
            return
        }
        const { data } = supabase.storage.from(bucket).getPublicUrl(objectName)
        console.log(`Uploaded ${relative} to Supabase -> ${data.publicUrl}`)
        return
    }
    const extension = relative.lastIndexOf('.')
    const webpRelative = `${extension === -1 ? relative : relative.slice(0, extension)}.webp`
    const objectName = `portfolio/${webpRelative}`
    const arrayBuffer = await sharp(readFileSync(filePath)).rotate().webp({ quality: 86 }).toBuffer()
    const { error } = await supabase.storage.from(bucket).upload(objectName, arrayBuffer, {
        upsert: true,
        contentType: 'image/webp',
    })

    if (error) {
        console.error(`Upload failed: ${relative} => ${error.message}`)
        return
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(objectName)
    console.log(`Uploaded ${relative} as WebP -> ${data.publicUrl}`)
}

const run = async () => {
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    if (listError) {
        console.error(listError.message)
        process.exit(1)
    }

    if (!buckets?.some((bucketEntry) => bucketEntry.name === bucket)) {
        console.error(`Bucket "${bucket}" does not exist. Create it in Supabase Storage and make it public.`)
        process.exit(1)
    }

    for (const file of files) {
        await uploadFile(file)
    }
}

run().catch((error) => {
    console.error(error)
    process.exit(1)
})
