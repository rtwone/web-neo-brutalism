import { useState } from 'react'
import { projects, translations } from '../data'
import type { Project, ProjectCategory } from '../data'

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

function buildMobileProjectBlocks(items: Project[]) {
    const blocks: Project[][] = []
    let current: Project[] = []

    items.forEach((project) => {
        if (project.category === 'Design') {
            if (current.length > 0 && current[0].category !== 'Design') {
                blocks.push(current)
                current = []
            }

            current.push(project)
            return
        }

        if (current.length > 0) {
            blocks.push(current)
            current = []
        }

        blocks.push([project])
    })

    if (current.length > 0) {
        blocks.push(current)
    }

    return blocks
}

export function ProjectsPage({ language }: { language: 'en' | 'id' }) {
    const [projectFilter, setProjectFilter] = useState<'All' | ProjectCategory>('All')
    const [selected, setSelected] = useState<Project | null>(null)
    const t = translations[language]

    const filteredProjects = projectFilter === 'All'
        ? projects
        : projects.filter((project) => project.category === projectFilter)

    const mobileProjectBlocks = buildMobileProjectBlocks(filteredProjects)

    return (
        <section className="section projects projects-page">
            <div className="projects-top section-heading">
                <span>04 / {language === 'id' ? 'Semua karya' : 'All work'}</span>
                <h1>{t.projects.title}</h1>
                <p>{t.projects.sub}</p>
            </div>
            <button className="text-link projects-back" onClick={() => window.history.back()}>
                {language === 'id' ? 'Kembali' : 'Go back'} <span>↙</span>
            </button>
            <div className="filter-tabs" role="tablist">
                {(['All', 'Design', 'Development', 'Other'] as const).map((item) => (
                    <button
                        className={projectFilter === item ? 'active' : ''}
                        key={item}
                        onClick={() => setProjectFilter(item)}
                    >
                        {item === 'All' ? t.projects.all : item === 'Design' ? t.projects.design : item === 'Development' ? t.projects.development : t.projects.other}
                    </button>
                ))}
            </div>

            {projectFilter === 'Design' ? (
                <div className="project-grid design-project-grid">
                    {filteredProjects.map((project) => (
                        <DesignProjectCard key={project.id} project={project} onSelect={setSelected} />
                    ))}
                </div>
            ) : projectFilter === 'All' ? (
                <div className="project-grid mobile-project-flow">
                    {mobileProjectBlocks.map((block, blockIndex) => {
                        const firstProject = block[0]

                        if (firstProject.category === 'Design') {
                            return (
                                <div
                                    key={`design-block-${firstProject.id ?? blockIndex}`}
                                    className={`mobile-design-block ${block.length === 1 ? 'single' : ''}`}
                                >
                                    {block.map((project) => (
                                        <DesignProjectCard key={project.id} project={project} onSelect={setSelected} />
                                    ))}
                                </div>
                            )
                        }

                        return block.map((project) => (
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
                        ))
                    })}
                </div>
            ) : (
                <div className="project-grid">
                    {filteredProjects.map((project) => (
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
            )}

            {selected && (
                <div className="modal-backdrop" onClick={() => setSelected(null)}>
                    <div
                        className={`modal ${selected.category === 'Design' ? 'design-modal' : ''}`}
                        style={{ boxShadow: `8px 8px 0 ${selected.fallbackColor}` }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button className="modal-close" onClick={() => setSelected(null)} aria-label={t.modal.close}>×</button>
                        <img
                            src={selected.image}
                            alt={`${selected.category === 'Development' ? selected.title : 'Design'} gallery`}
                            style={{ backgroundColor: selected.fallbackColor }}
                            onError={(event) => { event.currentTarget.style.opacity = '0' }}
                        />
                        {selected.category !== 'Design' && <>
                            <span className="category-badge">
                                {selected.category === 'Development' ? t.projects.development : t.projects.other}
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
        </section>
    )
}
