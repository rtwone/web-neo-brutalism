import { useEffect, useRef, useState } from 'react'

type SizeMode = 'original' | 'custom'
type ResultInfo = { originalName: string; format: string; originalResolution: string; outputResolution: string; originalMake: string; originalModel: string; fileName: string }

const maxFileSize = 25 * 1024 * 1024
const maxRequestSize = 4 * 1024 * 1024
const formatSize = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(2)} MB`
const compressForUpload = async (file: File) => {
    if (file.size <= maxRequestSize) return file
    const url = URL.createObjectURL(file)
    try {
        const image = new Image()
        await new Promise<void>((resolve, reject) => { image.onload = () => resolve(); image.onerror = () => reject(new Error('Foto tidak dapat dibaca.')); image.src = url })
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Browser tidak dapat menyiapkan foto.')
        context.drawImage(image, 0, 0)
        for (const quality of [.86, .76, .66, .56]) {
            const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality))
            if (blob && blob.size <= maxRequestSize) return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg', lastModified: file.lastModified })
        }
        throw new Error('Foto terlalu besar untuk diproses. Coba gunakan foto dengan ukuran lebih kecil.')
    } finally { URL.revokeObjectURL(url) }
}
const readJpegCamera = async (file: File) => {
    const bytes = new DataView(await file.slice(0, 2 * 1024 * 1024).arrayBuffer())
    if (bytes.byteLength < 4 || bytes.getUint8(0) !== 0xff || bytes.getUint8(1) !== 0xd8) return { make: 'Tidak tersedia', model: 'Tidak tersedia' }
    let offset = 2
    while (offset + 4 < bytes.byteLength) {
        if (bytes.getUint8(offset) !== 0xff) { offset += 1; continue }
        const marker = bytes.getUint8(offset + 1)
        const length = bytes.getUint16(offset + 2, false)
        if (marker === 0xe1 && bytes.byteLength >= offset + 10 && bytes.getUint32(offset + 4, false) === 0x45786966 && bytes.getUint16(offset + 8, false) === 0) {
            const tiff = offset + 10
            const littleEndian = bytes.getUint16(tiff, false) === 0x4949
            const read16 = (position: number) => bytes.getUint16(position, littleEndian)
            const read32 = (position: number) => bytes.getUint32(position, littleEndian)
            if (read16(tiff + 2) !== 42) return { make: 'Tidak tersedia', model: 'Tidak tersedia' }
            const readIfd = (ifdOffset: number) => {
                const values: Record<number, string> = {}
                const count = read16(tiff + ifdOffset)
                for (let index = 0; index < count; index += 1) {
                    const entry = tiff + ifdOffset + 2 + index * 12
                    const tag = read16(entry)
                    if (tag !== 0x010f && tag !== 0x0110) continue
                    const type = read16(entry + 2)
                    const amount = read32(entry + 4)
                    if (type !== 2 || amount === 0) continue
                    const valueOffset = amount <= 4 ? entry + 8 : tiff + read32(entry + 8)
                    let value = ''
                    for (let charIndex = 0; charIndex < amount && valueOffset + charIndex < bytes.byteLength; charIndex += 1) value += String.fromCharCode(bytes.getUint8(valueOffset + charIndex))
                    values[tag] = value.replace(/\0/g, '').trim()
                }
                return values
            }
            const ifd = readIfd(read32(tiff + 4))
            return { make: ifd[0x010f] || 'Tidak tersedia', model: ifd[0x0110] || 'Tidak tersedia' }
        }
        if (marker === 0xda || length < 2) break
        offset += 2 + length
    }
    return { make: 'Tidak tersedia', model: 'Tidak tersedia' }
}

export function SpinViewPage({ language }: { language: 'id' | 'en' }) {
    const copy = language === 'id' ? {
        description: 'Instagram mengaktifkan efek Spin View saat mendeteksi bahwa sebuah foto berasal dari kacamata Ray-Ban Meta. Informasi tersebut tersimpan dalam data EXIF, bukan pada piksel gambarnya. Masukkan foto Anda, dan alat ini akan mengubah identitas kamera agar Instagram mengenalinya sebagai foto dari perangkat tersebut.',
        preview: 'Preview Foto', upload: 'UPLOAD FOTO', uploadHint: 'JPG, JPEG, PNG · Maks. 25 MB', choose: 'Pilih foto', replace: 'Ganti foto', dropHint: 'Klik atau drop file di sini', remove: 'Hapus foto terpilih', ready: 'Foto siap diproses.',
        output: 'Ukuran Output', original: 'Normal / Original', originalHint: 'Resolusi asli dipertahankan', custom: 'Custom · 3024 × 4032', customHint: 'Crop natural, tanpa stretching', process: 'Proses Foto', processing: 'Memproses...', reading: 'Membaca foto dan menulis metadata...', selectFirst: 'Pilih foto terlebih dahulu.', complete: 'Metadata berhasil ditulis ke file baru.', failed: 'Foto gagal diproses. Silakan coba lagi.', unsupported: 'Format tidak didukung. Gunakan JPG atau PNG.', tooLarge: 'File terlalu besar. Ukuran maksimal adalah 25 MB.',
        camera: 'KAMERA', model: 'MODEL', sizeLabel: 'UKURAN', photo: 'Foto', originalSize: 'Resolusi asli', outputSize: 'Output sesuai pilihan', sizeChanged: 'Ukuran output berubah. Tekan ulang tombol Proses Foto untuk membuat hasil baru.', done: '04 / SELESAI', completeTitle: 'Pemrosesan Selesai', completeHint: 'File baru siap diunduh. File original tetap tidak berubah.', originalFile: 'ORIGINAL', outputFile: 'OUTPUT', cameraResult: 'KAMERA', download: 'Download Hasil', unavailable: 'Tidak tersedia',
    } : {
        description: 'Instagram activates the Spin View effect when it detects that a photo comes from Ray-Ban Meta glasses. This information is stored in the EXIF data, not in the image pixels. Upload your photo, and this tool will change the camera identity so Instagram recognizes it as a photo from that device.',
        preview: 'Photo Preview', upload: 'UPLOAD PHOTO', uploadHint: 'JPG, JPEG, PNG · Max. 25 MB', choose: 'Choose photo', replace: 'Replace photo', dropHint: 'Click or drop a file here', remove: 'Remove selected photo', ready: 'Photo is ready to process.',
        output: 'Output Size', original: 'Normal / Original', originalHint: 'Keep the original resolution', custom: 'Custom · 3024 × 4032', customHint: 'Natural crop, no stretching', process: 'Process Photo', processing: 'Processing...', reading: 'Reading photo and writing metadata...', selectFirst: 'Choose a photo first.', complete: 'Metadata was written to a new file.', failed: 'Photo processing failed. Please try again.', unsupported: 'Unsupported format. Use JPG or PNG.', tooLarge: 'File is too large. Maximum size is 25 MB.',
        camera: 'CAMERA', model: 'MODEL', sizeLabel: 'SIZE', photo: 'Photo', originalSize: 'Original resolution', outputSize: 'Output based on selection', sizeChanged: 'Output size changed. Press Process Photo again to create the new result.', done: '04 / DONE', completeTitle: 'Processing Complete', completeHint: 'The new file is ready to download. The original file remains unchanged.', originalFile: 'ORIGINAL', outputFile: 'OUTPUT', cameraResult: 'CAMERA', download: 'Download Result', unavailable: 'Unavailable',
    }
    const inputRef = useRef<HTMLInputElement>(null)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState('')
    const [size, setSize] = useState<SizeMode>('original')
    const [dragging, setDragging] = useState(false)
    const [status, setStatus] = useState<'idle' | 'processing' | 'error' | 'complete'>('idle')
    const [message, setMessage] = useState('')
    const [originalCamera, setOriginalCamera] = useState({ make: copy.unavailable, model: copy.unavailable })
    const [originalResolution, setOriginalResolution] = useState(copy.originalSize)
    const [result, setResult] = useState<ResultInfo | null>(null)
    const [downloadUrl, setDownloadUrl] = useState('')

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }, [previewUrl, downloadUrl])

    const selectFile = (nextFile: File | undefined) => {
        if (!nextFile) return
        const extension = nextFile.name.toLowerCase().slice(nextFile.name.lastIndexOf('.'))
        const knownExtension = ['.jpg', '.jpeg', '.png'].includes(extension)
        if (!nextFile.type.startsWith('image/') || ['.heic', '.heif', '.mp4', '.mov'].includes(extension) || !knownExtension) {
            setStatus('error'); setMessage(copy.unsupported); return
        }
        if (nextFile.size > maxFileSize) {
            setStatus('error'); setMessage(copy.tooLarge); return
        }
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        const nextUrl = URL.createObjectURL(nextFile)
        setFile(nextFile)
        setPreviewUrl(nextUrl)
        setOriginalCamera({ make: copy.unavailable, model: copy.unavailable })
        setOriginalResolution(copy.originalSize)
        const image = new Image()
        image.onload = () => setOriginalResolution(`${image.naturalWidth} × ${image.naturalHeight}`)
        image.src = nextUrl
        if (/\.(jpe?g)$/i.test(nextFile.name)) void readJpegCamera(nextFile).then(setOriginalCamera)
        setResult(null); setDownloadUrl(''); setStatus('idle'); setMessage(copy.ready)
    }

    const clearFile = () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl)
        if (downloadUrl) URL.revokeObjectURL(downloadUrl)
        setFile(null); setPreviewUrl(''); setDownloadUrl(''); setResult(null); setStatus('idle'); setMessage('')
        setOriginalCamera({ make: copy.unavailable, model: copy.unavailable })
        setOriginalResolution(copy.originalSize)
        if (inputRef.current) inputRef.current.value = ''
    }

    const openFilePicker = () => inputRef.current?.click()

    const changeSize = (nextSize: SizeMode) => {
        if (downloadUrl) URL.revokeObjectURL(downloadUrl)
        setSize(nextSize)
        setResult(null)
        setDownloadUrl('')
        setMessage(copy.sizeChanged)
        setStatus('idle')
    }

    const processFile = async () => {
        if (!file) { setStatus('error'); setMessage(copy.selectFirst); return }
        setStatus('processing'); setMessage(copy.reading)
        try {
            const uploadFile = await compressForUpload(file)
            const formData = new FormData(); formData.append('file', uploadFile); formData.append('size', size); formData.append('originalName', file.name)
            const response = await fetch('/spin-view', { method: 'POST', body: formData })
            if (!response.ok) {
                const body = await response.json().catch(() => ({})) as { error?: string }
                throw new Error(body.error || 'Media gagal diproses.')
            }
            const blob = await response.blob()
            const encodedInfo = response.headers.get('X-Spin-View-Info') || ''
            const encodedBytes = Uint8Array.from(atob(encodedInfo), (character) => character.charCodeAt(0))
            const info = JSON.parse(new TextDecoder().decode(encodedBytes)) as ResultInfo
            setDownloadUrl(URL.createObjectURL(blob)); setResult(info); setStatus('complete'); setMessage(copy.complete)
        } catch (error) {
            setStatus('error'); setMessage(error instanceof Error && error.message.startsWith('Format tidak didukung') ? copy.unsupported : error instanceof Error && error.message.includes('terlalu besar') ? copy.tooLarge : error instanceof Error ? error.message : copy.failed)
        }
    }

    return (
        <main className="spin-view-page">
            <section className="spin-view-heading">
                <div><span className="eyebrow"><span className="eyebrow-mark" aria-hidden="true">✶</span> MEDIA TOOL</span><h1>Spin View<i>✦</i></h1><p>{copy.description}</p></div>
                <div className="spin-view-stamp" aria-hidden="true">META<br /><b>CAM</b><br />02</div>
            </section>

            <section className="spin-view-workspace" aria-label={copy.preview}>
                <div className="spin-view-panel spin-preview-panel">
                    <div className="spin-view-panel-heading"><span>01</span><h2>{copy.preview}</h2></div>
                    <div className={`spin-preview-frame ${size === 'custom' ? 'is-custom' : ''} ${dragging ? 'is-dragging' : ''}`} role="button" tabIndex={0} aria-label={file ? copy.replace : copy.choose} title={file ? copy.replace : copy.choose} onClick={openFilePicker} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(event) => { event.preventDefault(); setDragging(false); selectFile(event.dataTransfer.files[0]) }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openFilePicker() } }}>{previewUrl ? <img className={size === 'custom' ? 'is-custom' : ''} src={previewUrl} alt={copy.preview} /> : <div className="spin-empty-preview"><svg className="spin-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg><b>{copy.upload.split(' ')[0]}<br />{copy.upload.split(' ')[1]}</b><small>{copy.uploadHint}</small></div>}</div>
                    <input ref={inputRef} id="spin-file" type="file" accept="image/jpeg,image/png" onChange={(event) => selectFile(event.target.files?.[0])} />
                    {file && <div className="spin-file-row"><div><strong>{file.name}</strong><small>{formatSize(file.size)} · {copy.photo}</small></div><button type="button" className="text-link" onClick={clearFile}>{copy.remove}</button></div>}
                    {file && <div className="spin-camera-label"><div><span>{copy.camera}</span><s>{result?.originalMake || originalCamera.make}</s><strong>Meta AI</strong></div><div><span>{copy.model}</span><s>{result?.originalModel || originalCamera.model}</s><strong>Ray-Ban Meta Smart Glasses 2</strong></div><div><span>{copy.sizeLabel}</span><s>{result?.originalResolution || originalResolution}</s><strong>{result?.outputResolution || (size === 'custom' ? '3024 × 4032' : originalResolution)}</strong></div></div>}
                </div>

                <div className="spin-view-panel spin-options-panel">
                    <div className="spin-view-panel-heading spin-options-heading"><span>02</span><h2>{copy.output}</h2></div>
                    <div className="spin-size-options">
                        <label className={size === 'original' ? 'selected' : ''}><input type="radio" name="size" checked={size === 'original'} onChange={() => changeSize('original')} /><span><b>{copy.original}</b><small>{copy.originalHint}</small></span></label>
                        <label className={size === 'custom' ? 'selected' : ''}><input type="radio" name="size" checked={size === 'custom'} onChange={() => changeSize('custom')} /><span><b>{copy.custom}</b><small>{copy.customHint}</small></span></label>
                    </div>
                    <button type="button" className="button primary spin-process-button" disabled={status === 'processing'} onClick={processFile}>{status === 'processing' ? copy.processing : copy.process} <span>↗</span></button>
                    {message && <p className={`spin-message ${status === 'error' ? 'error' : ''}`} role="status">{message}</p>}
                </div>
            </section>

            {result && downloadUrl && <section className="spin-result" aria-live="polite"><div className="spin-result-heading"><span>{copy.done}</span><h2>{copy.completeTitle}</h2><p>{copy.completeHint}</p></div><div className="spin-result-actions"><a className="button primary" href={downloadUrl} download={result.fileName}>{copy.download} <span>↓</span></a></div></section>}
        </main>
    )
}
