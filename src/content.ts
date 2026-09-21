import { projects, skills, translations } from './data'
import type { Project, Skill } from './data'

export type LocalizedText = { id: string; en: string }

export type JourneyEntry = {
    period: string
    title: string
    subtitle: string
    tone: 'blue' | 'yellow' | 'orange' | 'green' | 'white'
    badge?: string
}

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
    },
}

export type { Project, Skill }