export type Language = 'id' | 'en'
export type ProjectCategory = 'Design' | 'Development' | 'Other'

export type LocalizedText = { id: string; en: string }

export type JourneyItem = {
    period: LocalizedText
    title: LocalizedText
    subtitle: LocalizedText
    tone: 'blue' | 'yellow' | 'orange' | 'green' | 'white'
    badge?: LocalizedText
}

export const getLocalizedText = (value: string | LocalizedText | undefined, language: Language): string => {
    if (typeof value === 'string') return value
    if (!value) return ''
    return value[language] || value.id || value.en || ''
}

export const normalizeJourneyEntry = (value?: Partial<JourneyItem> | null): JourneyItem => {
    const toLocalized = (field?: string | LocalizedText): LocalizedText => {
        if (typeof field === 'string') return { id: field, en: field }
        if (field && typeof field === 'object') {
            return {
                id: field.id ?? '',
                en: field.en ?? '',
            }
        }
        return { id: '', en: '' }
    }

    return {
        period: toLocalized(value?.period),
        title: toLocalized(value?.title),
        subtitle: toLocalized(value?.subtitle),
        tone: value?.tone ?? 'yellow',
        badge: value?.badge ? toLocalized(value.badge) : undefined,
    }
}

export const translations = {
    id: {
        nav: {
            home: 'Beranda',
            about: 'Tentang',
            projects: 'Proyek',
            contact: 'Kontak',
        },
        hero: {
            eyebrow: 'AVAILABLE FOR COLLABORATION',
            title: 'Hi, saya Irfan Hariyanto.',
            role: 'Desainer Grafis | Spesialis Media Sosial | Pemrogram Pemula | Penggemar AI | Mahasiswa Aktif',
            description: 'Saya suka belajar dan membuat berbagai hal, terutama hal-hal baru yang menggabungkan teknologi, desain, dan kreativitas.',
            projects: 'Lihat proyek saya',
            contact: 'Hubungi saya',
            badge: 'Terbuka untuk ide baru',
        },
        about: {
            kicker: '01 / Tentang saya',
            title: 'Membuat hal digital yang terasa manusiawi.',
            text: 'Saya adalah mahasiswa Informatika yang memiliki ketertarikan pada teknologi, desain, dan pengembangan berbagai project digital. Saya senang mengeksplorasi hal-hal baru dan menggabungkan kemampuan programming dengan kreativitas visual.',
            focus: 'Fokus saat ini',
            cta: 'Lebih dekat',
        },
        journey: {
            kicker: '02 / Perjalanan',
            title: 'Perjalanan',
            subtitle: 'Perjalanan pendidikan dan pengalaman yang membentuk saya hingga saat ini.',
            education: 'Pendidikan',
            experience: 'Pengalaman',
            educationItems: [
                {
                    period: { id: '2025 - Sekarang', en: '2025 - Present' },
                    title: { id: 'Universitas Wiraraja', en: 'Wiraraja University' },
                    subtitle: { id: 'Teknik Informatika', en: 'Informatics Engineering' },
                    badge: { id: 'IPK: 3.98', en: 'GPA: 3.98' },
                    tone: 'yellow',
                },
                {
                    period: { id: '2022 - 2025', en: '2022 - 2025' },
                    title: { id: 'SMK Negeri 1 Kalianget', en: 'SMK Negeri 1 Kalianget' },
                    subtitle: { id: 'Desain Komunikasi Visual', en: 'Visual Communication Design' },
                    tone: 'blue',
                },
            ] as JourneyItem[],
            experienceItems: [
                {
                    period: { id: 'Jan 2026 - Sekarang', en: 'Jan 2026 - Present' },
                    title: { id: 'Social Media Marketing Specialist', en: 'Social Media Marketing Specialist' },
                    subtitle: { id: 'Himpunan Mahasiswa Teknik Informatika UNIJA', en: 'Informatics Student Association UNIJA' },
                    tone: 'orange',
                },
                {
                    period: { id: 'Nov 2020 - Sekarang', en: 'Nov 2020 - Present' },
                    title: { id: 'Freelance Software Engineer', en: 'Freelance Software Engineer' },
                    subtitle: { id: 'Irfan Design & Coding', en: 'Irfan Design & Coding' },
                    tone: 'green',
                },
                {
                    period: { id: 'Nov 2024 - Feb 2025', en: 'Nov 2024 - Feb 2025' },
                    title: { id: 'Student Intern', en: 'Student Intern' },
                    subtitle: { id: 'Dinas Kominfo Sumenep', en: 'Sumenep Communication and Information Agency' },
                    tone: 'white',
                },
            ] as JourneyItem[],
        },
        marquee: 'PEMROGRAMAN | TEKNOLOGI | PENGGEMAR AI | VIDEOGRAFI | FOTOGRAFI | DESAIN GRAFIS | ASTROFIL | ALAM | SEJARAH |',
        skills: {
            kicker: '03 / Toolkit',
            title: 'Technical skills',
            sub: 'Peralatan yang saya gunakan untuk mengubah rasa ingin tahu menjadi sesuatu yang bisa dipakai.',
        },
        projects: {
            kicker: '04 / Selected work',
            title: 'Proyek pilihan',
            sub: 'Eksperimen, tugas, dan karya yang dibangun dengan rasa ingin tahu.',
            all: 'Semua',
            design: 'Design',
            development: 'Development',
            other: 'Lainnya',
            view: 'Lihat detail',
            more: 'Lihat projek lainnya',
            url: 'URL',
            github: 'GitHub',
        },
        contact: {
            kicker: '05 / Mari berkolaborasi',
            title: 'Punya ide? Mari buat sesuatu.',
            sub: 'Jika kamu memiliki project, ide, atau ingin berkolaborasi, jangan ragu untuk menghubungi saya.',
            name: 'Nama',
            email: 'Email',
            subject: 'Subjek',
            message: 'Pesan',
            send: 'Kirim pesan',
            sending: 'Mengirim...',
            success: 'Pesan siap dikirim. Saya akan segera membalasnya.',
            error: 'Lengkapi semua field sebelum mengirim.',
            sendError: 'Pesan belum terkirim. Silakan coba lagi nanti.',
            details: 'Info kontak',
            namePlaceholder: 'Irfan Hariyanto',
            emailPlaceholder: 'hello@example.com',
            subjectPlaceholder: 'Mari buat sesuatu',
            messagePlaceholder: 'Ceritakan tentang ideamu...',
        },
        endpointDiscovery: {
            kicker: 'Jelajahi',
            title: 'Kunjungi Endpoint yang Mungkin Belum Kamu Ketahui',
            twibbon: {
                label: '/twibbon',
                title: 'Buat Twibbon',
                description: 'Alat generator twibbon untuk menambahkan foto, atur posisi, lalu download hasilnya secara langsung.',
            },
            spinView: {
                label: '/spin-view',
                title: 'Spin View',
                description: 'Halaman interaktif untuk melihat tampilan putaran atau visual animasi yang dirancang untuk presentasi dan hiburan.',
            },
        },
        modal: {
            role: 'Peran',
            year: 'Tahun',
            close: 'Tutup',
        },
        footer: '© 2026 Irfan Hariyanto. All rights reserved.',
    },
    en: {
        nav: {
            home: 'Home',
            about: 'About',
            projects: 'Projects',
            contact: 'Contact',
        },
        hero: {
            eyebrow: 'AVAILABLE FOR COLLABORATION',
            title: "Hi, I'm Irfan Hariyanto.",
            role: 'Graphic Designer | Social Media Specialist | Programmer Beginner | AI Enthusiast | Active Student',
            description: 'I enjoy learning and creating things, especially new things that combine technology, design, and creativity.',
            projects: 'View my projects',
            contact: 'Contact me',
            badge: 'Open to new ideas',
        },
        about: {
            kicker: '01 / About me',
            title: 'Making digital things feel human.',
            text: 'I am an Informatics student interested in technology, design, and building digital projects. I enjoy exploring new things and combining programming skills with visual creativity.',
            focus: 'Current focus',
            cta: 'Get to know me',
        },
        journey: {
            kicker: '02 / My Journey',
            title: 'Journey',
            subtitle: 'The education and experience that shaped me along the way.',
            education: 'Education',
            experience: 'Experience',
            educationItems: [
                {
                    period: { id: '2025 - Sekarang', en: '2025 - Present' },
                    title: { id: 'Universitas Wiraraja', en: 'Wiraraja University' },
                    subtitle: { id: 'Teknik Informatika', en: 'Informatics Engineering' },
                    badge: { id: 'IPK: 3.98', en: 'GPA: 3.98' },
                    tone: 'yellow',
                },
                {
                    period: { id: '2022 - 2025', en: '2022 - 2025' },
                    title: { id: 'SMK Negeri 1 Kalianget', en: 'SMK Negeri 1 Kalianget' },
                    subtitle: { id: 'Desain Komunikasi Visual', en: 'Visual Communication Design' },
                    tone: 'blue',
                },
            ] as JourneyItem[],
            experienceItems: [
                {
                    period: { id: 'Jan 2026 - Sekarang', en: 'Jan 2026 - Present' },
                    title: { id: 'Social Media Marketing Specialist', en: 'Social Media Marketing Specialist' },
                    subtitle: { id: 'Himpunan Mahasiswa Teknik Informatika UNIJA', en: 'Informatics Student Association UNIJA' },
                    tone: 'orange',
                },
                {
                    period: { id: 'Nov 2020 - Sekarang', en: 'Nov 2020 - Present' },
                    title: { id: 'Freelance Software Engineer', en: 'Freelance Software Engineer' },
                    subtitle: { id: 'Irfan Design & Coding', en: 'Irfan Design & Coding' },
                    tone: 'green',
                },
                {
                    period: { id: 'Nov 2024 - Feb 2025', en: 'Nov 2024 - Feb 2025' },
                    title: { id: 'Student Intern', en: 'Student Intern' },
                    subtitle: { id: 'Dinas Kominfo Sumenep', en: 'Sumenep Communication and Information Agency' },
                    tone: 'white',
                },
            ] as JourneyItem[],
        },
        marquee: 'PROGRAMMING | TECH | AI ENTHUSIAST | VIDEOGRAPHY | PHOTOGRAPHY | DESIGN GRAPHIC | ASTROPHILE | NATURE | HISTORY |',
        skills: {
            kicker: '03 / Toolkit',
            title: 'Technical skills',
            sub: 'The tools I use to turn curiosity into something people can use.',
        },
        projects: {
            kicker: '04 / Selected work',
            title: 'Selected projects',
            sub: 'Experiments, coursework, and work built with curiosity.',
            all: 'All',
            design: 'Design',
            development: 'Development',
            other: 'Other',
            view: 'View details',
            more: 'View more projects',
            url: 'URL',
            github: 'GitHub',
        },
        contact: {
            kicker: '05 / Let’s collaborate',
            title: 'Have an idea? Let’s make something.',
            sub: 'If you have a project, an idea, or want to collaborate, feel free to reach out.',
            name: 'Name',
            email: 'Email',
            subject: 'Subject',
            message: 'Message',
            send: 'Send message',
            sending: 'Sending...',
            success: 'Message ready to send. I will get back to you soon.',
            error: 'Please complete every field before sending.',
            sendError: 'Message was not sent. Please try again later.',
            details: 'Contact details',
            namePlaceholder: 'Irfan Hariyanto',
            emailPlaceholder: 'hello@example.com',
            subjectPlaceholder: "Let's build something",
            messagePlaceholder: 'Tell me a little about your idea...',
        },
        endpointDiscovery: {
            kicker: 'Explore',
            title: 'Visit endpoints you may not know yet',
            twibbon: {
                label: '/twibbon',
                title: 'Create Twibbon',
                description: 'A twibbon generator tool to add a photo, adjust the position, and download the result directly.',
            },
            spinView: {
                label: '/spin-view',
                title: 'Spin View',
                description: 'An interactive page for viewing rotating displays or motion visuals designed for presentation and entertainment.',
            },
        },
        modal: {
            role: 'Role',
            year: 'Year',
            close: 'Close',
        },
        footer: '© 2026 Irfan Hariyanto. All rights reserved.',
    },
} as const

export type Skill = {
    name: string
    group: string
    mark: string
    icon: string
    darkIcon?: string
    color: string
}

export const skills: Skill[] = [
    { name: 'JavaScript', group: 'Development', mark: 'JS', icon: 'javascript.svg', color: 'yellow' },
    { name: 'TypeScript', group: 'Development', mark: 'TS', icon: 'typescript.svg', color: 'blue' },
    { name: 'C#', group: 'Development', mark: 'C#', icon: 'csharp.svg', color: 'purple' },
    { name: 'NodeJS', group: 'Development', mark: 'N', icon: 'nodejs.svg', color: 'green' },
    { name: 'MySQL', group: 'Development', mark: 'SQL', icon: 'mysql.svg', color: 'orange' },
    { name: 'XAMPP', group: 'Development', mark: 'X', icon: 'xampp.svg', color: 'red' },
    { name: 'Git', group: 'Tools', mark: 'git', icon: 'git.svg', color: 'orange' },
    { name: 'VS Code', group: 'Tools', mark: 'VS', icon: 'vscode.svg', color: 'blue' },
    { name: 'GitHub', group: 'Tools', mark: 'GH', icon: 'github-dark.svg', darkIcon: 'github-light.svg', color: 'ink' },
    { name: 'GitHub Copilot', group: 'Tools', mark: 'AI', icon: 'github-copilot-dark.svg', darkIcon: 'github-copilot-light.svg', color: 'green' },
    { name: 'Figma', group: 'Design', mark: 'Fi', icon: 'figma.svg', color: 'pink' },
    { name: 'Canva', group: 'Design', mark: 'Ca', icon: 'canva.svg', color: 'blue' },
    { name: 'Adobe Photoshop', group: 'Design', mark: 'Ps', icon: 'photoshop.svg', color: 'blue' },
    { name: 'Adobe Premiere', group: 'Design', mark: 'Pr', icon: 'premiere.svg', color: 'purple' },
    { name: 'Adobe Illustrator', group: 'Design', mark: 'Ai', icon: 'illustrator.svg', color: 'orange' },
    { name: 'CorelDRAW', group: 'Design', mark: 'CD', icon: 'coreldraw.svg', color: 'green' },
]

export type DevelopmentProject = {
    id: number
    category: 'Development'
    title: string
    type: LocalizedText
    year: string
    image: string
    fallbackColor: string
    description: LocalizedText
    tech: string[]
    role: LocalizedText
    github?: string
    url?: string
}

export type DesignProject = {
    id: number
    category: 'Design'
    image: string
    fallbackColor: string
    url?: string
}

export type OtherProject = {
    id: number
    category: 'Other'
    title: string
    type: LocalizedText
    year: string
    image: string
    fallbackColor: string
    description: LocalizedText
    tech: string[]
    role: LocalizedText
    github?: string
    url?: string
}

export type Project = DevelopmentProject | DesignProject | OtherProject

export const projects: Project[] = [
    {
        id: 1,
        category: 'Development',
        title: 'RSUD System',
        type: { id: 'Aplikasi desktop', en: 'Desktop application' },
        year: '2026',
        image: '/images/developments/rsud-preview.png',
        fallbackColor: '#f28d69',
        description: { id: 'Sistem informasi rumah sakit berbasis desktop untuk membantu alur data pasien.', en: 'A desktop hospital information system designed to simplify patient data flows.' },
        tech: ['C#', 'WinForms', 'MySQL'],
        role: { id: 'Full-stack developer', en: 'Full-stack developer' },
        github: 'https://github.com/rtwone/RSUD-SYSTEM',
    },
    {
        id: 2,
        category: 'Development',
        title: 'Baileys Base',
        type: { id: 'Otomasi WhatsApp', en: 'WhatsApp Automation' },
        year: '2026',
        image: '/images/baileys-base.jpg',
        fallbackColor: '#ffea72',
        description: { id: 'Fondasi otomatisasi WhatsApp ringan dengan Baileys, menyediakan fungsi inti untuk bot, penanganan pesan, dan alur chat.', en: 'A lightweight WhatsApp automation foundation with Baileys, providing core functions for bots, message handling, and chat flows.' },
        tech: ['Node.js', 'TypeScript', 'JavaScript', 'Baileys'],
        role: { id: 'Product developer', en: 'Product developer' },
        github: 'https://github.com/rtwone/baileys-base',
    },
    {
        id: 3,
        category: 'Development',
        title: 'ChitandaBot',
        type: { id: 'Otomasi WhatsApp', en: 'WhatsApp Automation' },
        year: '2021',
        image: '/images/chitandabot.jpg',
        fallbackColor: '#8ab4f0',
        description: { id: 'Sistem chatbot modular untuk WhatsApp atau Telegram, fokus pada perintah, respons media, dan kustomisasi mudah untuk penggunaan pribadi atau bisnis.', en: 'A modular chatbot system for WhatsApp or Telegram, focused on command handling, media responses, and easy customization for personal or business use.' },
        tech: ['Node.js', 'TypeScript', 'JavaScript', 'Baileys'],
        role: { id: 'Product developer', en: 'Product developer' },
        github: 'https://github.com/rtwone/chitandabot',
    },
    { id: 4, category: 'Design', image: '/images/designs/17agustus2026.webp', fallbackColor: '#f8d34f', url: 'https://www.instagram.com/p/DcHD-snD4pb/' },
    { id: 5, category: 'Design', image: '/images/designs/5kesalahanmahasiswa.webp', fallbackColor: '#8ab4f0', url: 'https://www.instagram.com/p/DbyCKmcCYAV/' },
    { id: 6, category: 'Design', image: '/images/designs/maulidnabi.webp', fallbackColor: '#a8e3b4', url: 'https://www.instagram.com/p/Dca_zbvpY5N/' },
    { id: 7, category: 'Design', image: '/images/designs/1muharram.webp', fallbackColor: '#8ab4f0', url: 'https://www.instagram.com/p/DZmzCfWp-0o/' },
    { id: 8, category: 'Design', image: '/images/designs/aftermovieipw.webp', fallbackColor: '#f28d69', url: 'https://www.instagram.com/p/DbTH4Y5iZlg/' },
    { id: 10, category: 'Design', image: '/images/designs/docitclass.webp', fallbackColor: '#a8e3b4', url: 'https://www.instagram.com/p/DX4DF0IiSuu/' },
    { id: 11, category: 'Design', image: '/images/designs/harpennas.webp', fallbackColor: '#8ab4f0', url: 'https://www.instagram.com/p/DX0NnLuD06_/' },
    { id: 12, category: 'Design', image: '/images/designs/iduladha.webp', fallbackColor: '#a8e3b4', url: 'https://www.instagram.com/p/DYzQ9Bsp7fI/' },
    { id: 13, category: 'Design', image: '/images/designs/idulfitri.webp', fallbackColor: '#ffea72', url: 'https://www.instagram.com/p/DWGoMdfEZhz/' },
    { id: 14, category: 'Design', image: '/images/designs/itclass.webp', fallbackColor: '#f28d69', url: 'https://www.instagram.com/p/DXuPsItiYFH/' },
    { id: 15, category: 'Design', image: '/images/designs/kenaikanyesus.webp', fallbackColor: '#8ab4f0', url: 'https://www.instagram.com/p/DYTQh7tJ8FQ/' },
    { id: 16, category: 'Design', image: '/images/designs/nyepi.webp', fallbackColor: '#a8e3b4', url: 'https://www.instagram.com/p/DWCF1r0CUGF/' },
    { id: 17, category: 'Design', image: '/images/designs/ramadhan.webp', fallbackColor: '#ffea72', url: 'https://www.instagram.com/p/DU5hE9YiV0T/' },
    { id: 18, category: 'Design', image: '/images/designs/workshopipw2026.webp', fallbackColor: '#f28d69', url: 'https://www.instagram.com/p/DZ9EPKRp6T9/' },
    { id: 19, category: 'Design', image: '/images/designs/comingsoonew26.webp', fallbackColor: '#f28d69', url: 'https://www.instagram.com/p/Dcm55ITPsbq/' },
    {
        id: 20,
        category: 'Development',
        title: 'Web Portofolio V3',
        type: { id: 'Website Portofolio', en: 'Portfolio Website' },
        year: '2026',
        image: '/images/developments/webportofoliov3.png',
        fallbackColor: '#a8e3b4',
        description: { id: 'Iterasi ketiga dari situs web portofolio pribadi yang menampilkan identitas profesional sebagai Graphic Designer dan WhatsApp Bot Developer. Mengusung konsep desain modern dengan mode gelap elegan, gaya visual warm neo, struktur konten yang bersih, serta fitur interaktif untuk mempresentasikan karya secara profesional.', en: 'The third iteration of a personal portfolio website showcasing professional identity as a Graphic Designer and WhatsApp Bot Developer. Features a modern design concept with an elegant dark mode, warm neo visual style, clean content structure, and interactive elements to present works professionally.' },
        tech: ['Next.js', 'React', 'Tailwind CSS', 'JavaScript'],
        role: { id: 'Product developer', en: 'Product developer' },
        github: 'https://github.com/rtwone/v3-irfanhariyanto',
    },
    {
        id: 21,
        category: 'Other',
        title: 'Film Pendek | Vlogger Sial',
        type: { id: 'Film Pendek', en: 'Short Film' },
        year: '2024',
        image: '/images/other/vloger-sial.jpg',
        fallbackColor: '#8ab4f0',
        description: { id: 'Sebuah film pendek bergenre horor-vlog yang mengisahkan perjalanan sekelompok vlogger yang mengalami kejadian-kejadian mistis dan menyeramkan setelah tinggal di sebuah rumah pinjaman.', en: 'A short horror-vlog film that follows a group of vloggers experiencing eerie and mystical encounters after staying at a borrowed house.' },
        tech: ['Canon Camera', 'Apple iPhone', 'CapCut'],
        role: { id: 'Penulis, Sutradara, Editor, Juru Kamera', en: 'Writer, Director, Editor, Camera-Man' },
        url: 'https://www.youtube.com/watch?v=NtVBdxHxJb8',
    },
]

export type Translations = typeof translations.id

export type JourneyEntry = JourneyItem

export type SocialLink = {
    icon: 'mail' | 'github' | 'instagram' | 'linkedin' | 'whatsapp' | 'x' | 'tiktok' | 'youtube' | 'facebook' | 'telegram' | 'discord' | 'threads' | 'pinterest' | 'reddit' | 'snapchat'
    label: string
    url: string
}

export type EndpointCard = {
    label: string
    title: LocalizedText
    description: LocalizedText
    path: string
}

export type SiteContent = {
    aboutImage: string
    skills: Skill[]
    projects: Project[]
    education: JourneyEntry[]
    experience: JourneyEntry[]
    socials: SocialLink[]
    contactEmail: string
    endpointDiscovery: {
        kicker: LocalizedText
        title: LocalizedText
        twibbon: EndpointCard
        spinView: EndpointCard
        custom: EndpointCard[]
    }
}

export const defaultContent: SiteContent = {
    aboutImage: '/images/profile.jpg',
    skills: [...skills],
    projects: [...projects],
    education: [...translations.id.journey.educationItems],
    experience: [...translations.id.journey.experienceItems],
    contactEmail: 'irfanhariyanto317@gmail.com',
    socials: [
        { icon: 'mail', label: 'Email', url: 'mailto:irfanhariyanto317@gmail.com' },
        { icon: 'github', label: 'GitHub', url: 'https://github.com/rtwone' },
        { icon: 'instagram', label: 'Instagram', url: 'https://instagram.com/irfvnny' },
        { icon: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/irfanhariyanto' },
    ],
    endpointDiscovery: {
        kicker: { id: translations.id.endpointDiscovery.kicker, en: translations.en.endpointDiscovery.kicker },
        title: { id: translations.id.endpointDiscovery.title, en: translations.en.endpointDiscovery.title },
        twibbon: {
            label: translations.id.endpointDiscovery.twibbon.label,
            title: { id: translations.id.endpointDiscovery.twibbon.title, en: translations.en.endpointDiscovery.twibbon.title },
            description: { id: translations.id.endpointDiscovery.twibbon.description, en: translations.en.endpointDiscovery.twibbon.description },
            path: '/twibbon',
        },
        spinView: {
            label: translations.id.endpointDiscovery.spinView.label,
            title: { id: translations.id.endpointDiscovery.spinView.title, en: translations.en.endpointDiscovery.spinView.title },
            description: { id: translations.id.endpointDiscovery.spinView.description, en: translations.en.endpointDiscovery.spinView.description },
            path: '/spin-view',
        },
        custom: [],
    },
}

export const defaultPortfolioSeed = sanitizeSiteContent(defaultContent)

export async function uploadDefaultPortfolioContentToSupabase() {
    const payload = sanitizeSiteContent(defaultContent)
    const response = await fetch('/api/admin/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        throw new Error('Unable to upload default portfolio content to Supabase')
    }

    const data = await response.json() as { content?: Partial<SiteContent> | null }
    return sanitizeSiteContent(data.content ?? payload)
}

export function mergeContentWithDefaults(value?: Partial<SiteContent> | null): SiteContent {
    const source = value ?? {}
    const endpointDiscovery = {
        ...defaultContent.endpointDiscovery,
        ...(source.endpointDiscovery ?? {}),
        twibbon: {
            ...defaultContent.endpointDiscovery.twibbon,
            ...(source.endpointDiscovery?.twibbon ?? {}),
            title: {
                ...defaultContent.endpointDiscovery.twibbon.title,
                ...(source.endpointDiscovery?.twibbon?.title ?? {}),
            },
            description: {
                ...defaultContent.endpointDiscovery.twibbon.description,
                ...(source.endpointDiscovery?.twibbon?.description ?? {}),
            },
        },
        spinView: {
            ...defaultContent.endpointDiscovery.spinView,
            ...(source.endpointDiscovery?.spinView ?? {}),
            title: {
                ...defaultContent.endpointDiscovery.spinView.title,
                ...(source.endpointDiscovery?.spinView?.title ?? {}),
            },
            description: {
                ...defaultContent.endpointDiscovery.spinView.description,
                ...(source.endpointDiscovery?.spinView?.description ?? {}),
            },
        },
        custom: Array.isArray(source.endpointDiscovery?.custom) ? source.endpointDiscovery.custom : defaultContent.endpointDiscovery.custom,
    }

    const normalizeJourneyCollection = (items?: unknown) => {
        if (!Array.isArray(items)) return defaultContent.education
        return items.map((item) => normalizeJourneyEntry(item as Partial<JourneyItem>))
    }

    return {
        ...defaultContent,
        ...source,
        skills: Array.isArray(source.skills) ? source.skills : defaultContent.skills,
        projects: Array.isArray(source.projects) ? source.projects : defaultContent.projects,
        education: normalizeJourneyCollection(source.education),
        experience: normalizeJourneyCollection(source.experience),
        socials: Array.isArray(source.socials) ? source.socials : defaultContent.socials,
        endpointDiscovery,
    }
}

export function sanitizeSiteContent(value?: Partial<SiteContent> | null): SiteContent {
    const merged = mergeContentWithDefaults(value)

    const looksLikeDummyText = (input?: string) => {
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

    const isMeaningfulText = (value?: string) => typeof value === 'string' && value.trim().length > 0 && !looksLikeDummyText(value)
    const textValues = (value: string | LocalizedText | undefined) => {
        if (typeof value === 'string') return [value]
        if (value && typeof value === 'object') return [value.id, value.en].filter((entry): entry is string => typeof entry === 'string')
        return []
    }
    const isMeaningfulEntry = (item: Partial<JourneyItem>) =>
        textValues(item.title).some(isMeaningfulText) || textValues(item.period).some(isMeaningfulText) || textValues(item.subtitle).some(isMeaningfulText) || textValues(item.badge).some(isMeaningfulText)

    const cleanedEducation = merged.education.filter(isMeaningfulEntry)
    const cleanedExperience = merged.experience.filter(isMeaningfulEntry)
    const cleanedSocials = merged.socials.filter((item) => isMeaningfulText(item.label) || isMeaningfulText(item.url))
    const cleanedSkills = merged.skills.filter((item) => isMeaningfulText(item.name) || isMeaningfulText(item.mark))
    const cleanedCustomEndpoints = (merged.endpointDiscovery.custom ?? []).filter((item) => {
        const label = typeof item.label === 'string' ? item.label : ''
        const path = typeof item.path === 'string' ? item.path : ''
        const titleId = typeof item.title?.id === 'string' ? item.title.id : ''
        const titleEn = typeof item.title?.en === 'string' ? item.title.en : ''
        const descId = typeof item.description?.id === 'string' ? item.description.id : ''
        const descEn = typeof item.description?.en === 'string' ? item.description.en : ''
        return [label, path, titleId, titleEn, descId, descEn].some((value) => isMeaningfulText(value))
    })
    const cleanedProjects = merged.projects.filter((project) => {
        if (project.category === 'Design') {
            return isMeaningfulText(project.image) || isMeaningfulText(project.url)
        }

        return isMeaningfulText(project.title) || isMeaningfulText(project.year) || isMeaningfulText(project.type.id) || isMeaningfulText(project.type.en) || isMeaningfulText(project.description.id) || isMeaningfulText(project.description.en) || isMeaningfulText(project.role.id) || isMeaningfulText(project.role.en) || (project.tech?.length ?? 0) > 0 || isMeaningfulText(project.github) || isMeaningfulText(project.url)
    })

    return {
        ...merged,
        education: cleanedEducation,
        experience: cleanedExperience,
        socials: cleanedSocials,
        skills: cleanedSkills,
        endpointDiscovery: {
            ...merged.endpointDiscovery,
            custom: cleanedCustomEndpoints,
        },
        projects: cleanedProjects,
    }
}

export type TwibbonConfig = {
    title: string
    subtitle: string
    eyebrow: string
    templatePath: string
    captionTemplate: string
    outputFileName: string
}

export const defaultTwibbonConfig: TwibbonConfig = {
    title: 'Buat Twibbon Kamu',
    subtitle: 'Upload foto kamu, sesuaikan posisinya, dan buat twibbon kamu sendiri dalam beberapa langkah.',
    eyebrow: 'CREATIVE TOOL',
    templatePath: '/images/twibbon.png',
    captionTemplate: "I'm Ready For LKMM-TD Teknik Informatika Universitas Wiraraja 2026 🚀\n\nHalo, saya {nama} dari Program Studi Teknik Informatika, siap menjadi bagian dari Latihan Keterampilan Manajemen Mahasiswa Tingkat Dasar (LKMM-TD) HIMATIKA 2026.\n\nDengan semangat “Membangun Generasi Informatika yang Adaptif, Kolaboratif, dan Berintegritas”, saya siap membuka diri terhadap hal-hal baru, memperkuat kerja sama, serta menumbuhkan sikap tanggung jawab dalam setiap proses pembelajaran.\n\nMari bersama-sama membangun generasi Informatika yang tidak hanya unggul dalam pengetahuan, tetapi juga mampu beradaptasi, bekerja sama, dan memberikan kontribusi nyata.\n\nBerproses bersama, bertumbuh bersama, dan berdampak untuk sesama!\n\n#UniversitasWiraraja #HimatikaUnija #SalamSatuTeknik #BravoTeknik #LKMMTD26",
    outputFileName: 'twibbon-lkmmtd26',
}

export const sanitizeTwibbonConfig = (value?: Partial<TwibbonConfig> | null): TwibbonConfig => {
    const source = value ?? {}
    const text = (field: keyof TwibbonConfig) => typeof source[field] === 'string' ? source[field].trim() : defaultTwibbonConfig[field]
    return {
        title: text('title'),
        subtitle: text('subtitle'),
        eyebrow: text('eyebrow'),
        templatePath: text('templatePath'),
        captionTemplate: text('captionTemplate'),
        outputFileName: text('outputFileName').replace(/[^a-zA-Z0-9_.-]/g, '-') || defaultTwibbonConfig.outputFileName,
    }
}

export const twibbonConfig = defaultTwibbonConfig