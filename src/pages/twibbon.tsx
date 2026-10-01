import { useCallback, useEffect, useRef, useState } from 'react'
import { twibbonConfig as defaultTwibbonConfig } from '../content'
import type { TwibbonConfig } from '../content'

export function TwibbonPage({ config = defaultTwibbonConfig }: { config?: TwibbonConfig }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const templateRef = useRef<HTMLImageElement | null>(null)
    const photoRef = useRef<HTMLImageElement | null>(null)
    const dragRef = useRef({ active: false, x: 0, y: 0, photoX: 0, photoY: 0 })
    const [photoUrl, setPhotoUrl] = useState<string | null>(null)
    const [fileName, setFileName] = useState('')
    const [zoom, setZoom] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [captionFields, setCaptionFields] = useState<Record<string, string>>({})
    const [feedback, setFeedback] = useState('')
    const [isFeedbackVisible, setIsFeedbackVisible] = useState(false)
    const [actionError, setActionError] = useState<'download' | 'copy' | null>(null)
    const [captionPopupOpen, setCaptionPopupOpen] = useState(false)
    const renderCanvasRef = useRef<() => void>(() => { })

    const placeholderNames = Array.from(new Set(
        Array.from(config.captionTemplate.matchAll(/\{([^{}]+)\}/g), ([, name]) => name.trim()).filter(Boolean),
    ))

    const resolvedCaption = config.captionTemplate.replace(/\{([^{}]+)\}/g, (_match, name: string) => {
        const key = name.trim()
        return captionFields[key] || `{${name}}`
    })

    const hasEmptyCaptionField = placeholderNames.some((name) => !captionFields[name]?.trim())
    const captionParts = config.captionTemplate.split(/(\{[^{}]+\})/g)
    const formattedCaption = captionParts.map((part, index) => {
        const placeholder = part.match(/^\{([^{}]+)\}$/)
        if (!placeholder) return <span key={`${part}-${index}`}>{part}</span>
        const key = placeholder[1].trim()
        return <strong key={`${part}-${index}`}>{captionFields[key] || part}</strong>
    })

    const renderCanvas = useCallback(() => {
        const canvas = canvasRef.current
        const template = templateRef.current
        if (!canvas || !template?.naturalWidth || !template.naturalHeight) return

        canvas.width = template.naturalWidth
        canvas.height = template.naturalHeight
        const context = canvas.getContext('2d')
        if (!context) return
        context.clearRect(0, 0, canvas.width, canvas.height)

        if (photoRef.current?.complete && photoRef.current.naturalWidth) {
            const photo = photoRef.current
            const coverScale = Math.max(canvas.width / photo.naturalWidth, canvas.height / photo.naturalHeight) * zoom
            const photoWidth = photo.naturalWidth * coverScale
            const photoHeight = photo.naturalHeight * coverScale
            const photoX = (canvas.width - photoWidth) / 2 + position.x
            const photoY = (canvas.height - photoHeight) / 2 + position.y
            context.drawImage(photo, photoX, photoY, photoWidth, photoHeight)
        }

        context.drawImage(template, 0, 0, canvas.width, canvas.height)
    }, [position, zoom])

    useEffect(() => {
        renderCanvasRef.current = renderCanvas
    }, [renderCanvas])

    useEffect(() => {
        const template = new Image()
        template.onload = () => {
            templateRef.current = template
            renderCanvasRef.current()
        }
        template.src = config.templatePath
    }, [config.templatePath])

    useEffect(() => {
        renderCanvas()
    }, [photoUrl, renderCanvas])

    useEffect(() => {
        if (!feedback) {
            setIsFeedbackVisible(false)
            return
        }

        setIsFeedbackVisible(true)
        const dismissTimer = window.setTimeout(() => {
            setIsFeedbackVisible(false)
        }, 2800)

        return () => window.clearTimeout(dismissTimer)
    }, [feedback])

    useEffect(() => {
        if (!feedback || isFeedbackVisible) return

        const clearTimer = window.setTimeout(() => {
            setFeedback('')
        }, 260)

        return () => window.clearTimeout(clearTimer)
    }, [feedback, isFeedbackVisible])

    useEffect(() => () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl)
    }, [photoUrl])

    const handleFile = (file: File | undefined) => {
        if (!file) return
        if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setFeedback('Format foto tidak didukung. Gunakan JPG atau PNG.')
            return
        }
        if (file.size > 15 * 1024 * 1024) {
            setFeedback('Ukuran foto terlalu besar. Maksimal 15 MB.')
            return
        }
        if (photoUrl) URL.revokeObjectURL(photoUrl)
        const nextUrl = URL.createObjectURL(file)
        const photo = new Image()
        photo.onload = () => {
            photoRef.current = photo
            setPhotoUrl(nextUrl)
            setFileName(file.name)
            setZoom(1)
            setPosition({ x: 0, y: 0 })
            setActionError(null)
            setFeedback('Foto siap diatur.')
        }
        photo.src = nextUrl
    }

    const clearPhoto = () => {
        if (photoUrl) URL.revokeObjectURL(photoUrl)
        photoRef.current = null
        setPhotoUrl(null)
        setFileName('')
        setZoom(1)
        setPosition({ x: 0, y: 0 })
        setActionError(null)
        setFeedback('')
    }

    const resetPhoto = () => {
        setZoom(1)
        setPosition({ x: 0, y: 0 })
    }

    const changeZoom = (amount: number) => setZoom((value) => Math.min(3, Math.max(.5, Number((value + amount).toFixed(2)))))

    const pointerPosition = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const bounds = canvas.getBoundingClientRect()
        return {
            x: (event.clientX - bounds.left) * (canvas.width / bounds.width),
            y: (event.clientY - bounds.top) * (canvas.height / bounds.height),
        }
    }

    const beginDrag = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!photoUrl) return
        const point = pointerPosition(event)
        dragRef.current = { active: true, x: point.x, y: point.y, photoX: position.x, photoY: position.y }
        event.currentTarget.setPointerCapture(event.pointerId)
    }

    const dragPhoto = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!dragRef.current.active) return
        const point = pointerPosition(event)
        setPosition({
            x: dragRef.current.photoX + point.x - dragRef.current.x,
            y: dragRef.current.photoY + point.y - dragRef.current.y,
        })
    }

    const endDrag = () => { dragRef.current.active = false }

    const canvasBlob = () => new Promise<Blob | null>((resolve) => {
        const canvas = canvasRef.current
        if (!canvas) {
            resolve(null)
            return
        }
        canvas.toBlob(resolve, 'image/png', 1)
    })

    const copyCaption = async (value: string) => {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(value)
                return true
            }
            const textarea = document.createElement('textarea')
            textarea.value = value
            textarea.style.position = 'fixed'
            textarea.style.opacity = '0'
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            textarea.remove()
            return true
        } catch {
            return false
        }
    }

    const downloadImage = (blob: Blob) => {
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = config.outputFileName
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    const rejectAction = (action: 'download') => {
        setFeedback('Upload foto terlebih dahulu sebelum melanjutkan.')
        setActionError(null)
        requestAnimationFrame(() => setActionError(action))
        window.setTimeout(() => setActionError(null), 450)
    }

    const rejectCaptionCopy = () => {
        setFeedback('Lengkapi semua field caption terlebih dahulu.')
        setActionError(null)
        requestAnimationFrame(() => setActionError('copy'))
        window.setTimeout(() => setActionError(null), 450)
    }

    const copyResolvedCaption = async () => {
        if (hasEmptyCaptionField) {
            rejectCaptionCopy()
            return
        }
        const copied = await copyCaption(resolvedCaption)
        setFeedback(copied ? 'Caption berhasil disalin.' : 'Caption gagal disalin, silakan salin manual.')
    }

    const download = async () => {
        if (!photoUrl) {
            rejectAction('download')
            return
        }
        const blob = await canvasBlob()
        if (!blob) {
            setFeedback('Gagal membuat twibbon. Silakan coba lagi.')
            return
        }
        downloadImage(blob)
        setFeedback('Twibbon berhasil dibuat dan diunduh.')
    }

    return (
        <main className="twibbon-page">
            <header className="twibbon-header">
                <a className="twibbon-brand" href="/twibbon" aria-label="Twibbon Maker home">
                    <span>HIMATIKA UNIJA | LKMM-TD<span className="twibbon-brand-mark">'26</span></span>
                    <small>TWIBBON MAKER</small>
                </a>
                <a className="twibbon-back-link" href="https://irfanhariyanto.my.id/">Kunjungi Developer <span aria-hidden="true">↗</span></a>
            </header>
            {feedback && (
                <div className={`twibbon-alert ${isFeedbackVisible ? 'visible' : 'hidden'}`} role="status" aria-live="polite">
                    <span>{feedback}</span>
                    <button type="button" aria-label="Tutup notifikasi" onClick={() => setIsFeedbackVisible(false)}>×</button>
                </div>
            )}
            <section className="twibbon-hero">
                <div>
                    <span className="eyebrow">{config.eyebrow}</span>
                    <h1>{config.title} <i>✦</i></h1>
                    <p>{config.subtitle}</p>
                </div>
                <div className="twibbon-hero-sticker" aria-hidden="true">MAKE<br />IT<br /><b>YOURS</b></div>
            </section>

            <section className="twibbon-editor" aria-label="Twibbon generator">
                <div className="twibbon-panel twibbon-settings">
                    <div className="twibbon-panel-heading"><span>01</span><h2>Upload & Atur Foto</h2></div>
                    <label className="upload-dropzone" htmlFor="twibbon-photo">
                        <span className="upload-icon" aria-hidden="true">＋</span>
                        <strong>{photoUrl ? 'Foto sudah dipilih' : 'Upload Foto'}</strong>
                        <small>PNG, JPG, JPEG · maksimal 15 MB</small>
                        <span className="button primary upload-button">{photoUrl ? 'Ganti Foto' : 'Pilih Foto'}</span>
                        <input id="twibbon-photo" type="file" accept="image/png,image/jpeg,image/jpg" onChange={(event) => handleFile(event.target.files?.[0])} />
                    </label>

                    <div className="twibbon-file-row">
                        <span>{fileName || 'Belum ada foto'}</span>
                        {photoUrl && <button type="button" className="text-link" onClick={clearPhoto}>Hapus Foto</button>}
                    </div>

                    <div className="twibbon-control">
                        <div className="twibbon-control-label"><label htmlFor="zoom">Zoom Foto</label><b>{zoom.toFixed(2)}x</b></div>
                        <div className="zoom-controls"><button type="button" aria-label="Perkecil foto" onClick={() => changeZoom(-.1)}>−</button><input id="zoom" type="range" min=".5" max="3" step=".01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><button type="button" aria-label="Perbesar foto" onClick={() => changeZoom(.1)}>+</button></div>
                    </div>
                    <button type="button" className="reset-button" onClick={resetPhoto}>Reset Posisi & Zoom</button>
                    <p className="drag-hint">{photoUrl ? 'Drag foto langsung di preview untuk mengatur posisinya.' : 'Upload foto untuk mulai mengatur twibbon.'}</p>
                </div>

                <div className="twibbon-panel twibbon-preview-panel">
                    <div className="twibbon-panel-heading"><span>02</span><h2>Live Preview</h2></div>
                    <div className="twibbon-canvas-wrap">
                        <canvas ref={canvasRef} onPointerDown={beginDrag} onPointerMove={dragPhoto} onPointerUp={endDrag} onPointerCancel={endDrag} aria-label="Live preview twibbon" />
                        {!photoUrl && <div className="canvas-empty-state"><b>TWIBBON<br />TEMPLATE</b><span>Upload foto kamu<br />untuk melihat hasil</span></div>}
                    </div>
                    <small className="preview-note">Template selalu berada di atas foto · drag untuk menggeser</small>
                </div>
            </section>

            <section className="twibbon-caption-section">
                <div className="twibbon-section-label"><span>03</span><h2>Caption Template</h2></div>
                <div className="caption-card">
                    <div className="caption-preview" role="button" tabIndex={0} aria-label="Buka caption lengkap" onClick={() => setCaptionPopupOpen(true)} onKeyDown={(event) => event.key === 'Enter' && setCaptionPopupOpen(true)}>{formattedCaption}</div>
                    <p className="caption-help">Isi field di bawah untuk mengganti placeholder pada caption. Teks caption akan berubah otomatis.</p>
                    {placeholderNames.length > 0 && (
                        <div className="caption-fields" aria-label="Data caption">
                            {placeholderNames.map((name) => (
                                <label className="caption-field" key={name}>
                                    <span>{`Isi ${name}`}</span>
                                    <input
                                        type="text"
                                        required
                                        value={captionFields[name] || ''}
                                        placeholder={`Masukkan ${name}`}
                                        onChange={(event) => setCaptionFields((fields) => ({ ...fields, [name]: event.target.value }))}
                                    />
                                </label>
                            ))}
                        </div>
                    )}
                    <button type="button" className={`button secondary caption-copy-button ${hasEmptyCaptionField ? 'is-disabled' : ''} ${actionError === 'copy' ? 'shake-error' : ''}`} data-disabled={hasEmptyCaptionField} onClick={copyResolvedCaption}>Salin Caption <span>↗</span></button>
                </div>
            </section>

            <section className="twibbon-actions" aria-label="Twibbon actions">
                <div><span className="eyebrow">READY TO SHARE</span><p>{feedback || 'Sudah siap? Download, salin caption dan bagikan hasil twibbon kamu.'}</p></div>
                <div className="twibbon-action-buttons"><button type="button" className={`button primary ${actionError === 'download' ? 'shake-error' : ''}`} onClick={download}>Download Twibbon <span>↓</span></button></div>
            </section>
            {captionPopupOpen && (
                <div className="caption-popup-backdrop" role="presentation" onClick={() => setCaptionPopupOpen(false)}>
                    <section className="caption-popup" role="dialog" aria-modal="true" aria-labelledby="caption-popup-title" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="caption-popup-close" aria-label="Tutup caption" onClick={() => setCaptionPopupOpen(false)}>×</button>
                        <span className="eyebrow">FULL CAPTION</span>
                        <h2 id="caption-popup-title">Caption siap pakai</h2>
                        <div className="caption-popup-text">{formattedCaption}</div>
                        <button type="button" className={`button primary ${hasEmptyCaptionField ? 'is-disabled' : ''} ${actionError === 'copy' ? 'shake-error' : ''}`} onClick={copyResolvedCaption}>Salin Caption <span>↗</span></button>
                    </section>
                </div>
            )}
        </main>
    )
}
