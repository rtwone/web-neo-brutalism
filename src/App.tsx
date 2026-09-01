import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, FormEvent } from 'react'
import { projects, skills, translations } from './data'
import type { Language, Project } from './data'
import { VisitorStats } from './components/VisitorStats'
import { NotFoundPage } from './pages/notFound.tsx'
import { ProjectsPage } from './pages/projects.tsx'
import { TwibbonPage } from './pages/twibbon.tsx'
import { SpinViewPage } from './pages/spinView.tsx'
import './App.css'

type ContactIconName = 'mail' | 'github' | 'instagram' | 'linkedin'

function TypedRole({ text }: { text: string }) {
  const professions = text.split(' | ').map(p => p.trim())
  const [displayText, setDisplayText] = useState('')
  const [professionIndex, setProfessionIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentProfession = professions[professionIndex]
    const typingSpeed = 80
    const deletingSpeed = 15
    const pauseTime = 1000

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex < currentProfession.length) {
        setDisplayText(currentProfession.substring(0, charIndex + 1))
        setCharIndex(charIndex + 1)
      } else if (isDeleting && charIndex > 0) {
        setDisplayText(currentProfession.substring(0, charIndex - 1))
        setCharIndex(charIndex - 1)
      } else if (!isDeleting && charIndex === currentProfession.length) {
        setTimeout(() => setIsDeleting(true), pauseTime)
      } else if (isDeleting && charIndex === 0) {
        setIsDeleting(false)
        setProfessionIndex((professionIndex + 1) % professions.length)
      }
    }, (!isDeleting && charIndex === currentProfession.length) ? pauseTime : (isDeleting ? deletingSpeed : typingSpeed))

    return () => clearTimeout(timer)
  }, [charIndex, isDeleting, professionIndex, professions])

  return (
    <span className="typed-role">
      {displayText}
      <span className="typed-cursor" />
    </span>
  )
}

function ContactIcon({ name }: { name: ContactIconName }) {
  const paths = {
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
    github: <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3.3 0 6.7-1.6 6.7-7A5.4 5.4 0 0 0 19.6 4 5 5 0 0 0 19.5 1S18.3.6 15 2.8a13.4 13.4 0 0 0-6 0C5.7.6 4.5 1 4.5 1a5 5 0 0 0-.1 3A5.4 5.4 0 0 0 3.3 7.5c0 5.4 3.4 7 6.7 7a4.8 4.8 0 0 0-1 3.5v4" />,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".5" /></>,
    linkedin: <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6Z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></>,
  }

  return <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}

function DesignProjectCard({ project, onSelect }: { project: Project; onSelect: (project: Project) => void }) {
  return (
    <article
      className="project-card design-project-card"
      onClick={() => onSelect(project)}
      tabIndex={0}
      onKeyDown={(event) => event.key === 'Enter' && onSelect(project)}
    >
      <div className="project-image" style={{ backgroundColor: project.fallbackColor }}>
        <img
          loading="lazy"
          decoding="async"
          src={project.image}
          alt="Design project preview"
          onError={(event) => { event.currentTarget.style.opacity = '0' }}
        />
        <span>{project.category}</span>
      </div>
    </article>
  )
}

function App() {
  const [language, setLanguage] = useState<Language>(
    () => (localStorage.getItem('language') as Language) || 'en',
  )
  const [dark, setDark] = useState(
    () => localStorage.getItem('theme') === 'dark',
  )
  const [selected, setSelected] = useState<Project | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [scrollDepth, setScrollDepth] = useState(0)
  const pendingNavigation = useRef<string | null>(null)
  const normalizeActiveSection = (section: string) => {
    if (section === 'journey' || section === 'skills') return 'about'
    return section
  }

  const [activeSection, setActiveSection] = useState(
    () => window.location.pathname.replace(/\/$/, '') === '/projects'
      ? 'projects'
      : normalizeActiveSection(window.location.hash.slice(1) || 'home'),
  )
  const [formState, setFormState] = useState<'idle' | 'sending' | 'success' | 'validation-error' | 'send-error'>('idle')
  const t = translations[language]
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    localStorage.setItem('theme', dark ? 'dark' : 'light')
  }, [dark])

  useEffect(() => {
    document.documentElement.lang = language
    localStorage.setItem('language', language)
  }, [language])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > window.innerHeight)
      setScrollDepth(window.scrollY)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const handleHashChange = () => setActiveSection(normalizeActiveSection(window.location.hash.slice(1) || 'home'))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    if (window.location.pathname.replace(/\/$/, '') === '/projects') return

    const sections = ['home', 'about', 'journey', 'projects', 'contact']
      .map((sectionId) => document.getElementById(sectionId))
      .filter((section): section is HTMLElement => section !== null)
    const observer = new IntersectionObserver(
      (entries) => {
        if (pendingNavigation.current) {
          const targetEntry = entries.find(
            (entry) => entry.isIntersecting && entry.target.id === pendingNavigation.current,
          )

          if (!targetEntry) return
          pendingNavigation.current = null
          setActiveSection(targetEntry.target.id)
          return
        }

        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0]

        const homeSection = document.getElementById('home')
        const homeInView = homeSection && homeSection.getBoundingClientRect().top <= window.innerHeight * .35 && homeSection.getBoundingClientRect().bottom >= window.innerHeight * .25

        const aboutSection = document.getElementById('about')
        const aboutInView = aboutSection && aboutSection.getBoundingClientRect().top <= window.innerHeight * .7 && aboutSection.getBoundingClientRect().bottom >= 0

        if (homeInView) {
          setActiveSection('home')
          return
        }

        if (aboutInView) {
          setActiveSection('about')
          return
        }

        if (visibleSection) setActiveSection(normalizeActiveSection(visibleSection.target.id))
      },
      { rootMargin: '-20% 0px -55% 0px', threshold: [0, .25, .5, .75] },
    )

    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    document.querySelectorAll<HTMLElement>('.reveal-on-scroll').forEach((element) => {
      element.classList.remove('reveal-on-scroll', 'is-visible')
      element.style.removeProperty('--reveal-delay')
    })

    const revealElements = Array.from(document.querySelectorAll<HTMLElement>(
      '.section:not(.hero) > *, .marquee, footer, .journey-panel, .journey-panel-header, .timeline-item, .journey-card',
    ))

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting)
        })
      },
      { rootMargin: '0px', threshold: .08 },
    )

    revealElements.forEach((element, index) => {
      element.classList.add('reveal-on-scroll')
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`)
      observer.observe(element)
    })

    return () => {
      observer.disconnect()
      revealElements.forEach((element) => {
        element.classList.remove('reveal-on-scroll', 'is-visible')
        element.style.removeProperty('--reveal-delay')
      })
    }
  }, [language])

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = event.currentTarget

    if (!form.checkValidity()) {
      setFormState('validation-error')
      return
    }

    setFormState('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })

      if (!response.ok) throw new Error('Email request failed')

      setFormState('success')
      form.reset()
    } catch {
      setFormState('send-error')
    }
  }

  const currentPath = window.location.pathname.replace(/\/$/, '') || '/'
  const isProjectsPage = currentPath === '/projects'
  const isTwibbonPage = currentPath === '/twibbon'
  const isSpinViewPage = currentPath === '/spin-view'
  const isUnknownPage = !['/', '/projects', '/twibbon', '/spin-view'].includes(currentPath)
  const designProjects = projects.filter((project) => project.category === 'Design')
  const developmentProjects = projects.filter((project) => project.category === 'Development')

  const handleBrandClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    window.location.assign(currentPath)
  }

  if (isUnknownPage) {
    return <NotFoundPage language={language} />
  }

  return (
    <div className="site-shell">
      <header className="navbar">
        <div className="nav-brand">
          <a className="nav-brand-link" href={currentPath} onClick={handleBrandClick}>
            <span className="brand">IH<span>.</span></span>
            <span className="nav-brand-text">Portofolio<br />Irfan Hariyanto</span>
          </a>
        </div>
        <button
          className="menu-button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? 'nav-links open' : 'nav-links'}>
          {Object.entries(t.nav).map(([key, label]) => (
            <a
              className={activeSection === key ? 'active' : ''}
              key={key}
              href={`${isProjectsPage || isTwibbonPage || isSpinViewPage ? '/' : ''}#${key === 'home' ? 'home' : key}`}
              onClick={() => {
                pendingNavigation.current = key
                setActiveSection(key)
                setMenuOpen(false)
              }}
            >
              {label}
            </a>
          ))}
          <div className="nav-actions">
            <button
              className="lang"
              onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
              aria-label="Change language"
            >
              <b>{language === 'id' ? 'ID' : 'EN'}</b>
              <span>/</span>
              {language === 'id' ? 'EN' : 'ID'}
            </button>
            <button
              className="theme-toggle"
              onClick={() => setDark(!dark)}
              aria-label="Toggle color theme"
            >
              {dark ? '☼' : '☾'}
            </button>
          </div>
        </nav>
      </header>

      <main>
        {isSpinViewPage ? (
          <SpinViewPage language={language} />
        ) : isTwibbonPage ? (
          <TwibbonPage />
        ) : isProjectsPage ? (
          <ProjectsPage language={language} />
        ) : <>
          <section id="home" className="hero section">
            <div className="hero-copy">
              <div className="eyebrow">
                <span className="eyebrow-mark" aria-hidden="true">✶</span> {t.hero.eyebrow}
              </div>
              <h1>
                {t.hero.title}<i>✦</i>
              </h1>
              <p className="role"><TypedRole text={t.hero.role} /></p>
              <p className="hero-description">{t.hero.description}</p>
              <div className="hero-actions">
                <a className="button primary" href="#projects">
                  {t.hero.projects} <span>↗</span>
                </a>
                <a className="button secondary" href="#contact">
                  {t.hero.contact}
                </a>
              </div>
            </div>
            <div className="hero-art" aria-hidden="true">
              <div className="art-grid" />
              <div className="art-card card-yellow">
                <b>OPEN</b>
                <span>to new<br />ideas</span>
              </div>
              <div className="art-card card-blue">
                <span>01</span>
                <b>BUILD<br />WITH<br />PURPOSE</b>
              </div>
              <div className="art-cross">+</div>
              <div className="art-label">// curious by nature</div>
            </div>
          </section>

          <div className="marquee" aria-label={t.marquee}>
            <span>{t.marquee}{t.marquee}</span>
          </div>
          <section id="about" className="section about">
            <div className="section-heading">
              <span>{t.about.kicker}</span>
              <h2>{t.about.title}</h2>
            </div>
            <div className="about-grid">
              <div className="portrait">
                <div className="portrait-inner">
                  <img src="/images/profile.jpg" alt="Irfan Hariyanto" />
                </div>
                <div className="portrait-orbit" aria-hidden="true">
                  {Array.from({ length: 12 }, (_, index) => <span className="orbit-dot" key={index} />)}
                </div>
                <div className="portrait-tag">CREATIVE<br />TECH ✦</div>
              </div>
              <div className="about-content">
                <p>{t.about.text}</p>
                <div className="focus">
                  <span>{t.about.focus}</span>
                  <div className="focus-list">
                    <b>Programming</b>
                    <b>Web Development</b>
                    <b>Graphic Design</b>
                    <b>Creative Technology</b>
                    <b>Artificial Intelligence</b>
                  </div>
                </div>
                <a className="text-link" href="#contact">
                  {t.about.cta} <span>↗</span>
                </a>
                <VisitorStats />
              </div>
            </div>
          </section>

          <section id="journey" className="section journey">
            <div className="section-heading reveal-on-scroll">
              <span>{t.journey.kicker}</span>
              <h2>{t.journey.title}</h2>
              <p>{t.journey.subtitle}</p>
            </div>

            <div className="journey-layout reveal-on-scroll">
              <div className="journey-panel reveal-on-scroll">
                <div className="journey-panel-header reveal-on-scroll">
                  <span>{t.journey.education}</span>
                </div>
                <div className="timeline">
                  {t.journey.educationItems.map((item) => (
                    <article key={`${item.period}-${item.title}`} className="timeline-item reveal-on-scroll">
                      <div className="timeline-marker" aria-hidden="true" />
                      <div className="timeline-content">
                        <span className="journey-date">{item.period}</span>
                        <div className={`journey-card journey-card--${item.tone}`}>
                          <h3>{item.title}</h3>
                          {item.subtitle && <p>{item.subtitle}</p>}
                          {item.badge && <span className="journey-badge">{item.badge}</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <div className="journey-panel reveal-on-scroll">
                <div className="journey-panel-header reveal-on-scroll">
                  <span>{t.journey.experience}</span>
                </div>
                <div className="timeline">
                  {t.journey.experienceItems.map((item) => (
                    <article key={`${item.period}-${item.title}`} className="timeline-item reveal-on-scroll">
                      <div className="timeline-marker" aria-hidden="true" />
                      <div className="timeline-content">
                        <span className="journey-date">{item.period}</span>
                        <div className={`journey-card journey-card--${item.tone}`}>
                          <h3>{item.title}</h3>
                          {item.subtitle && <p>{item.subtitle}</p>}
                          {item.badge && <span className="journey-badge">{item.badge}</span>}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section id="skills" className="section skills">
            <div className="section-heading">
              <span>{t.skills.kicker}</span>
              <h2>{t.skills.title}</h2>
              <p>{t.skills.sub}</p>
            </div>
            <div className="skills-list">
              {skills.map((skill) => (
                <div className={`skill-card ${skill.color}`} key={skill.name}>
                  <span className="skill-mark">
                    <img src={`/icons/${dark && skill.darkIcon ? skill.darkIcon : skill.icon}`} alt="" />
                  </span>
                  <span>{skill.name}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="projects" className="section projects">
            <div className="projects-top section-heading">
              <span>{t.projects.kicker}</span>
              <h2>{t.projects.title}</h2>
              <p>{t.projects.sub}</p>
            </div>
            <div className="project-grid">
              {developmentProjects.slice(0, 3).map((project) => (
                <article
                  className="project-card"
                  key={project.id}
                  onClick={() => setSelected(project)}
                  tabIndex={0}
                  onKeyDown={(event) => event.key === 'Enter' && setSelected(project)}
                >
                  <div className="project-image" style={{ backgroundColor: project.fallbackColor }}>
                    <img loading="lazy" src={project.image} alt={`${project.title} project preview`} onError={(event) => { event.currentTarget.style.opacity = '0' }} />
                    <span>{project.category}</span>
                  </div>
                  <div className="project-info">
                    <div className="project-meta">
                      <span>{project.type[language]}</span>
                      <span>{project.year}</span>
                    </div>
                    <h3>{project.title}</h3>
                    <p>{project.description[language]}</p>
                    <div className="tech-row">
                      {project.tech.map((tech) => <small key={tech}>{tech}</small>)}
                    </div>
                    <button className="card-link">{t.projects.view} <span>↗</span></button>
                  </div>
                </article>
              ))}
            </div>
            {designProjects.length > 0 && (
              <div className="design-project-preview">
                {designProjects.slice(0, 3).map((project) => (
                  <DesignProjectCard key={project.id} project={project} onSelect={setSelected} />
                ))}
              </div>
            )}
            {projects.length > 3 && (
              <a className="text-link project-more" href="/projects">
                {t.projects.more} <span>↗</span>
              </a>
            )}
          </section>

          <section id="contact" className="section contact">
            <div className="contact-intro section-heading">
              <span>{t.contact.kicker}</span>
              <h2>{t.contact.title}</h2>
              <p>{t.contact.sub}</p>
              <div className="contact-details">
                <span>{t.contact.details}</span>
                <div className="contact-social">
                  <a href="mailto:irfanhariyanto317@gmail.com"><ContactIcon name="mail" />Email</a>
                  <a href="https://github.com/rtwone" target="_blank"><ContactIcon name="github" />GitHub</a>
                  <a href="https://instagram.com/irfvnny" target="_blank"><ContactIcon name="instagram" />Instagram</a>
                  <a href="https://www.linkedin.com/in/irfanhariyanto" target="_blank"><ContactIcon name="linkedin" />LinkedIn</a>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <div className="contact-fields-row">
                <label>{t.contact.name}<input required name="name" placeholder={t.contact.namePlaceholder} /></label>
                <label>{t.contact.email}<input required type="email" name="email" placeholder={t.contact.emailPlaceholder} /></label>
              </div>
              <label>{t.contact.subject}<input required name="subject" placeholder={t.contact.subjectPlaceholder} /></label>
              <label>{t.contact.message}<textarea required name="message" rows={4} placeholder={t.contact.messagePlaceholder} /></label>
              <button
                type="submit"
                className={`button primary ${formState === 'validation-error' ? 'shake-error' : ''}`}
                disabled={formState === 'sending'}
                onClick={(event) => {
                  if (event.currentTarget.form?.checkValidity() === false) {
                    setFormState('idle')
                    requestAnimationFrame(() => setFormState('validation-error'))
                  }
                }}
              >
                {formState === 'sending' ? t.contact.sending : t.contact.send} <span>↗</span>
              </button>
              {formState === 'success' && <p className="form-message success">{t.contact.success}</p>}
              {formState === 'validation-error' && <p className="form-message error">{t.contact.error}</p>}
              {formState === 'send-error' && <p className="form-message error">{t.contact.sendError}</p>}
            </form>
          </section>
        </>}
      </main>
      <footer>
        <a className="brand" href={currentPath} onClick={handleBrandClick}>IH<span>.</span></a>
        <small>{t.footer}</small>
      </footer>

      {showScrollTop && (
        <button
          className="scroll-top"
          style={{ '--shake-duration': `${Math.max(.65, 1.2 - scrollDepth / 12000)}s` } as CSSProperties}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label={language === 'id' ? 'Kembali ke atas' : 'Back to top'}
          title={language === 'id' ? 'Kembali ke atas' : 'Back to top'}
        >
          ↑
        </button>
      )}

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className={`modal ${selected.category === 'Design' ? 'design-modal' : ''}`}
            style={{ boxShadow: `8px 8px 0 ${selected.fallbackColor}` }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label={t.modal.close}
            >
              ×
            </button>
            <img
              src={selected.image}
              alt={`${selected.category === 'Development' ? selected.title : 'Design'} gallery`}
              style={{ backgroundColor: selected.fallbackColor }}
              onError={(event) => { event.currentTarget.style.opacity = '0' }}
            />
            {selected.category !== 'Design' && <>
              <span className="category-badge">
                {t.projects.development}
              </span>
              <h2>{selected.title}</h2>
              <p>{selected.description[language]}</p>
              <div className="modal-facts">
                <span>
                  <b>{t.modal.role}</b>
                  {selected.role[language]}
                </span>
                <span>
                  <b>{t.modal.year}</b>
                  {selected.year}
                </span>
                <span>
                  <b>Stack</b>
                  {selected.tech.join(' • ')}
                </span>
              </div>
            </>}
            {(selected.url || (selected.category === 'Development' && selected.github)) && (
              <a className="button secondary" href={selected.url || (selected.category === 'Development' ? selected.github : undefined)} target="_blank" rel="noreferrer">
                {selected.url ? t.projects.url : t.projects.github} ↗
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
