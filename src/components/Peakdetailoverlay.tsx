/**
 * @file PeakDetailOverlay.tsx
 * @description Full-screen peak "page" that opens with a zoom transition
 * anchored to the exact point the person clicked. No boxed "card" chrome
 * anymore — text floats directly over the zoomed 3D mountain with a strong
 * drop-shadow for legibility, like a game HUD, instead of glassmorphism
 * panels. Left side is compact (checkpoint badge, title, subtitle, back
 * button); right side takes the entire remaining width for that peak's
 * actual content — no fixed narrow column boxing it in.
 *
 * v3: removed the dark glass-card backgrounds on both sides per feedback
 * ("game like vibe", not boxed UI) — only a soft edge vignette on the
 * outer container remains for contrast, and text itself carries a heavy
 * drop-shadow instead of sitting on a filled panel. Right side went from
 * a fixed 440px column to flex-1 (the whole remaining width), since
 * per-peak designs (like the Skills Peak treasure-chest grid) need real
 * room, not a cramped sidebar.
 */

import { AnimatePresence, motion } from 'framer-motion';

import { PEAKS, type Peak, type Project } from '../data/portfolioPeaks';
import { PATH_NODES } from '../three/path';
import { SkillsPeak } from '../PeaksDesign/SkillsPeak';

export interface ZoomOrigin {
  x: number;
  y: number;
}

interface PeakDetailOverlayProps {
  peakId: string | null;
  origin: ZoomOrigin | null;
  onClose: () => void;
}

// Shared, heavy drop-shadow so text stays legible over any part of the
// zoomed mountain/sky, without needing a solid card behind it.
const textShadow = '0 2px 4px rgba(0,0,0,0.85), 0 8px 24px rgba(0,0,0,0.6)';

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
            // Only a soft edge vignette — center stays fully transparent
            // so the zoomed mountain is always visible behind the content.
            background:
              'linear-gradient(to right, rgba(20,6,2,0.4) 0%, transparent 30%, transparent 100%)',
          }}
          initial={{ opacity: 0, scale: 0.035 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.035 }}
          transition={{ type: 'spring', stiffness: 165, damping: 24, mass: 0.95 }}
        >
          {/* ── Left — compact, no card, just floating text ── */}
          <div
            data-lenis-prevent
            style={{ overscrollBehavior: 'contain' }}
            className="pointer-events-auto flex w-full flex-1 items-start justify-start overflow-y-auto md:h-full md:p-10"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Back to the journey"
              className="flex w-fit items-center gap-2 rounded-full border border-[rgba(255,210,122,0.4)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#fff0c7] backdrop-blur-sm transition hover:border-[#ffd27a] hover:bg-[rgba(255,210,122,0.12)]"
              style={{ textShadow }}
            >
              <span className="text-base leading-none">←</span>
              Back
            </button>
          </div>

          {/* ── Right — the entire remaining width, content floats free ── */}
          <div
            data-lenis-prevent
            style={{ overscrollBehavior: 'contain' }}
            className="pointer-events-auto flex w-full flex-1 items-start justify-center overflow-y-auto p-6 md:h-full md:p-10"
          >
            <div className="w-full max-w-[1100px] py-6" style={{ textShadow }}>
              <PeakContent peak={peak} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────
   Content renderer — same data/shape, now floating
   free (no card) on the full-width right side.
───────────────────────────────────────────── */

function PeakContent({ peak }: { peak: Peak }) {
  const { content } = peak;

  if (content.type === 'origin') {
    return (
      <div>
        <h3 className="mb-3 text-2xl font-bold text-[#ffd27a]">{content.title}</h3>
        <p className="mb-6 border-l-4 border-[#ffd27a] pl-5 text-lg italic leading-8 text-[#f6d4a0]">
          {content.tagline}
        </p>
        <p className="max-w-[640px] text-base leading-8 text-[#fff8ee] opacity-95">{content.bio}</p>
      </div>
    );
  }

  if (content.type === 'skills') {
    return (
      <div className='py-6'>
        <SkillsPeak skills={content.skills} />
      </div>
    );
  }

  if (content.type === 'experience') {
    return (
      <div className="flex flex-col gap-5">
        {content.roles.map((role) => (
          <div key={role.company} className="max-w-[720px]">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xl font-bold text-[#ffd27a]">{role.company}</span>
              <span className="rounded-full border border-[rgba(255,210,122,0.4)] px-3 py-1 text-xs text-[#f6d4a0]">
                {role.duration}
              </span>
            </div>
            <ul className="flex list-none flex-col gap-3 p-0">
              {role.highlights.map((h) => (
                <li key={h} className="flex items-start gap-3 text-base leading-7 text-[#fff8ee] opacity-95">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffd27a]" />
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
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {content.projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  }

  if (content.type === 'impact') {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {content.achievements.map((a) => (
          <div key={a.title} className="flex items-start gap-4">
            <div className="text-3xl">{a.icon}</div>
            <div>
              <h4 className="mb-1 text-base font-bold text-[#fff8ee]">{a.title}</h4>
              <p className="text-sm leading-6 text-[#f6d4a0]">{a.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (content.type === 'resume') {
    return (
      <div className="text-center">
        <p className="mb-8 text-base leading-7 text-[#f6d4a0]">
          Take a closer look at my full background.
        </p>
        <div className="mx-auto flex max-w-[320px] flex-col gap-3">
          {content.links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 rounded-xl border border-[rgba(255,210,122,0.4)] px-6 py-4 text-sm font-bold text-[#ffd27a] no-underline backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.14)]"
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
      <div className="mx-auto max-w-[520px] text-center">
        <p className="mb-8 text-lg italic leading-8 text-[#f6d4a0]">{content.message}</p>
        <div className="flex flex-col gap-3">
          <a
            href={`mailto:${content.email}`}
            className="rounded-xl border border-[rgba(255,210,122,0.5)] px-6 py-4 text-sm font-bold text-[#ffd27a] no-underline backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.14)]"
          >
            ✉️ &nbsp; Send an Email
          </a>
          <a
            href={content.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[rgba(255,210,122,0.4)] px-6 py-4 text-sm font-bold text-[#fff8ee] no-underline backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.1)]"
          >
            💼 &nbsp; Connect on LinkedIn
          </a>
          <a
            href={content.github}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-[rgba(255,210,122,0.4)] px-6 py-4 text-sm font-bold text-[#fff8ee] no-underline backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-[rgba(255,210,122,0.1)]"
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