  /**
   * @file PeakDetailsDialog.tsx
   * @description Radix dialog for displaying detailed portfolio content for the selected mountain peak.
   */

  import { useEffect } from 'react';
  import * as Dialog from '@radix-ui/react-dialog';
  import { AnimatePresence, motion } from 'framer-motion';

  import { PEAKS, type Peak, type Project } from '../data/portfolioPeaks';

  interface PeakDetailsDialogProps {
    peakId: string | null;
    onClose: () => void;
  }

  export function PeakDetailsDialog({ peakId, onClose }: PeakDetailsDialogProps) {
    const peak = peakId ? PEAKS.find((item) => item.id === peakId) ?? null : null;
    const open = !!peak;

    /* ─────────────────────────────────────────────
      Escape Close
    ───────────────────────────────────────────── */

    useEffect(() => {
      const handler = (event: KeyboardEvent) => {
        if (event.key === 'Escape') onClose();
      };

      window.addEventListener('keydown', handler);
      return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
      <Dialog.Root
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose();
        }}
      >
        <AnimatePresence>
          {open && peak && (
            <Dialog.Portal forceMount>
              <Dialog.Overlay asChild>
                <motion.div
                  className="fixed inset-0 z-[1000] bg-[rgba(26,8,2,0.72)] backdrop-blur-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={onClose}
                />
              </Dialog.Overlay>

              <Dialog.Content asChild>
                <motion.div
                  className="glass dialog-scroll fixed bottom-0 left-1/2 z-[1001] max-h-[82vh] w-full max-w-[760px] -translate-x-1/2 overflow-y-auto rounded-t-3xl border-b-0 p-0 outline-none"
                  role="dialog"
                  aria-modal="true"
                  initial={{ opacity: 0, y: 60, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 40, scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                >
                  {/* ── Dialog Header ───────────── */}
                  <div className="sticky top-0 z-10 flex items-start justify-between border-b border-[rgba(255,210,122,0.14)] bg-[rgba(58,18,6,0.92)] px-8 py-6 backdrop-blur-2xl">
                    <div>
                      <Dialog.Title className="font-display text-2xl font-bold leading-tight tracking-[-0.02em] text-[var(--text-primary)]">
                        {peak.label}
                      </Dialog.Title>

                      <Dialog.Description className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
                        {peak.subtitle}
                      </Dialog.Description>
                    </div>

                    <Dialog.Close asChild>
                      <button
                        type="button"
                        className="ml-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(255,210,122,0.25)] bg-[rgba(255,210,122,0.08)] text-[var(--text-secondary)] transition-all hover:scale-110 hover:bg-[rgba(255,210,122,0.15)] hover:text-[var(--text-primary)]"
                        aria-label="Close panel"
                      >
                        ✕
                      </button>
                    </Dialog.Close>
                  </div>

                  {/* ── Dialog Body ─────────────── */}
                  <div className="px-8 py-7">
                    <PeakContent peak={peak} />
                  </div>
                </motion.div>
              </Dialog.Content>
            </Dialog.Portal>
          )}
        </AnimatePresence>
      </Dialog.Root>
    );
  }

  /* ─────────────────────────────────────────────
    Peak Content Renderer
  ───────────────────────────────────────────── */

  function PeakContent({ peak }: { peak: Peak }) {
    const { content } = peak;

    if (content.type === 'origin') {
      return (
        <div>
          <h3 className="glow-text mb-2.5 text-xl font-bold">
            {content.title}
          </h3>

          <p className="mb-5 border-l-4 border-[var(--accent)] pl-4 text-base italic leading-7 text-[var(--text-secondary)]">
            {content.tagline}
          </p>

          <p className="text-[0.95rem] leading-8 text-[var(--text-primary)] opacity-90">
            {content.bio}
          </p>
        </div>
      );
    }

    if (content.type === 'skills') {
      const categories = [...new Set(content.skills.map((skill) => skill.category))];

      return (
        <div className="flex flex-col gap-6">
          {categories.map((category) => (
            <div key={category}>
              <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[var(--accent)]">
                {category}
              </h4>

              <div className="flex flex-wrap gap-2">
                {content.skills
                  .filter((skill) => skill.category === category)
                  .map((skill) => (
                    <div
                      key={skill.name}
                      className="flex items-center gap-2.5 rounded-lg border border-[rgba(255,210,122,0.18)] bg-[rgba(255,210,122,0.07)] px-3 py-1.5 transition hover:border-[rgba(255,210,122,0.4)] hover:bg-[rgba(255,210,122,0.14)]"
                    >
                      <span className="text-sm font-medium text-[var(--text-primary)]">
                        {skill.name}
                      </span>

                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, index) => (
                          <span
                            key={index}
                            className={`h-1.5 w-1.5 rounded-sm ${
                              index < skill.level
                                ? 'bg-[var(--accent)] shadow-[0_0_4px_var(--accent-glow)]'
                                : 'bg-[rgba(255,210,122,0.16)]'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (content.type === 'experience') {
      return (
        <div className="flex flex-col gap-5">
          {content.roles.map((role) => (
            <div key={role.company} className="glass rounded-2xl p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <span className="font-display text-base font-bold text-[var(--accent)]">
                  {role.company}
                </span>

                <span className="rounded-full border border-[rgba(255,210,122,0.2)] bg-[rgba(255,210,122,0.08)] px-3 py-1 text-xs text-[var(--text-muted)]">
                  {role.duration}
                </span>
              </div>

              <ul className="flex list-none flex-col gap-2.5 p-0">
                {role.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2.5 text-sm leading-7 text-[var(--text-primary)] opacity-90"
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      );
    }

    if (content.type === 'projects') {
      return <ProjectsPanel projects={content.projects} />;
    }

    if (content.type === 'impact') {
      return (
        <div className="flex flex-col gap-3">
          {content.achievements.map((achievement, index) => (
            <motion.div
              key={achievement.title}
              className="glass flex items-start gap-4 rounded-xl p-4 transition hover:border-[rgba(255,210,122,0.35)] hover:bg-[rgba(255,210,122,0.07)]"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.08 }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,210,122,0.1)] text-2xl">
                {achievement.icon}
              </div>

              <div>
                <h4 className="mb-1 text-sm font-bold text-[var(--text-primary)]">
                  {achievement.title}
                </h4>

                <p className="text-sm leading-7 text-[var(--text-secondary)]">
                  {achievement.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      );
    }

    if (content.type === 'resume') {
      return (
        <div className="py-5 text-center">
          <p className="mb-8 text-base leading-7 text-[var(--text-secondary)]">
            Take a closer look at my full background.
          </p>

          <div className="mx-auto flex max-w-[360px] flex-col gap-3">
            {content.links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2.5 rounded-xl border px-7 py-3.5 text-sm font-bold no-underline transition hover:-translate-y-0.5 ${
                  link.label === 'Download Resume'
                    ? 'border-[rgba(255,210,122,0.45)] bg-[rgba(255,210,122,0.16)] text-[var(--accent)]'
                    : 'border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.07)] text-[var(--text-primary)] hover:bg-[rgba(255,210,122,0.13)]'
                }`}
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      );
    }

    if (content.type === 'contact') {
      return (
        <div className="mx-auto max-w-[560px] py-4 text-center">
          <p className="mb-8 text-base italic leading-8 text-[var(--text-secondary)]">
            {content.message}
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${content.email}`}
              className="rounded-xl border border-[rgba(255,210,122,0.4)] bg-[rgba(255,210,122,0.12)] px-7 py-3.5 text-sm font-bold text-[var(--accent)] no-underline transition hover:-translate-y-0.5"
            >
              ✉️ &nbsp; Send an Email
            </a>

            <a
              href={content.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.06)] px-7 py-3.5 text-sm font-bold text-[var(--text-primary)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.12)]"
            >
              💼 &nbsp; Connect on LinkedIn
            </a>

            <a
              href={content.github}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.06)] px-7 py-3.5 text-sm font-bold text-[var(--text-primary)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.12)]"
            >
              🐙 &nbsp; View GitHub
            </a>
          </div>
        </div>
      );
    }

    return null;
  }

  /* ─────────────────────────────────────────────
    Project Case Study Panel
  ───────────────────────────────────────────── */

  function ProjectsPanel({ projects }: { projects: Project[] }) {
    return (
      <div className="flex flex-col gap-2.5">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>
    );
  }

  function ProjectCard({ project, index }: { project: Project; index: number }) {
    return (
      <motion.details
        className="glass overflow-hidden rounded-xl border border-[rgba(255,210,122,0.16)]"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between px-4.5 py-3.5 transition hover:bg-[rgba(255,210,122,0.07)] [&::-webkit-details-marker]:hidden">
          <span className="font-display text-sm font-bold text-[var(--text-primary)]">
            {project.title}
          </span>

          <span className="text-xl text-[var(--accent)] transition group-open:rotate-90">
            ›
          </span>
        </summary>

        <div className="mx-[18px] flex flex-col gap-3.5 border-t border-[rgba(255,210,122,0.12)] py-4">
          <ProjectSection label="Problem">
            <p>{project.problem}</p>
          </ProjectSection>

          <ProjectSection label="My Role">
            <p>{project.role}</p>
          </ProjectSection>

          <ProjectSection label="Tech">
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="rounded-md border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.08)] px-2.5 py-1 text-xs font-semibold text-[var(--accent)]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </ProjectSection>

          <ProjectSection label="Features">
            <ul className="flex list-none flex-col gap-1.5 p-0">
              {project.features.map((feature) => (
                <li
                  key={feature}
                  className="relative pl-4 text-sm leading-6 text-[var(--text-primary)] opacity-85 before:absolute before:left-0 before:text-[var(--accent)] before:content-['›']"
                >
                  {feature}
                </li>
              ))}
            </ul>
          </ProjectSection>

          <div className="rounded-xl border border-[rgba(255,210,122,0.18)] bg-[rgba(255,210,122,0.07)] p-3">
            <ProjectSection label="Impact">
              <p className="font-semibold text-[#fff0c5]">
                {project.impact}
              </p>
            </ProjectSection>
          </div>
        </div>
      </motion.details>
    );
  }

  function ProjectSection({
    label,
    children,
  }: {
    label: string;
    children: React.ReactNode;
  }) {
    return (
      <div className="flex flex-col gap-1.5 text-sm leading-7 text-[var(--text-primary)] opacity-90">
        <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--accent)]">
          {label}
        </span>

        {children}
      </div>
    );
  }