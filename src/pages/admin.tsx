import { useEffect, useState } from 'react'
import { defaultContent } from '../content'
import type { JourneyEntry, SiteContent } from '../content'
import type { Project, Skill } from '../data'
import { getSupabaseBrowser } from '../../lib/db'
import './admin.css'

const defaultSkill = (): Skill => ({
    name: '',
    group: 'Development',
    mark: '',
    icon: 'javascript.svg',
    darkIcon: '',
    color: 'yellow',
})

const defaultJourneyEntry = (): JourneyEntry => ({
    period: '',
    title: '',
    subtitle: '',
    tone: 'yellow',
    badge: '',
})

const defaultProject = (category: 'Development' | 'Design' | 'Other' = 'Development'): Project => {
    if (category === 'Design') {
        return {
            id: Date.now() + Math.random(),
            category: 'Design',
            image: '',
            fallbackColor: '#f8d34f',
            url: '',
        }
    }

    return {
        id: Date.now() + Math.random(),
        category,
        title: '',
        type: { id: '', en: '' },
        year: '',
        image: '',
        fallbackColor: '#8ab4f0',
        description: { id: '', en: '' },
        tech: [],
        role: { id: '', en: '' },
        github: '',
        url: '',
    }
}

const convertToWebp = async (file: File) => {
    const sourceUrl = URL.createObjectURL(file)
    try {
        const image = new Image()
        await new Promise<void>((resolve, reject) => {
            image.onload = () => resolve()
            image.onerror = () => reject(new Error('Gambar tidak dapat dibaca oleh browser.'))
            image.src = sourceUrl
        })
        const canvas = document.createElement('canvas')
        canvas.width = image.naturalWidth
        canvas.height = image.naturalHeight
        const context = canvas.getContext('2d')
        if (!context) throw new Error('Browser tidak dapat menyiapkan gambar.')
        context.drawImage(image, 0, 0)
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', 0.86))
        if (!blob) throw new Error('Gambar gagal dikompres menjadi WebP.')
        return new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.webp`, { type: 'image/webp', lastModified: file.lastModified })
    } finally {
        URL.revokeObjectURL(sourceUrl)
    }
}

const uploadToSupabase = async (file: File, folder: string, convertImage = true) => {
    const supabase = getSupabaseBrowser()
    const uploadFile = convertImage ? await convertToWebp(file) : file
    const sanitizedName = uploadFile.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9_.-]/g, '')
    const objectPath = `${folder}/${Date.now()}-${sanitizedName}`
    const { data, error } = await supabase.storage.from('portfolio-assets').upload(objectPath, uploadFile, {
        cacheControl: '3600',
        upsert: true,
        contentType: convertImage ? 'image/webp' : 'image/svg+xml',
    })

    if (error) throw error
    const publicUrl = supabase.storage.from('portfolio-assets').getPublicUrl(data?.path || objectPath).data.publicUrl
    return publicUrl
}

const iconSource = (icon: string) => icon.startsWith('http') || icon.startsWith('/') ? icon : `/icons/${icon}`
const cloudIconUrl = (icon: string) => {
    if (icon.startsWith('http')) return icon
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    if (!baseUrl) return iconSource(icon)
    const filename = icon.replace(/^\/icons\//, '')
    return `${baseUrl}/storage/v1/object/public/portfolio-assets/portfolio/icons/${filename}`
}
const cloudImageUrl = (image: string) => {
    if (!image.startsWith('/images/')) return image
    const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
    if (!baseUrl) return image
    const webpPath = image.replace(/^\/images\//, '').replace(/\.[^.]+$/, '.webp')
    return `${baseUrl}/storage/v1/object/public/portfolio-assets/portfolio/images/${webpPath}`
}
const normalizeContentImages = (value: SiteContent): SiteContent => ({
    ...value,
    aboutImage: cloudImageUrl(value.aboutImage),
    skills: value.skills.map((skill) => ({ ...skill, icon: cloudIconUrl(skill.icon), darkIcon: skill.darkIcon ? cloudIconUrl(skill.darkIcon) : skill.darkIcon })),
    projects: value.projects.map((project) => ({ ...project, image: cloudImageUrl(project.image) })),
})

type AdminIconName = 'trash' | 'close' | 'plus' | 'save' | 'arrow' | 'logout'

function AdminIcon({ name }: { name: AdminIconName }) {
    const paths = {
        trash: <><path d="M4 7h16" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="m6 7 1 13h10l1-13" /><path d="M9 7V4h6v3" /></>,
        close: <><path d="m6 6 12 12" /><path d="m18 6-12 12" /></>,
        plus: <><path d="M12 5v14" /><path d="M5 12h14" /></>,
        save: <><path d="M5 4h12l2 2v14H5z" /><path d="M8 4v6h8V4" /><path d="M8 20v-6h8v6" /></>,
        arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
        logout: <><path d="M10 4H5v16h5" /><path d="M14 8l4 4-4 4" /><path d="M18 12H9" /></>,
    }
    return <svg className="admin-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" aria-hidden="true">{paths[name]}</svg>
}

type SocialIconName = 'mail' | 'github' | 'instagram' | 'linkedin' | 'whatsapp' | 'x' | 'tiktok' | 'youtube' | 'facebook' | 'telegram' | 'discord' | 'threads' | 'pinterest' | 'reddit' | 'snapchat'

function SocialIcon({ name }: { name: SocialIconName }) {
    const paths = {
        mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
        github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3 0 6.7-1.6 6.7-7A5.4 5.4 0 0 0 19.6 4 5 5 0 0 0 19.5 1S18.3.6 15 2.8a13.4 13.4 0 0 0-6 0C5.7.6 4.5 1 4.5 1a5 5 0 0 0-.1 3A5.4 5.4 0 0 0 3.3 7.5c0 5.4 3.4 7 6.7 7a4.8 4.8 0 0 0-1 3.5v4" />,
        instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" /></>,
        linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
        whatsapp: <><path d="M20 4a9.5 9.5 0 0 0-15 11L4 20l5-1a9.5 9.5 0 1 0 11-15Z" /><path d="M8 8c1 4 4 7 8 8" /></>,
        x: <><path d="M5 4 19 20" /><path d="M19 4 5 20" /></>,
        tiktok: <path d="M14 4v10a4 4 0 1 1-3-3.9M14 4c1 3 3 4 5 4" />,
        youtube: <><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" /></>,
        facebook: <path d="M14 21v-8h3l.5-3H14V8c0-1 .4-2 2-2h1.5V3.2A18 18 0 0 0 15 3c-3 0-5 2-5 5v2H7v3h3v8" />,
        telegram: <><path d="m21 3-7 18-4-7-7-3Z" /><path d="m10 14 4-4" /></>,
        discord: <><path d="M7 7a14 14 0 0 1 10 0 15 15 0 0 1 3 10 14 14 0 0 1-5 2l-1-2M7 7a15 15 0 0 0-3 10 14 14 0 0 0 5 2l1-2" /><circle cx="9" cy="12" r="1" /><circle cx="15" cy="12" r="1" /></>,
        threads: <path d="M18 9c-1-3-4-4-7-4-4 0-6 2-6 5 0 4 4 5 7 5 4 0 6-2 6-5 0-4-3-6-7-6" />,
        pinterest: <path d="M12 3a8 8 0 0 0-3 15l1-4c-1-1-1-2-1-3 0-3 2-5 5-5 2 0 4 1 4 4 0 3-1 5-3 5-1 0-2-1-2-2l1-3c0-1-1-2-2-2-2 0-3 2-3 4 0 1 0 2 1 3l-1 4a8 8 0 1 0 3-16Z" />,
        reddit: <><circle cx="12" cy="13" r="8" /><path d="M8 14c1 2 7 2 8 0" /><circle cx="9" cy="11" r="1" /><circle cx="15" cy="11" r="1" /><path d="M16 6c-2-1-4-1-5 0" /></>,
        snapchat: <path d="M12 4c-3 0-4 2-4 5 0 2-1 3-3 4 1 1 3 1 4 2 1 2 2 3 3 3s2-1 3-3c1-1 3-1 4-2-2-1-3-2-3-4 0-3-1-5-4-5Z" />,
    }
    return <svg className="admin-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

export function AdminPage() {
    type EditorTarget = { section: 'social' | 'skill' | 'project' | 'education' | 'experience' | 'endpoint'; index: number } | null
    const adminSection = window.location.pathname.split('/')[2] || 'dashboard'
    const pageTitle = adminSection === 'dashboard' ? 'Dashboard' : ({ about: 'About & Contact', education: 'Education', experience: 'Experience', socials: 'Social media', skills: 'Skills', projects: 'Projects', endpoints: 'Endpoints' }[adminSection] || 'Dashboard')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [content, setContent] = useState<SiteContent>(() => normalizeContentImages(defaultContent))
    const [authenticated, setAuthenticated] = useState(false)
    const [authChecked, setAuthChecked] = useState(false)
    const [message, setMessage] = useState('')
    const [uploading, setUploading] = useState(false)
    const [editorTarget, setEditorTarget] = useState<EditorTarget>(null)
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ label: string; remove: () => void } | null>(null)
    const [mobileNavOpen, setMobileNavOpen] = useState(false)

    const isEditorOpen = (section: NonNullable<EditorTarget>['section'], index: number) => editorTarget?.section === section && editorTarget.index === index

    const loadContent = async () => {
        const response = await fetch('/api/admin/content')
        const data = await response.json() as { content?: SiteContent }
        if (data.content) setContent(normalizeContentImages({ ...defaultContent, ...data.content }))
    }

    useEffect(() => {
        void loadContent()
        fetch('/api/admin/login', { credentials: 'include' })
            .then((response) => response.json())
            .then((data: { authenticated?: boolean }) => { if (data.authenticated) setAuthenticated(true) })
            .catch(() => undefined)
            .finally(() => setAuthChecked(true))
    }, [])

    useEffect(() => {
        if (adminSection === 'dashboard') return
        const target = document.getElementById(`admin-${adminSection}`)
        if (target) window.requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
    }, [adminSection])

    const login = async (event: React.FormEvent) => {
        event.preventDefault()
        const response = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ password }),
        })
        if (!response.ok) { setMessage('Password salah.'); return }
        setAuthenticated(true)
        setMessage('Login berhasil.')
    }

    const logout = async () => {
        await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
        setAuthenticated(false)
        setPassword('')
        setMessage('')
    }

    const updateContent = (nextContent: SiteContent) => setContent(nextContent)

    const isJourneyItemEmpty = (item: JourneyEntry) => !item.title.trim() && !item.period.trim() && !item.subtitle.trim() && !(item.badge ?? '').trim()
    const isSocialItemEmpty = (item: SiteContent['socials'][number]) => !item.label.trim() && !item.url.trim()
    const isSkillItemEmpty = (item: Skill) => !item.name.trim() && !item.mark.trim()
    const isProjectItemEmpty = (item: Project) => {
        if (item.category === 'Design') {
            return !item.image.trim() && !(item.url ?? '').trim()
        }

        return !item.title.trim() && !item.year.trim() && !item.type.id.trim() && !item.type.en.trim() && !item.description.id.trim() && !item.description.en.trim() && !item.role.id.trim() && !item.role.en.trim() && item.tech.length === 0 && !(item.github ?? '').trim() && !(item.url ?? '').trim()
    }

    const closeEditor = (section: NonNullable<EditorTarget>['section'], index: number) => {
        setContent((currentContent) => {
            let nextContent = currentContent

            if (section === 'education' || section === 'experience') {
                const current = currentContent[section][index]
                if (current && isJourneyItemEmpty(current)) {
                    nextContent = { ...currentContent, [section]: currentContent[section].filter((_, itemIndex) => itemIndex !== index) }
                }
            }

            if (section === 'social') {
                const current = currentContent.socials[index]
                if (current && isSocialItemEmpty(current)) {
                    nextContent = { ...currentContent, socials: currentContent.socials.filter((_, itemIndex) => itemIndex !== index) }
                }
            }

            if (section === 'skill') {
                const current = currentContent.skills[index]
                if (current && isSkillItemEmpty(current)) {
                    nextContent = { ...currentContent, skills: currentContent.skills.filter((_, itemIndex) => itemIndex !== index) }
                }
            }

            if (section === 'project') {
                const current = currentContent.projects[index]
                if (current && isProjectItemEmpty(current)) {
                    nextContent = { ...currentContent, projects: currentContent.projects.filter((_, itemIndex) => itemIndex !== index) }
                }
            }

            return nextContent
        })
        setEditorTarget(null)
    }

    const confirmDelete = (label: string, remove: () => void) => {
        setDeleteConfirmation({ label, remove })
    }

    const addSocial = () => {
        const index = content.socials.length
        setContent((currentContent) => ({ ...currentContent, socials: [...currentContent.socials, { icon: 'mail', label: '', url: '' }] }))
        setEditorTarget({ section: 'social', index })
    }

    const addSkill = () => {
        const index = content.skills.length
        setContent((currentContent) => ({ ...currentContent, skills: [...currentContent.skills, defaultSkill()] }))
        setEditorTarget({ section: 'skill', index })
    }

    const addProject = () => {
        const index = content.projects.length
        setContent((currentContent) => ({ ...currentContent, projects: [...currentContent.projects, defaultProject('Development')] }))
        setEditorTarget({ section: 'project', index })
    }

    const updateProjectAt = (index: number, updater: (project: Project) => Project) => {
        const updated = [...content.projects]
        updated[index] = updater(updated[index])
        updateContent({ ...content, projects: updated })
    }

    const addJourneyEntry = (section: 'education' | 'experience') => {
        const index = content[section].length
        setContent((currentContent) => ({ ...currentContent, [section]: [...currentContent[section], defaultJourneyEntry()] }))
        setEditorTarget({ section, index })
    }

    const uploadImage = async (file: File, setter: (value: string) => void) => {
        if (!file) return
        setUploading(true)
        setMessage('Mengunggah ke Supabase Storage...')
        try {
            const url = await uploadToSupabase(file, 'portfolio')
            setter(url)
            setMessage('Upload berhasil. Simpan untuk menerapkan perubahan.')
        } catch {
            setMessage('Upload gagal. Pastikan bucket portfolio-assets sudah dibuat public.')
        } finally {
            setUploading(false)
        }
    }

    const uploadSvg = async (file: File, setter: (value: string) => void) => {
        if (!file || (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg'))) {
            setMessage('Icon harus berupa file SVG.')
            return
        }
        setUploading(true)
        setMessage('Mengunggah icon SVG ke Supabase Storage...')
        try {
            const url = await uploadToSupabase(file, 'portfolio/icons', false)
            setter(url)
            setMessage('Icon SVG berhasil diunggah. Simpan untuk menerapkan perubahan.')
        } catch {
            setMessage('Upload icon gagal. Pastikan bucket portfolio-assets sudah dibuat public.')
        } finally {
            setUploading(false)
        }
    }

    const save = async (event: React.FormEvent) => {
        event.preventDefault()
        try {
            const response = await fetch('/api/admin/content', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(content),
            })
            if (!response.ok) throw new Error()
            setMessage('Perubahan tersimpan di Supabase dan akan tampil di halaman publik.')
        } catch {
            setMessage('Gagal menyimpan. Cek koneksi Supabase dan data yang diisi.')
        }
    }

    if (!authChecked) return (
        <main className={`admin-page admin-route-${adminSection}`}>
            <div className="admin-loading" aria-live="polite">
                <span className="eyebrow">ADMIN / PORTFOLIO CMS</span>
                <div className="admin-loading-bar" />
                <p>Memulihkan sesi...</p>
            </div>
        </main>
    )

    if (!authenticated) return (
        <main className={`admin-page admin-route-${adminSection}`}>
            <form className="admin-login" onSubmit={login}>
                <span className="eyebrow">ADMIN / PORTFOLIO CMS</span>
                <h1>Panel Admin</h1>
                <p>Masuk untuk mengelola konten portfolio.</p>
                <label>
                    Password
                    <div className="admin-password-field">
                        <input autoFocus type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} />
                        <button type="button" className="admin-password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}>
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" />
                                <circle cx="12" cy="12" r="3" />
                                {showPassword && <path d="M3 3l18 18" />}
                            </svg>
                        </button>
                    </div>
                </label>
                <button className="button primary" type="submit">Masuk <AdminIcon name="arrow" /></button>
                {message && <p className="admin-message">{message}</p>}
            </form>
        </main>
    )

    return (
        <main className={`admin-page admin-shell admin-route-${adminSection}`}>
            <div className="admin-dashboard">
                <button type="button" className="admin-mobile-nav-toggle" onClick={() => setMobileNavOpen(true)} aria-label="Buka navigasi admin"><span /> <span /> <span /></button>
                <div className={`admin-mobile-backdrop ${mobileNavOpen ? 'is-open' : ''}`} onClick={() => setMobileNavOpen(false)} />
                <aside className={`admin-sidebar ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Navigasi admin">
                    <div className="admin-sidebar-brand"><span className="admin-brand-mark">IH</span><div><strong>Portfolio</strong><small>Control center</small></div><button type="button" className="admin-mobile-nav-close" onClick={() => setMobileNavOpen(false)} aria-label="Tutup navigasi admin"><AdminIcon name="close" /></button></div>
                    <span className="admin-sidebar-label">Navigasi</span>
                    <a className={`admin-sidebar-link ${adminSection === 'dashboard' ? 'is-active' : ''}`} href="/admin"><span className="admin-sidebar-icon">01</span><strong>Dashboard</strong></a>
                    <span className="admin-sidebar-label">Konten</span>
                    <a className={`admin-sidebar-link ${adminSection === 'about' ? 'is-active' : ''}`} href="/admin/about"><span className="admin-sidebar-icon">02</span><strong>About & Contact</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'education' ? 'is-active' : ''}`} href="/admin/education"><span className="admin-sidebar-icon">03</span><strong>Education</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'experience' ? 'is-active' : ''}`} href="/admin/experience"><span className="admin-sidebar-icon">04</span><strong>Experience</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'socials' ? 'is-active' : ''}`} href="/admin/socials"><span className="admin-sidebar-icon">05</span><strong>Social media</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'skills' ? 'is-active' : ''}`} href="/admin/skills"><span className="admin-sidebar-icon">06</span><strong>Skills</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'projects' ? 'is-active' : ''}`} href="/admin/projects"><span className="admin-sidebar-icon">07</span><strong>Projects</strong></a>
                    <a className={`admin-sidebar-link ${adminSection === 'endpoints' ? 'is-active' : ''}`} href="/admin/endpoints"><span className="admin-sidebar-icon">08</span><strong>Endpoints</strong></a>
                    <span className="admin-sidebar-label">Sistem</span>
                    <a className="admin-sidebar-link" href="/"><span className="admin-sidebar-icon">↗</span><strong>Lihat portfolio</strong></a>
                    <button type="button" className="admin-sidebar-link admin-logout-link" onClick={() => void logout()}><span className="admin-sidebar-icon"><AdminIcon name="logout" /></span><strong>Logout</strong></button>
                </aside>
                <form id="admin-top" className="admin-editor" onSubmit={save}>
                    <header className="admin-header">
                        <div>
                            <span className="eyebrow">ADMIN / PORTFOLIO CMS</span>
                            <h1>{pageTitle}</h1>
                        </div>
                        <span className="admin-header-status">CLOUD CMS / READY</span>
                    </header>

                    {adminSection === 'dashboard' && <section className="admin-dashboard-content">
                        <div className="admin-dashboard-intro"><span className="eyebrow">OVERVIEW / CONTENT</span><p>Kelola semua isi portfolio dari satu tempat.</p></div>
                        <div className="admin-stat-grid">
                            {[
                                { label: 'Projects', count: content.projects.length, path: '/admin/projects', tone: 'yellow' },
                                { label: 'Skills', count: content.skills.length, path: '/admin/skills', tone: 'blue' },
                                { label: 'Education', count: content.education.length, path: '/admin/education', tone: 'green' },
                                { label: 'Experience', count: content.experience.length, path: '/admin/experience', tone: 'orange' },
                                { label: 'Social media', count: content.socials.length, path: '/admin/socials', tone: 'pink' },
                                { label: 'Endpoints', count: 2, path: '/admin/endpoints', tone: 'white' },
                            ].map((stat) => <a className={`admin-stat-card ${stat.tone}`} href={stat.path} key={stat.label}><span>{stat.label}</span><strong>{stat.count.toString().padStart(2, '0')}</strong><b>↗</b></a>)}
                        </div>
                    </section>}

                    <section id="admin-about" className="admin-section">
                        <h2>About & Contact</h2>
                        <div className="admin-fields">
                            <div className="admin-upload-box">
                                <label>Foto About<input type="file" accept="image/*" onChange={(event) => {
                                    const file = event.target.files?.[0]
                                    if (file) void uploadImage(file, (url) => updateContent({ ...content, aboutImage: url }))
                                    event.target.value = ''
                                }} disabled={uploading} /></label>
                                {content.aboutImage && <img className="admin-preview" src={content.aboutImage} alt="Preview About" />}
                            </div>
                            <label>Email penerima Resend<input type="email" value={content.contactEmail} onChange={(event) => updateContent({ ...content, contactEmail: event.target.value })} /></label>
                        </div>
                    </section>

                    {(['education', 'experience'] as const).map((section) => (
                        <section id={`admin-${section}`} className="admin-section" key={section}>
                            <h2>{section === 'education' ? 'Education' : 'Experience'}</h2>
                            <div className="admin-array-list">
                                {content[section].map((item, index) => (
                                    <div className="admin-list-entry" key={`${section}-${index}`}>
                                        <div className="admin-list-row">
                                            <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section, index })}>
                                                <strong>{item.title || `${section === 'education' ? 'Education' : 'Experience'} #${index + 1}`}</strong>
                                                <span>{item.period} · {item.subtitle || 'Belum ada detail'}</span>
                                                <b>↗</b>
                                            </button>
                                        </div>
                                        <div className={`admin-card admin-modal-card ${isEditorOpen(section, index) ? 'is-open' : ''}`}>
                                            <div className="admin-card-top"><strong>{item.title || `${section === 'education' ? 'Education' : 'Experience'} #${index + 1}`}</strong><button type="button" className="close-button icon-button" onClick={() => closeEditor(section, index)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button></div>
                                            <div className="admin-grid two-columns">
                                                <label>Periode<input value={item.period} onChange={(event) => updateContent({ ...content, [section]: content[section].map((entry, itemIndex) => itemIndex === index ? { ...entry, period: event.target.value } : entry) })} /></label>
                                                <label>Judul<input value={item.title} onChange={(event) => updateContent({ ...content, [section]: content[section].map((entry, itemIndex) => itemIndex === index ? { ...entry, title: event.target.value } : entry) })} /></label>
                                            </div>
                                            <label>Institusi / Detail<input value={item.subtitle} onChange={(event) => updateContent({ ...content, [section]: content[section].map((entry, itemIndex) => itemIndex === index ? { ...entry, subtitle: event.target.value } : entry) })} /></label>
                                            <div className="admin-grid two-columns">
                                                <label>Badge<input value={item.badge ?? ''} onChange={(event) => updateContent({ ...content, [section]: content[section].map((entry, itemIndex) => itemIndex === index ? { ...entry, badge: event.target.value || undefined } : entry) })} /></label>
                                                <label>Tone<select value={item.tone} onChange={(event) => updateContent({ ...content, [section]: content[section].map((entry, itemIndex) => itemIndex === index ? { ...entry, tone: event.target.value as JourneyEntry['tone'] } : entry) })}>
                                                    <option value="yellow">Yellow</option><option value="blue">Blue</option><option value="orange">Orange</option><option value="green">Green</option><option value="white">White</option>
                                                </select></label>
                                            </div>
                                            <div className="admin-modal-actions"><span>Aksi item</span><button type="button" className="danger-button icon-button" onClick={() => confirmDelete(section, () => { updateContent({ ...content, [section]: content[section].filter((_, itemIndex) => itemIndex !== index) }); setEditorTarget(null) })} aria-label={`Hapus ${section}`} title={`Hapus ${section}`}><AdminIcon name="trash" /></button></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button type="button" className="button secondary admin-add-button" onClick={() => addJourneyEntry(section)}><AdminIcon name="plus" /> Tambah {section === 'education' ? 'education' : 'experience'}</button>
                        </section>
                    ))}

                    <section id="admin-socials" className="admin-section">
                        <h2>Sosial media</h2>
                        <div className="admin-array-list">
                            {content.socials.map((social, index) => (
                                <div className="admin-list-entry" key={`social-${index}`}>
                                    <div className="admin-list-row">
                                        <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section: 'social', index })}><strong>{social.label || `Social #${index + 1}`}</strong><span>{social.url}</span><b>↗</b></button>
                                    </div>
                                    <div className={`admin-card admin-modal-card ${isEditorOpen('social', index) ? 'is-open' : ''}`}>
                                        <div className="admin-card-top">
                                            <strong>Social #{index + 1}</strong>
                                            <button type="button" className="close-button icon-button" onClick={() => closeEditor('social', index)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button>
                                        </div>
                                        <div className="admin-grid two-columns">
                                            <label>Label<input value={social.label} onChange={(event) => updateContent({ ...content, socials: content.socials.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item) })} /></label>
                                            <div className="admin-icon-field"><span>Icon</span><div className="admin-icon-picker" role="group" aria-label="Pilih icon sosial">
                                                {(['mail', 'github', 'instagram', 'linkedin', 'whatsapp', 'x', 'tiktok', 'youtube', 'facebook', 'telegram', 'discord', 'threads', 'pinterest', 'reddit', 'snapchat'] as const).map((icon) => <button key={icon} type="button" className={`admin-social-choice ${social.icon === icon ? 'is-selected' : ''}`} onClick={() => updateContent({ ...content, socials: content.socials.map((item, itemIndex) => itemIndex === index ? { ...item, icon } : item) })} aria-label={`Pilih icon ${icon}`} title={icon}><SocialIcon name={icon} /></button>)}
                                            </div></div>
                                        </div>
                                        <label>URL<input value={social.url} onChange={(event) => updateContent({ ...content, socials: content.socials.map((item, itemIndex) => itemIndex === index ? { ...item, url: event.target.value } : item) })} /></label>
                                        <div className="admin-modal-actions"><span>Aksi item</span><button type="button" className="danger-button icon-button" onClick={() => confirmDelete('sosial media', () => { updateContent({ ...content, socials: content.socials.filter((_, itemIndex) => itemIndex !== index) }); setEditorTarget(null) })} aria-label="Hapus sosial media" title="Hapus sosial media"><AdminIcon name="trash" /></button></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="button secondary admin-add-button" onClick={addSocial}><AdminIcon name="plus" /> Tambah sosial</button>
                    </section>

                    <section id="admin-skills" className="admin-section">
                        <h2>Skills</h2>
                        <div className="admin-array-list">
                            {content.skills.map((skill, index) => (
                                <div className="admin-list-entry" key={`skill-${index}`}>
                                    <div className="admin-list-row">
                                        <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section: 'skill', index })}><strong>{skill.name || `Skill #${index + 1}`}</strong><span>{skill.group} · {skill.mark || 'No mark'}</span><b>↗</b></button>
                                    </div>
                                    <div className={`admin-card admin-modal-card ${isEditorOpen('skill', index) ? 'is-open' : ''}`}>
                                        <div className="admin-card-top">
                                            <strong>Skill #{index + 1}</strong>
                                            <button type="button" className="close-button icon-button" onClick={() => closeEditor('skill', index)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button>
                                        </div>
                                        <div className="admin-grid two-columns">
                                            <label>Nama<input value={skill.name} onChange={(event) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} /></label>
                                            <label>Group<select value={skill.group} onChange={(event) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, group: event.target.value } : item) })}>
                                                <option value="Development">Development</option>
                                                <option value="Tools">Tools</option>
                                                <option value="Design">Design</option>
                                            </select></label>
                                        </div>
                                        <div className="admin-grid two-columns">
                                            <label>Mark<input value={skill.mark} onChange={(event) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, mark: event.target.value } : item) })} /></label>
                                            <label>Color<select value={skill.color} onChange={(event) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, color: event.target.value } : item) })}>
                                                <option value="yellow">yellow</option>
                                                <option value="blue">blue</option>
                                                <option value="green">green</option>
                                                <option value="orange">orange</option>
                                                <option value="purple">purple</option>
                                                <option value="pink">pink</option>
                                                <option value="red">red</option>
                                                <option value="ink">ink</option>
                                            </select></label>
                                        </div>
                                        <div className="admin-grid two-columns">
                                            <label>Icon SVG<input type="file" accept=".svg,image/svg+xml" onChange={(event) => {
                                                const file = event.target.files?.[0]
                                                if (file) void uploadSvg(file, (url) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, icon: url } : item) }))
                                                event.target.value = ''
                                            }} disabled={uploading} />{skill.icon && <span className="admin-file-value"><img src={iconSource(skill.icon)} alt="" /> SVG tersimpan</span>}</label>
                                            <label>Dark icon SVG<input type="file" accept=".svg,image/svg+xml" onChange={(event) => {
                                                const file = event.target.files?.[0]
                                                if (file) void uploadSvg(file, (url) => updateContent({ ...content, skills: content.skills.map((item, itemIndex) => itemIndex === index ? { ...item, darkIcon: url } : item) }))
                                                event.target.value = ''
                                            }} disabled={uploading} />{skill.darkIcon && <span className="admin-file-value"><img src={iconSource(skill.darkIcon)} alt="" /> Dark SVG tersimpan</span>}</label>
                                        </div>
                                        <div className="admin-modal-actions"><span>Aksi item</span><button type="button" className="danger-button icon-button" onClick={() => confirmDelete('skill', () => { updateContent({ ...content, skills: content.skills.filter((_, itemIndex) => itemIndex !== index) }); setEditorTarget(null) })} aria-label="Hapus skill" title="Hapus skill"><AdminIcon name="trash" /></button></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="button secondary admin-add-button" onClick={addSkill}><AdminIcon name="plus" /> Tambah skill</button>
                    </section>

                    <section id="admin-projects" className="admin-section">
                        <h2>Projects</h2>
                        <div className="admin-array-list">
                            {content.projects.map((project, index) => (
                                <div className="admin-list-entry" key={`${project.category}-${project.id ?? index}`}>
                                    <div className="admin-list-row">
                                        <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section: 'project', index })}><strong>{project.category === 'Design' ? `Design project #${index + 1}` : project.title || `Project ${index + 1}`}</strong><span>{project.category === 'Design' ? 'Design project' : `${project.category} · ${project.year || 'No year'}`}</span><b>↗</b></button>
                                    </div>
                                    <div className={`admin-card admin-modal-card ${isEditorOpen('project', index) ? 'is-open' : ''}`}>
                                        <div className="admin-card-top">
                                            <strong>{project.category === 'Design' ? 'Design project' : project.title || `Project ${index + 1}`}</strong>
                                            <button type="button" className="close-button icon-button" onClick={() => closeEditor('project', index)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button>
                                        </div>

                                        <div className="admin-grid two-columns">
                                            <label>Kategori<select value={project.category} onChange={(event) => {
                                                const nextCategory = event.target.value as 'Design' | 'Development' | 'Other'
                                                const updated = [...content.projects]
                                                updated[index] = defaultProject(nextCategory)
                                                updateContent({ ...content, projects: updated })
                                            }}>
                                                <option value="Design">Design</option>
                                                <option value="Development">Development</option>
                                                <option value="Other">Other</option>
                                            </select></label>
                                            <label>Fallback color<input type="color" value={project.fallbackColor || '#f8d34f'} onChange={(event) => {
                                                updateProjectAt(index, (current) => ({ ...current, fallbackColor: event.target.value }))
                                            }} /></label>
                                        </div>

                                        {project.category === 'Design' ? (
                                            <>
                                                <label>Project image<input type="file" accept="image/*" onChange={(event) => {
                                                    const file = event.target.files?.[0]
                                                    if (file) void uploadImage(file, (url) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? { ...current, image: url } : current))
                                                    })
                                                    event.target.value = ''
                                                }} disabled={uploading} />{project.image && <input className="admin-url-value" readOnly value={project.image} aria-label="Supabase image URL" />}</label>
                                                <label>External URL<input value={project.url ?? ''} onChange={(event) => {
                                                    updateProjectAt(index, (current) => (current.category === 'Design' ? { ...current, url: event.target.value } : current))
                                                }} /></label>
                                                {project.image && <img className="admin-preview" src={project.image} alt="Project preview" />}
                                            </>
                                        ) : (
                                            <>
                                                <div className="admin-grid two-columns">
                                                    <label>Judul<input value={project.title} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, title: event.target.value }))
                                                    }} /></label>
                                                    <label>Year<input value={project.year} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, year: event.target.value }))
                                                    }} /></label>
                                                </div>
                                                <div className="admin-grid two-columns">
                                                    <label>Type ID<input value={project.type.id} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, type: { ...current.type, id: event.target.value } }))
                                                    }} /></label>
                                                    <label>Type EN<input value={project.type.en} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, type: { ...current.type, en: event.target.value } }))
                                                    }} /></label>
                                                </div>
                                                <div className="admin-grid two-columns">
                                                    <label>Role ID<input value={project.role.id} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, role: { ...current.role, id: event.target.value } }))
                                                    }} /></label>
                                                    <label>Role EN<input value={project.role.en} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, role: { ...current.role, en: event.target.value } }))
                                                    }} /></label>
                                                </div>
                                                <div className="admin-grid two-columns">
                                                    <label>Description ID<textarea value={project.description.id} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, description: { ...current.description, id: event.target.value } }))
                                                    }} /></label>
                                                    <label>Description EN<textarea value={project.description.en} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, description: { ...current.description, en: event.target.value } }))
                                                    }} /></label>
                                                </div>
                                                <div className="admin-grid two-columns">
                                                    <label>Tech (pisah koma)<input value={project.tech.join(', ')} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, tech: event.target.value.split(',').map((item) => item.trim()).filter(Boolean) }))
                                                    }} /></label>
                                                    <label>Project image<input type="file" accept="image/*" onChange={(event) => {
                                                        const file = event.target.files?.[0]
                                                        if (file) void uploadImage(file, (url) => {
                                                            updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, image: url }))
                                                        })
                                                        event.target.value = ''
                                                    }} disabled={uploading} />{project.image && <input className="admin-url-value" readOnly value={project.image} aria-label="Supabase image URL" />}</label>
                                                </div>
                                                <div className="admin-grid two-columns">
                                                    <label>GitHub<input value={project.github ?? ''} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, github: event.target.value || undefined }))
                                                    }} /></label>
                                                    <label>URL<input value={project.url ?? ''} onChange={(event) => {
                                                        updateProjectAt(index, (current) => (current.category === 'Design' ? current : { ...current, url: event.target.value || undefined }))
                                                    }} /></label>
                                                </div>
                                                {project.image && <img className="admin-preview" src={project.image} alt="Project preview" />}
                                            </>
                                        )}
                                        <div className="admin-modal-actions"><span>Aksi item</span><button type="button" className="danger-button icon-button" onClick={() => confirmDelete('project', () => { updateContent({ ...content, projects: content.projects.filter((_, itemIndex) => itemIndex !== index) }); setEditorTarget(null) })} aria-label="Hapus project" title="Hapus project"><AdminIcon name="trash" /></button></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button type="button" className="button secondary admin-add-button" onClick={addProject}><AdminIcon name="plus" /> Tambah project</button>
                    </section>

                    <section id="admin-endpoints" className="admin-section">
                        <h2>Visit endpoints you may not know yet</h2>
                        <div className="admin-array-list">
                            <div className="admin-list-entry">
                                <div className="admin-list-row">
                                    <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section: 'endpoint', index: 0 })}><strong>{content.endpointDiscovery.twibbon.label}</strong><span>{content.endpointDiscovery.twibbon.path}</span><b>↗</b></button>
                                </div>
                                <div className={`admin-card admin-modal-card ${isEditorOpen('endpoint', 0) ? 'is-open' : ''}`}>
                                    <div className="admin-card-top"><strong>{content.endpointDiscovery.twibbon.label}</strong><button type="button" className="close-button icon-button" onClick={() => setEditorTarget(null)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button></div>
                                    <div className="admin-grid two-columns">
                                        <label>Label<input value={content.endpointDiscovery.twibbon.label} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, label: event.target.value } } })} /></label>
                                        <label>Path<input value={content.endpointDiscovery.twibbon.path} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, path: event.target.value } } })} /></label>
                                    </div>
                                    <div className="admin-grid two-columns">
                                        <label>Title ID<input value={content.endpointDiscovery.twibbon.title.id} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, title: { ...content.endpointDiscovery.twibbon.title, id: event.target.value } } } })} /></label>
                                        <label>Title EN<input value={content.endpointDiscovery.twibbon.title.en} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, title: { ...content.endpointDiscovery.twibbon.title, en: event.target.value } } } })} /></label>
                                    </div>
                                    <div className="admin-grid two-columns">
                                        <label>Desc ID<textarea value={content.endpointDiscovery.twibbon.description.id} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, description: { ...content.endpointDiscovery.twibbon.description, id: event.target.value } } } })} /></label>
                                        <label>Desc EN<textarea value={content.endpointDiscovery.twibbon.description.en} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, twibbon: { ...content.endpointDiscovery.twibbon, description: { ...content.endpointDiscovery.twibbon.description, en: event.target.value } } } })} /></label>
                                    </div>
                                </div>
                            </div>

                            <div className="admin-list-entry">
                                <div className="admin-list-row">
                                    <button type="button" className="admin-list-button" onClick={() => setEditorTarget({ section: 'endpoint', index: 1 })}><strong>{content.endpointDiscovery.spinView.label}</strong><span>{content.endpointDiscovery.spinView.path}</span><b>↗</b></button>
                                </div>
                                <div className={`admin-card admin-modal-card ${isEditorOpen('endpoint', 1) ? 'is-open' : ''}`}>
                                    <div className="admin-card-top"><strong>{content.endpointDiscovery.spinView.label}</strong><button type="button" className="close-button icon-button" onClick={() => setEditorTarget(null)} aria-label="Tutup editor" title="Tutup editor"><AdminIcon name="close" /></button></div>
                                    <div className="admin-grid two-columns">
                                        <label>Label<input value={content.endpointDiscovery.spinView.label} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, label: event.target.value } } })} /></label>
                                        <label>Path<input value={content.endpointDiscovery.spinView.path} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, path: event.target.value } } })} /></label>
                                    </div>
                                    <div className="admin-grid two-columns">
                                        <label>Title ID<input value={content.endpointDiscovery.spinView.title.id} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, title: { ...content.endpointDiscovery.spinView.title, id: event.target.value } } } })} /></label>
                                        <label>Title EN<input value={content.endpointDiscovery.spinView.title.en} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, title: { ...content.endpointDiscovery.spinView.title, en: event.target.value } } } })} /></label>
                                    </div>
                                    <div className="admin-grid two-columns">
                                        <label>Desc ID<textarea value={content.endpointDiscovery.spinView.description.id} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, description: { ...content.endpointDiscovery.spinView.description, id: event.target.value } } } })} /></label>
                                        <label>Desc EN<textarea value={content.endpointDiscovery.spinView.description.en} onChange={(event) => updateContent({ ...content, endpointDiscovery: { ...content.endpointDiscovery, spinView: { ...content.endpointDiscovery.spinView, description: { ...content.endpointDiscovery.spinView.description, en: event.target.value } } } })} /></label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <button className="button primary admin-save-button" type="submit" disabled={uploading}><AdminIcon name="save" /> Simpan perubahan</button>
                    {message && <p className="admin-message">{message}</p>}
                </form>
            </div>
            {deleteConfirmation && <div className="admin-confirmation" role="dialog" aria-modal="true" aria-labelledby="delete-confirmation-title">
                <div className="admin-confirmation-card">
                    <div className="admin-confirmation-icon"><AdminIcon name="trash" /></div>
                    <span className="eyebrow">KONFIRMASI AKSI</span>
                    <h2 id="delete-confirmation-title">Hapus {deleteConfirmation.label}?</h2>
                    <p>Item ini akan dihapus dari editor. Perubahan akan diterapkan setelah Anda menekan simpan.</p>
                    <div className="admin-confirmation-actions">
                        <button type="button" className="button secondary" onClick={() => setDeleteConfirmation(null)}>Batal</button>
                        <button type="button" className="button admin-confirm-delete" onClick={() => { deleteConfirmation.remove(); setDeleteConfirmation(null) }}><AdminIcon name="trash" /> Hapus</button>
                    </div>
                </div>
            </div>}
        </main>
    )
}