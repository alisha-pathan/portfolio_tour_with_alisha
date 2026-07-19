/**
 * @file PeakDetailOverlay.tsx
 * @description Full-screen peak "page" that opens with a zoom transition
 * anchored to the exact point the person clicked. Content lives in two
 * floating glass panels (left = intro, right = details) with a fully
 * transparent center — the zoomed 3D mountain (Scene3D never stops
 * rendering behind this) stays visible the whole time, like a Minecraft
 * world-select screen: the world keeps breathing behind translucent UI.
 *
 * v2: background went from a solid dark fill to a transparent center with
 * only a soft edge vignette for text contrast — the previous version
 * fully hid the 3D scene once open, defeating the point of the camera
 * dolly-in. Content restructured into two side panels instead of one
 * centered column, so there's an open "window" in the middle.
 */
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { PEAKS, type Peak, type Project } from '../data/portfolioPeaks';
import { PATH_NODES } from '../three/path';

export interface ZoomOrigin {
  x: number;
  y: number;
}

interface PeakDetailOverlayProps {
  peakId: string | null;
  origin: ZoomOrigin | null;
  onClose: () => void;
}

export function PeakDetailOverlay({ peakId, origin, onClose }: PeakDetailOverlayProps) {
  const peak = peakId ? PEAKS.find((p) => p.id === peakId) ?? null : null;
  const open = !!peak;

  const peakIds = PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end').map((n) => n.id);
  const index = peak ? peakIds.indexOf(peak.id) : -1;

  const originX = origin?.x ?? window.innerWidth / 2;
  const originY = origin?.y ?? window.innerHeight / 2;

  return (
    <AnimatePresence>
      {open && peak && (
        <motion.div
          key={peak.id}
          className="fixed inset-0 z-[1000] flex flex-col md:flex-row"
          style={{
            transformOrigin: `${originX}px ${originY}px`,
            // Transparent center — the zoomed 3D mountain stays visible.
            // Only the far edges darken slightly, for text contrast.
            background:
              'linear-gradient(to right, rgba(26,8,2,0.62) 0%, transparent 24%, transparent 76%, rgba(26,8,2,0.62) 100%)',
          }}
          initial={{ opacity: 0, scale: 0.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.035 }}
          transition={{ type: 'spring', stiffness: 165, damping: 24, mass: 0.95 }}
        >
          {/* ── Left panel — intro / nav ─────────── */}
          <div className="pointer-events-auto flex w-full shrink-0 flex-col justify-center gap-6 p-6 md:h-full md:w-[380px] md:p-10">
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to the journey"
              className="flex w-fit items-center gap-2 rounded-full border border-[rgba(255,210,122,0.32)] bg-[rgba(26,8,2,0.55)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#fff0c7] backdrop-blur-xl transition hover:bg-[rgba(255,210,122,0.16)]"
            >
              <span className="text-base leading-none">←</span>
              Back to the journey
            </button>

            <div className="rounded-3xl border border-[rgba(255,210,122,0.2)] bg-[rgba(26,8,2,0.55)] p-7 backdrop-blur-xl">
              <span className="text-xs font-extrabold uppercase tracking-[0.24em] text-[#ffbd53]">
                Checkpoint {String(index + 1).padStart(2, '0')} / {String(peakIds.length).padStart(2, '0')}
              </span>
              <h1 className="font-display mt-2 text-3xl font-extrabold leading-[1.05] text-[#fff0c7] md:text-4xl">
                {peak.label}
              </h1>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em] text-[#f6d4a0]">
                {peak.subtitle}
              </p>
            </div>
          </div>

          {/* ── Center — intentionally empty, the mountain shows through ── */}
          <div className="pointer-events-none hidden flex-1 md:block" aria-hidden="true" />

          {/* ── Right panel — the actual detail content, scrollable ── */}
          <div className="pointer-events-auto flex w-full flex-1 justify-center overflow-y-auto p-6 md:h-full md:w-[440px] md:flex-none md:items-center md:p-10">
            <div className="w-full rounded-3xl border border-[rgba(255,210,122,0.2)] bg-[rgba(26,8,2,0.55)] p-7 backdrop-blur-xl md:max-h-[78vh] md:overflow-y-auto">
              <PeakContent peak={peak} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   Content renderer — unchanged data/shape, just
   living inside the right-hand glass panel now.
───────────────────────────────────────────── */

function PeakContent({ peak }: { peak: Peak }) {
  const { content } = peak;

  if (content.type === 'origin') {
    return (
      <div>
        <h3 className="mb-3 text-xl font-bold text-[#ffd27a]">{content.title}</h3>
        <p className="mb-5 border-l-4 border-[#ffd27a] pl-4 text-base italic leading-7 text-[#f6d4a0]">
          {content.tagline}
        </p>
        <p className="text-sm leading-7 text-[#fff8ee] opacity-90">{content.bio}</p>
      </div>
    );
  }

  if (content.type === 'skills') {
    const categories = [...new Set(content.skills.map((s) => s.category))];
    return (
      <div className="flex flex-col gap-6">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="mb-2.5 text-xs font-bold uppercase tracking-[0.16em] text-[#ffd27a]">
              {category}
            </h4>
            <div className="flex flex-wrap gap-2">
              {content.skills
                .filter((s) => s.category === category)
                .map((skill) => (
                  <span
                    key={skill.name}
                    className="rounded-full border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.08)] px-3.5 py-1.5 text-sm font-medium text-[#fff8ee]"
                  >
                    {skill.name}
                  </span>
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
          <div
            key={role.company}
            className="rounded-2xl border border-[rgba(255,210,122,0.18)] bg-[rgba(255,210,122,0.05)] p-5"
          >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-base font-bold text-[#ffd27a]">{role.company}</span>
              <span className="rounded-full border border-[rgba(255,210,122,0.24)] px-3 py-1 text-xs text-[#c8936a]">
                {role.duration}
              </span>
            </div>
            <ul className="flex list-none flex-col gap-2.5 p-0">
              {role.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2.5 text-sm leading-6 text-[#fff8ee] opacity-90">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffd27a]" />
                  {h}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  }

  if (content.type === 'projects') {
    return (
      <div className="flex flex-col gap-3">
        {content.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  if (content.type === 'impact') {
    return (
      <div className="flex flex-col gap-2.5">
        {content.achievements.map((a) => (
          <div
            key={a.title}
            className="flex items-start gap-3.5 rounded-xl border border-[rgba(255,210,122,0.16)] bg-[rgba(255,210,122,0.05)] p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[rgba(255,210,122,0.1)] text-xl">
              {a.icon}
            </div>
            <div>
              <h4 className="mb-1 text-sm font-bold text-[#fff8ee]">{a.title}</h4>
              <p className="text-sm leading-6 text-[#f6d4a0]">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (content.type === 'resume') {
    return (
      <div className="py-2 text-center">
        <p className="mb-6 text-sm leading-6 text-[#f6d4a0]">
          Take a closer look at my full background.
        </p>
        <div className="mx-auto flex max-w-[320px] flex-col gap-2.5">
          {content.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-xl border border-[rgba(255,210,122,0.32)] bg-[rgba(255,210,122,0.1)] px-6 py-3.5 text-sm font-bold text-[#ffd27a] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.18)]"
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
      <div className="py-2 text-center">
        <p className="mb-6 text-base italic leading-7 text-[#f6d4a0]">{content.message}</p>
        <div className="flex flex-col gap-2.5">
          <a
            href={`mailto:${content.email}`}
            className="rounded-xl border border-[rgba(255,210,122,0.4)] bg-[rgba(255,210,122,0.14)] px-6 py-3.5 text-sm font-bold text-[#ffd27a] no-underline transition hover:-translate-y-0.5"
          >
            ✉️ &nbsp; Send an Email
          </a>
          <a
            href={content.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.06)] px-6 py-3.5 text-sm font-bold text-[#fff8ee] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.13)]"
          >
            💼 &nbsp; Connect on LinkedIn
          </a>
          <a
            href={content.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.06)] px-6 py-3.5 text-sm font-bold text-[#fff8ee] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.13)]"
          >
            🐙 &nbsp; View GitHub
          </a>
        </div>
      </div>
    );
  }

  return null;
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <details className="overflow-hidden rounded-xl border border-[rgba(255,210,122,0.18)] bg-[rgba(255,210,122,0.04)]">
      <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 transition hover:bg-[rgba(255,210,122,0.06)] [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-bold text-[#fff8ee]">{project.title}</span>
        <span className="text-lg text-[#ffd27a]">›</span>
      </summary>

      <div className="mx-4 flex flex-col gap-3 border-t border-[rgba(255,210,122,0.12)] py-3.5">
        <Section label="Problem"><p>{project.problem}</p></Section>
        <Section label="My Role"><p>{project.role}</p></Section>
        <Section label="Tech">
          <div className="flex flex-wrap gap-1.5">
            {project.tech.map((t) => (
              <span
                key={t}
                className="rounded-md border border-[rgba(255,210,122,0.24)] bg-[rgba(255,210,122,0.08)] px-2 py-0.5 text-xs font-semibold text-[#ffd27a]"
              >
                {t}
              </span>
            ))}
          </div>
        </Section>
        <Section label="Features">
          <ul className="flex list-none flex-col gap-1 p-0">
            {project.features.map((f) => (
              <li key={f} className="relative pl-4 text-xs leading-5 text-[#fff8ee] opacity-85 before:absolute before:left-0 before:text-[#ffd27a] before:content-['›']">
                {f}
              </li>
            ))}
          </ul>
        </Section>
        <div className="rounded-lg border border-[rgba(255,210,122,0.18)] bg-[rgba(255,210,122,0.06)] p-2.5">
          <Section label="Impact"><p className="font-semibold text-[#fff0c5]">{project.impact}</p></Section>
        </div>
      </div>
    </details>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 text-xs leading-6 text-[#fff8ee] opacity-90">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffd27a]">{label}</span>
      {children}
    </div>
  );
}