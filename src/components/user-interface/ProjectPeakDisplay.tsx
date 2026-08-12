import React, { memo } from 'react';
import type { Project } from '../../data/portfolioPeaks';

interface ProjectPeakDisplayProps {
    projects: Project[];
}

const Section = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="flex flex-col gap-1 text-xs leading-6 text-[#fff8ee] opacity-90">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffd27a]">{label}</span>
        {children}
    </div>
));

Section.displayName = 'Section';

const ProjectCard = memo(({ project }: { project: Project }) => (
    <details className="rounded-xl border border-[rgba(255,210,122,0.3)] px-4 backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 [&::-webkit-details-marker]:hidden">
            <span className="text-sm font-bold text-[#fff8ee]">{project.title}</span>
            <span className="text-lg text-[#ffd27a]">›</span>
        </summary>

        <div className="flex flex-col gap-3 border-t border-[rgba(255,210,122,0.2)] py-3.5">
            <Section label="Problem"><p>{project.problem}</p></Section>
            <Section label="My Role"><p>{project.role}</p></Section>
            <Section label="Tech">
                <div className="flex flex-wrap gap-1.5">
                    {project.tech.map((t) => (
                        <span
                            key={t}
                            className="rounded-md border border-[rgba(255,210,122,0.4)] px-2 py-0.5 text-xs font-semibold text-[#ffd27a]"
                        >
                            {t}
                        </span>
                    ))}
                </div>
            </Section>
            <Section label="Features">
                <ul className="flex list-none flex-col gap-1 p-0">
                    {project.features.map((f) => (
                        <li key={f} className="relative pl-4 text-xs leading-5 text-[#fff8ee] opacity-90 before:absolute before:left-0 before:text-[#ffd27a] before:content-['›']">
                            {f}
                        </li>
                    ))}
                </ul>
            </Section>
            <Section label="Impact"><p className="font-semibold text-[#fff0c5]">{project.impact}</p></Section>
        </div>
    </details>
));

ProjectCard.displayName = 'ProjectCard';

export function ProjectPeakDisplay({ projects }: ProjectPeakDisplayProps) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))}
        </div>
    );
}

export default ProjectPeakDisplay;