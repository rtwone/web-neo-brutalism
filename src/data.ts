export type Language = 'id' | 'en'
export type ProjectCategory = 'Design' | 'Development' | 'Other'

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
        marquee: 'PEMROGRAMAN | TEKNOLOGI | PENGGEMAR AI | VIDEOGRAFI | FOTOGRAFI | DESAIN GRAFIS | ASTROFIL | ALAM | SEJARAH |',
        skills: {
            kicker: '02 / Toolkit',
            title: 'Technical skills',
            sub: 'Peralatan yang saya gunakan untuk mengubah rasa ingin tahu menjadi sesuatu yang bisa dipakai.',
        },
        projects: {
            kicker: '03 / Selected work',
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
            kicker: '04 / Mari berkolaborasi',
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
        marquee: 'PROGRAMMING | TECH | AI ENTHUSIAST | VIDEOGRAPHY | PHOTOGRAPHY | DESIGN GRAPHIC | ASTROPHILE | NATURE | HISTORY |',
        skills: {
            kicker: '02 / Toolkit',
            title: 'Technical skills',
            sub: 'The tools I use to turn curiosity into something people can use.',
        },
        projects: {
            kicker: '03 / Selected work',
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
            kicker: '04 / Let’s collaborate',
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
    {
        name: 'JavaScript',
        group: 'Development',
        mark: 'JS',
        icon: 'javascript.svg',
        color: 'yellow',
    },
    {
        name: 'TypeScript',
        group: 'Development',
        mark: 'TS',
        icon: 'typescript.svg',
        color: 'blue',
    },
    {
        name: 'C#',
        group: 'Development',
        mark: 'C#',
        icon: 'csharp.svg',
        color: 'purple',
    },
    {
        name: 'NodeJS',
        group: 'Development',
        mark: 'N',
        icon: 'nodejs.svg',
        color: 'green',
    },
    {
        name: 'MySQL',
        group: 'Development',
        mark: 'SQL',
        icon: 'mysql.svg',
        color: 'orange',
    },
    {
        name: 'XAMPP',
        group: 'Development',
        mark: 'X',
        icon: 'xampp.svg',
        color: 'red',
    },
    {
        name: 'Git',
        group: 'Tools',
        mark: 'git',
        icon: 'git.svg',
        color: 'orange',
    },
    {
        name: 'VS Code',
        group: 'Tools',
        mark: 'VS',
        icon: 'vscode.svg',
        color: 'blue',
    },
    {
        name: 'GitHub',
        group: 'Tools',
        mark: 'GH',
        icon: 'github-dark.svg',
        darkIcon: 'github-light.svg',
        color: 'ink',
    },
    {
        name: 'GitHub Copilot',
        group: 'Tools',
        mark: 'AI',
        icon: 'github-copilot-dark.svg',
        darkIcon: 'github-copilot-light.svg',
        color: 'green',
    },
    {
        name: 'Figma',
        group: 'Design',
        mark: 'Fi',
        icon: 'figma.svg',
        color: 'pink',
    },
    {
        name: 'Canva',
        group: 'Design',
        mark: 'Ca',
        icon: 'canva.svg',
        color: 'blue',
    },
    {
        name: 'Adobe Photoshop',
        group: 'Design',
        mark: 'Ps',
        icon: 'photoshop.svg',
        color: 'blue',
    },
    {
        name: 'Adobe Premiere',
        group: 'Design',
        mark: 'Pr',
        icon: 'premiere.svg',
        color: 'purple',
    },
    {
        name: 'Adobe Illustrator',
        group: 'Design',
        mark: 'Ai',
        icon: 'illustrator.svg',
        color: 'orange',
    },
    {
        name: 'CorelDRAW',
        group: 'Design',
        mark: 'CD',
        icon: 'coreldraw.svg',
        color: 'green',
    },
]

type LocalizedText = { id: string; en: string }

type DevelopmentProject = {
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

type DesignProject = {
    id: number
    category: 'Design'
    image: string
    fallbackColor: string
    url?: string
}

export type Project = DevelopmentProject | DesignProject

export const projects: Project[] = [
    {
        id: 1,
        category: 'Development',
        title: 'RSUD System',
        type: {
            id: 'Aplikasi desktop',
            en: 'Desktop application',
        },
        year: '2026',
        image: '/images/developments/rsud-preview.png',
        fallbackColor: '#f28d69',
        description: {
            id: 'Sistem informasi rumah sakit berbasis desktop untuk membantu alur data pasien.',
            en: 'A desktop hospital information system designed to simplify patient data flows.',
        },
        tech: ['C#', 'WinForms', 'MySQL'],
        role: {
            id: 'Full-stack developer',
            en: 'Full-stack developer',
        },
        github: 'https://github.com/rtwone/RSUD-SYSTEM',
    },
    {
        id: 2,
        category: 'Development',
        title: 'Baileys Base',
        type: {
            id: 'Otomasi WhatsApp',
            en: 'WhatsApp Automation',
        },
        year: '2026',
        image: '/images/baileys-base.jpg',
        fallbackColor: '#ffea72',
        description: {
            id: 'Fondasi otomatisasi WhatsApp ringan dengan Baileys, menyediakan fungsi inti untuk bot, penanganan pesan, dan alur chat.',
            en: 'A lightweight WhatsApp automation foundation with Baileys, providing core functions for bots, message handling, and chat flows.',
        },
        tech: ['Node.js', 'TypeScript', 'JavaScript', 'Baileys'],
        role: {
            id: 'Product developer',
            en: 'Product developer',
        },
        github: 'https://github.com/rtwone/baileys-base',
    },
    {
        id: 3,
        category: 'Development',
        title: 'ChitandaBot',
        type: {
            id: 'Otomasi WhatsApp',
            en: 'WhatsApp Automation',
        },
        year: '2021',
        image: '/images/chitandabot.jpg',
        fallbackColor: '#8ab4f0',
        description: {
            id: 'Sistem chatbot modular untuk WhatsApp atau Telegram, fokus pada perintah, respons media, dan kustomisasi mudah untuk penggunaan pribadi atau bisnis.',
            en: 'A modular chatbot system for WhatsApp or Telegram, focused on command handling, media responses, and easy customization for personal or business use.',
        },
        tech: ['Node.js', 'TypeScript', 'JavaScript', 'Baileys'],
        role: {
            id: 'Product developer',
            en: 'Product developer',
        },
        github: 'https://github.com/rtwone/chitandabot',
    },
    {
        id: 4,
        category: 'Design',
        image: '/images/designs/17agustus2026.webp',
        fallbackColor: '#f8d34f',
        url: 'https://www.instagram.com/p/DcHD-snD4pb/',
    },
    {
        id: 5,
        category: 'Design',
        image: '/images/designs/5kesalahanmahasiswa.webp',
        fallbackColor: '#8ab4f0',
        url: 'https://www.instagram.com/p/DbyCKmcCYAV/',
    },
    {
        id: 6,
        category: 'Design',
        image: '/images/designs/maulidnabi.webp',
        fallbackColor: '#a8e3b4',
        url: 'https://www.instagram.com/p/Dca_zbvpY5N/',
    },
    {
        id: 7,
        category: 'Design',
        image: '/images/designs/1muharram.webp',
        fallbackColor: '#8ab4f0',
        url: 'https://www.instagram.com/p/DZmzCfWp-0o/',
    },
    {
        id: 8,
        category: 'Design',
        image: '/images/designs/aftermovieipw.webp',
        fallbackColor: '#f28d69',
        url: 'https://www.instagram.com/p/DbTH4Y5iZlg/',
    },
    {
        id: 10,
        category: 'Design',
        image: '/images/designs/docitclass.webp',
        fallbackColor: '#a8e3b4',
        url: 'https://www.instagram.com/p/DX4DF0IiSuu/',
    },
    {
        id: 11,
        category: 'Design',
        image: '/images/designs/harpennas.webp',
        fallbackColor: '#8ab4f0',
        url: 'https://www.instagram.com/p/DX0NnLuD06_/',
    },
    {
        id: 12,
        category: 'Design',
        image: '/images/designs/iduladha.webp',
        fallbackColor: '#a8e3b4',
        url: 'https://www.instagram.com/p/DYzQ9Bsp7fI/',
    },
    {
        id: 13,
        category: 'Design',
        image: '/images/designs/idulfitri.webp',
        fallbackColor: '#ffea72',
        url: 'https://www.instagram.com/p/DWGoMdfEZhz/',
    },
    {
        id: 14,
        category: 'Design',
        image: '/images/designs/itclass.webp',
        fallbackColor: '#f28d69',
        url: 'https://www.instagram.com/p/DXuPsItiYFH/',
    },
    {
        id: 15,
        category: 'Design',
        image: '/images/designs/kenaikanyesus.webp',
        fallbackColor: '#8ab4f0',
        url: 'https://www.instagram.com/p/DYTQh7tJ8FQ/',
    },
    {
        id: 16,
        category: 'Design',
        image: '/images/designs/nyepi.webp',
        fallbackColor: '#a8e3b4',
        url: 'https://www.instagram.com/p/DWCF1r0CUGF/',
    },
    {
        id: 17,
        category: 'Design',
        image: '/images/designs/ramadhan.webp',
        fallbackColor: '#ffea72',
        url: 'https://www.instagram.com/p/DU5hE9YiV0T/',
    },
    {
        id: 18,
        category: 'Design',
        image: '/images/designs/workshopipw2026.webp',
        fallbackColor: '#f28d69',
        url: 'https://www.instagram.com/p/DZ9EPKRp6T9/',
    },
]

export type Translations = typeof translations.id

export const twibbonConfig = {
    title: 'Buat Twibbon Kamu',
    subtitle: 'Upload foto kamu, sesuaikan posisinya, dan buat twibbon kamu sendiri dalam beberapa langkah.',
    eyebrow: '05 / CREATIVE TOOL',
    templatePath: '/images/twibbon.png',
    captionTemplate: 'Template Caption untuk Testing {nama} dan {keterangan}',
    outputFileName: 'twibbon-karya.png',
    instagramPostUrl: 'https://www.instagram.com/',
} as const
