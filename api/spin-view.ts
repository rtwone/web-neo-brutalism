import Busboy from 'busboy'
import { createWriteStream } from 'node:fs'
import { execFile } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { basename, extname, join } from 'node:path'
import { promisify } from 'node:util'
import { pipeline } from 'node:stream/promises'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'
import sharp from 'sharp'

const MAX_FILE_SIZE = 25 * 1024 * 1024
const execFileAsync = promisify(execFile)
const imageExtensions = new Set(['.jpg', '.jpeg', '.png'])
const allowedMime = new Set(['image/jpeg', 'image/png'])
export type VercelRequest = { method?: string; headers: Record<string, string | string[] | undefined>; pipe: (stream: NodeJS.WritableStream) => NodeJS.WritableStream }
export type VercelResponse = { status: (code: number) => VercelResponse; setHeader: (name: string, value: string) => void; end: (body?: string | Buffer) => void }

type Upload = { path: string; name: string; mime: string; size: number }
const json = (response: VercelResponse, status: number, error: string) => { response.status(status); response.setHeader('Content-Type', 'application/json'); response.end(JSON.stringify({ error })) }
const safeName = (name: string) => basename(name).replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 120) || 'media'
const headerValue = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value
const watermark = (width: number, height: number) => Buffer.from(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="${width / 2}" y="${height - 34}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${Math.max(16, Math.round(Math.min(width, height) * .018))}" font-weight="600" font-style="italic">follow instagram account @irfvnny</text></svg>`)

const parseUpload = (request: VercelRequest, directory: string) => new Promise<{ upload: Upload; size: 'original' | 'custom'; originalName?: string }>((resolve, reject) => {
    const contentType = headerValue(request.headers['content-type'])
    if (!contentType?.startsWith('multipart/form-data')) { reject(new Error('Gunakan multipart/form-data untuk mengunggah file.')); return }
    const parser = Busboy({ headers: { 'content-type': contentType }, limits: { fileSize: MAX_FILE_SIZE, files: 1, fields: 2 } })
    let upload: Upload | undefined
    let fileError: Error | undefined
    let fileFinished = false
    let parserFinished = false
    let size: 'original' | 'custom' = 'original'
    let originalName: string | undefined
    let settled = false
    const fail = (error: Error) => { fileError = error; if (!settled) { settled = true; reject(error) } }
    const finishIfReady = () => {
        if (settled || !parserFinished || !fileFinished) return
        if (fileError) { fail(fileError); return }
        if (upload) { settled = true; resolve({ upload, size, originalName }) }
        else fail(new Error('Field file wajib diisi.'))
    }
    parser.on('field', (name, value) => { if (name === 'size' && (value === 'original' || value === 'custom')) size = value; if (name === 'originalName') originalName = safeName(value) })
    parser.on('file', (name, stream, info) => {
        if (name !== 'file') { stream.resume(); return }
        const fileName = safeName(info.filename)
        const path = join(directory, fileName)
        let bytes = 0
        const output = createWriteStream(path, { flags: 'wx' })
        stream.on('data', (chunk: Buffer) => { bytes += chunk.length })
        stream.on('limit', () => { output.destroy(); void rm(path, { force: true }); fail(new Error('File terlalu besar. Ukuran maksimal adalah 25 MB.')) })
        pipeline(stream, output).then(() => { upload = { path, name: fileName, mime: info.mimeType, size: bytes }; fileFinished = true; finishIfReady() }).catch(() => { fileFinished = true; fail(new Error('Upload file gagal.')) })
    })
    parser.on('error', () => fail(new Error('Upload tidak valid atau corrupt.')))
    parser.on('finish', () => { parserFinished = true; finishIfReady() })
    request.pipe(parser)
})

const detectKind = async (path: string, mime: string, name: string) => {
    const bytes = await readFile(path, { encoding: null })
    const extension = extname(name).toLowerCase()
    const isJpeg = bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
    const isPng = bytes.length > 8 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
    const validImage = isJpeg || isPng
    const mimeMatches = allowedMime.has(mime) || (mime === 'application/octet-stream' && validImage) || (mime.startsWith('image/') && validImage) || (!mime && validImage)
    if (!imageExtensions.has(extension) || !validImage || !mimeMatches) throw new Error('Format tidak didukung. Gunakan JPG atau PNG.')
    return { kind: 'image' as const, format: isPng ? '.png' : isJpeg ? '.jpg' : extension }
}

const resolution = async (path: string) => {
    const metadata = await sharp(path).metadata()
    return metadata.width && metadata.height ? `${metadata.width} × ${metadata.height}` : 'Tidak diketahui'
}

const require = createRequire(import.meta.url)
const ffmpegPath = async (name: 'ffmpeg' | 'ffprobe') => {
    try {
        if (name === 'ffmpeg') return require('ffmpeg-static') as string
        return (require('ffprobe-static') as { path: string }).path
    } catch {
        return name
    }
}

const hasAudio = async (path: string, ffprobe: string) => {
    const { stdout } = await execFileAsync(ffprobe, ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=index', '-of', 'csv=p=0', path])
    return Boolean(stdout.trim())
}

export const encodeVideo = async (input: string, output: string) => {
    const ffmpeg = await ffmpegPath('ffmpeg')
    const ffprobe = await ffmpegPath('ffprobe')
    const audio = await hasAudio(input, ffprobe)
    const args = ['-y', '-v', 'error', '-i', input, '-map', '0:v:0']
    if (audio) args.push('-map', '0:a:0')
    args.push(
        '-vf', 'scale=1376:1840:force_original_aspect_ratio=increase,crop=1376:1840,fps=30,format=yuv420p',
        '-c:v', 'libx265', '-profile:v', 'main', '-pix_fmt', 'yuv420p',
        '-x265-params', 'info=0:log-level=none', '-tag:v', 'hvc1', '-r', '30',
        '-color_primaries', 'bt2020', '-color_trc', 'arib-std-b67', '-colorspace', 'bt2020nc',
        '-video_track_timescale', '600',
    )
    if (audio) args.push('-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2')
    args.push(
        '-map_metadata', '-1', '-map_metadata:s:v', '-1',
        '-metadata', 'com.apple.quicktime.copyright=Meta AI',
        '-metadata', 'com.apple.quicktime.model=Ray-Ban Meta Smart Glasses 2',
        '-metadata', `com.apple.quicktime.comment=app=Meta AI&device=Ray-Ban Meta Smart Glasses 2&id=${randomUUID().toUpperCase()}`,
        '-metadata:s:v', 'handler_name=Core Media Video',
        '-metadata:s:a', 'handler_name=Core Media Audio',
        '-f', 'mov', output,
    )
    try {
        await execFileAsync(ffmpeg, args, { maxBuffer: 1024 * 1024 })
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error('FFmpeg/FFprobe tidak tersedia di server. Install dependency media atau pasang FFmpeg.')
        throw new Error('Video MOV gagal di-encode. Pastikan codec video dapat dibaca dan file tidak corrupt.')
    }
}

type Atom = { kind: string; start: number; size: number; payload: number }
const atom = (kind: string, payload: Buffer) => { const output = Buffer.alloc(8 + payload.length); output.writeUInt32BE(output.length, 0); output.write(kind, 4, 4, 'ascii'); payload.copy(output, 8); return output }
const parseAtoms = (data: Buffer, start = 0, end = data.length) => {
    const atoms: Atom[] = []
    for (let position = start; position + 8 <= end;) {
        let atomSize = data.readUInt32BE(position); let header = 8
        if (atomSize === 1 && position + 16 <= end) { atomSize = Number(data.readBigUInt64BE(position + 8)); header = 16 }
        else if (atomSize === 0) atomSize = end - position
        if (atomSize < header || position + atomSize > end) break
        atoms.push({ kind: data.toString('ascii', position + 4, position + 8), start: position, size: atomSize, payload: position + header }); position += atomSize
    }
    return atoms
}
const findAtom = (children: Atom[], kind: string) => children.find((child) => child.kind === kind)
const pascal = (value: string) => { const raw = Buffer.from(value, 'utf8'); return Buffer.concat([Buffer.from([raw.length]), raw]) }
const makeHandler = (componentType: string, subtype: string, name: string) => atom('hdlr', Buffer.concat([Buffer.alloc(4), Buffer.from(componentType), Buffer.from(subtype), Buffer.from('appl'), Buffer.alloc(8), pascal(name)]))
const makeTapt = () => {
    const dimensions = (kind: string) => { const payload = Buffer.alloc(12); payload.writeUInt32BE(1376 << 16, 4); payload.writeUInt32BE(1840 << 16, 8); return atom(kind, payload) }
    return atom('tapt', Buffer.concat([dimensions('clef'), dimensions('prof'), dimensions('enof')]))
}
const makeMeta = () => {
    const created = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')
    const fields = [
        ['com.apple.quicktime.copyright', 'Meta AI'],
        ['com.apple.quicktime.comment', `app=Meta AI&device=Ray-Ban Meta Smart Glasses 2&id=${randomUUID().toUpperCase()}`],
        ['com.apple.quicktime.model', 'Ray-Ban Meta Smart Glasses 2'],
        ['com.apple.quicktime.creationdate', created],
    ] as const
    const keyEntries = Buffer.concat(fields.map(([key]) => { const raw = Buffer.from(key); return Buffer.concat([Buffer.alloc(4), Buffer.from('mdta'), raw]).fill(raw.length + 8, 0, 4) }))
    const count = Buffer.alloc(4); count.writeUInt32BE(fields.length)
    const keysPayload = Buffer.concat([Buffer.alloc(4), count, keyEntries])
    const items = Buffer.concat(fields.map(([, value], index) => { const data = atom('data', Buffer.concat([Buffer.from([0, 0, 0, 1, 0, 0, 0, 0]), Buffer.from(value)])); const item = Buffer.alloc(8); item.writeUInt32BE(data.length + 8, 0); item.writeUInt32BE(index + 1, 4); return Buffer.concat([item, data]) }))
    const hdlr = Buffer.concat([Buffer.alloc(8), Buffer.from('mdta'), Buffer.alloc(14)])
    return atom('meta', Buffer.concat([atom('hdlr', hdlr), atom('keys', keysPayload), atom('ilst', items)]))
}
const rescale = (value: number, oldScale: number, newScale: number) => Math.round(value * newScale / oldScale)
const patchMvhd = (blob: Buffer, newScale: number) => { const body = Buffer.from(blob); const version = body[8]; const scaleOffset = version === 1 ? 28 : 20; const durationOffset = version === 1 ? 32 : 24; const oldScale = body.readUInt32BE(scaleOffset); const oldDuration = version === 1 ? Number(body.readBigUInt64BE(durationOffset)) : body.readUInt32BE(durationOffset); body.writeUInt32BE(newScale, scaleOffset); if (version === 1) body.writeBigUInt64BE(BigInt(rescale(oldDuration, oldScale, newScale)), durationOffset); else body.writeUInt32BE(rescale(oldDuration, oldScale, newScale), durationOffset); return { body, oldScale } }
const patchTkhd = (blob: Buffer, oldScale: number, newScale: number) => { const body = Buffer.from(blob); const offset = body[8] === 1 ? 36 : 28; const value = body[8] === 1 ? Number(body.readBigUInt64BE(offset)) : body.readUInt32BE(offset); if (body[8] === 1) body.writeBigUInt64BE(BigInt(rescale(value, oldScale, newScale)), offset); else body.writeUInt32BE(rescale(value, oldScale, newScale), offset); return body }
const patchElst = (blob: Buffer, oldScale: number, newScale: number) => { const body = Buffer.from(blob); const version = body[8]; let position = 16; const count = body.readUInt32BE(12); for (let index = 0; index < count; index += 1) { if (version === 1) { const value = Number(body.readBigUInt64BE(position)); body.writeBigUInt64BE(BigInt(rescale(value, oldScale, newScale)), position); position += 20 } else { const value = body.readUInt32BE(position); body.writeUInt32BE(rescale(value, oldScale, newScale), position); position += 12 } } return body }
const patchStsd = (blob: Buffer) => { const body = Buffer.from(blob); for (const child of parseAtoms(body, 16)) if (child.kind === 'hvc1') { const name = pascal("'hvc1'"); name.copy(body, child.start + 50); body.fill(0, child.start + 50 + name.length, child.start + 82) } return body }
const rebuildStbl = (data: Buffer, node: Atom) => atom('stbl', Buffer.concat(parseAtoms(data, node.payload, node.start + node.size).map((child) => child.kind === 'stsd' ? patchStsd(data.subarray(child.start, child.start + child.size)) : data.subarray(child.start, child.start + child.size))))
const rebuildMinf = (data: Buffer, node: Atom, isVideo: boolean) => atom('minf', Buffer.concat(parseAtoms(data, node.payload, node.start + node.size).map((child) => child.kind === 'hdlr' ? makeHandler('dhlr', 'alis', 'Core Media Data Handler') : child.kind === 'stbl' && isVideo ? rebuildStbl(data, child) : data.subarray(child.start, child.start + child.size))))
const rebuildMdia = (data: Buffer, node: Atom, isVideo: boolean) => atom('mdia', Buffer.concat(parseAtoms(data, node.payload, node.start + node.size).map((child) => child.kind === 'minf' ? rebuildMinf(data, child, isVideo) : child.kind === 'hdlr' ? makeHandler('mhlr', isVideo ? 'vide' : 'soun', isVideo ? 'Core Media Video' : 'Core Media Audio') : data.subarray(child.start, child.start + child.size))))
const rebuildTrak = (data: Buffer, node: Atom, oldScale: number) => {
    const children = parseAtoms(data, node.payload, node.start + node.size); const mdia = findAtom(children, 'mdia'); const handler = mdia && parseAtoms(data, mdia.payload, mdia.start + mdia.size).find((child) => child.kind === 'hdlr'); const isVideo = Boolean(handler && data.toString('ascii', handler.payload + 8, handler.payload + 12) === 'vide')
    return atom('trak', Buffer.concat(children.map((child) => { const blob = data.subarray(child.start, child.start + child.size); if (child.kind === 'tkhd') return Buffer.concat([patchTkhd(blob, oldScale, 48000), ...(isVideo ? [makeTapt()] : [])]); if (child.kind === 'tapt') return Buffer.alloc(0); if (child.kind === 'edts') return atom('edts', Buffer.concat(parseAtoms(data, child.payload, child.start + child.size).map((entry) => entry.kind === 'elst' ? patchElst(data.subarray(entry.start, entry.start + entry.size), oldScale, 48000) : data.subarray(entry.start, entry.start + entry.size)))); if (child.kind === 'mdia') return rebuildMdia(data, child, isVideo); return blob })))
}
export const restructureMov = async (input: string, output: string) => {
    const data = await readFile(input); const top = parseAtoms(data); const moov = findAtom(top, 'moov'); if (!moov) throw new Error('Video tidak memiliki struktur QuickTime yang valid.')
    const moovChildren = parseAtoms(data, moov.payload, moov.start + moov.size); const mvhd = findAtom(moovChildren, 'mvhd'); if (!mvhd) throw new Error('Video tidak memiliki movie header.')
    const patched = patchMvhd(data.subarray(mvhd.start, mvhd.start + mvhd.size), 48000)
    const rebuiltMoov = atom('moov', Buffer.concat([patched.body, ...moovChildren.filter((child) => !['mvhd', 'udta', 'meta'].includes(child.kind)).map((child) => child.kind === 'trak' ? rebuildTrak(data, child, patched.oldScale) : data.subarray(child.start, child.start + child.size)), makeMeta()]))
    const outputParts = top.map((child) => child.kind === 'ftyp' ? atom('ftyp', Buffer.concat([Buffer.from('qt  '), Buffer.alloc(4), Buffer.from('qt  ')])) : child.kind === 'moov' ? rebuiltMoov : ['free', 'skip'].includes(child.kind) ? Buffer.alloc(0) : data.subarray(child.start, child.start + child.size))
    await writeFile(output, Buffer.concat(outputParts))
}

export const validateVideo = async (path: string) => {
    const ffprobe = await ffmpegPath('ffprobe')
    try {
        await execFileAsync(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,codec_tag_string,width,height', '-of', 'json', path], { maxBuffer: 256 * 1024 })
    } catch {
        throw new Error('Hasil MOV tidak valid untuk diputar. Silakan coba video sumber lain.')
    }
}

export const config = { api: { bodyParser: false } }
export default async function handler(request: VercelRequest, response: VercelResponse) {
    if (request.method !== 'POST') { response.setHeader('Allow', 'POST'); return json(response, 405, 'Method tidak diizinkan.') }
    const directory = await mkdtemp(join(tmpdir(), 'spin-view-'))
    try {
        const { upload, size, originalName } = await parseUpload(request, directory)
        const detected = await detectKind(upload.path, upload.mime, upload.name)
        const { kind } = detected
        const originalResolution = await resolution(upload.path)
        const displayName = originalName || upload.name
        const inputExtension = extname(displayName).toLowerCase()
        const outputExtension = size === 'custom' ? '.jpg' : detected.format
        const outputName = `${basename(displayName, inputExtension).toUpperCase()}_METASPIN_BY_IRFVNNY${outputExtension.toUpperCase()}`
        const outputPath = join(directory, outputName)
        if (kind === 'image' && size === 'custom') {
            await sharp(upload.path).rotate().resize(3024, 4032, { fit: 'cover', position: 'centre' }).withMetadata({ exif: { IFD0: { Make: 'Meta AI', Model: 'Ray-Ban Meta Smart Glasses 2' } } }).composite([{ input: watermark(3024, 4032) }]).jpeg({ quality: 95 }).toFile(outputPath)
        } else {
            const metadata = await sharp(upload.path).metadata()
            if (!metadata.width || !metadata.height) throw new Error('Gagal membaca ukuran foto.')
            const image = sharp(upload.path).withMetadata({ exif: { IFD0: { Make: 'Meta AI', Model: 'Ray-Ban Meta Smart Glasses 2' } } }).composite([{ input: watermark(metadata.width, metadata.height) }])
            if (detected.format === '.png') await image.png().toFile(outputPath)
            else await image.jpeg({ quality: 95 }).toFile(outputPath)
        }
        const outputResolution = await resolution(outputPath)
        const file = await readFile(outputPath)
        const info = Buffer.from(JSON.stringify({ originalName: displayName, format: detected.format.slice(1).toUpperCase(), originalResolution, outputResolution, originalMake: 'Metadata asli', originalModel: 'Metadata asli', fileName: outputName })).toString('base64')
        const contentType = outputExtension === '.png' ? 'image/png' : outputExtension === '.jpg' || outputExtension === '.jpeg' ? 'image/jpeg' : outputExtension === '.mov' ? 'video/quicktime' : upload.mime
        response.status(200); response.setHeader('Content-Type', contentType); response.setHeader('Content-Disposition', `attachment; filename="${outputName}"`); response.setHeader('X-Spin-View-Info', info); response.end(file)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Media gagal diproses.'
        const metadataError = /metadata|ExifTool|BatchCluster|exiftool/i.test(message)
        return json(response, 422, metadataError ? 'Metadata kamera tidak dapat ditulis. Silakan coba lagi.' : message.includes('Input') ? 'Gagal melakukan resize foto.' : message)
    } finally {
        await rm(directory, { recursive: true, force: true })
    }
}