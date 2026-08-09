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
 * v12: Experience peak is now centered while all other peaks maintain
 * alternating left/right layout - OPTIMIZED VERSION
 * v13: Converted inline styles to Tailwind classes
 * v14: Experience peak takes full width, flexible system for future peaks
 */

import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo, useCallback } from 'react';

import { PEAKS, type Peak, type Project } from '../data/portfolioPeaks';
import { PATH_NODES } from '../three/path';
import { SkillsPeak } from '../PeaksDesign/SkillsPeak';
import { SkillPeakDislay } from './user-interface/SkillPeakDislay';
import OriginPeakDisplay from './user-interface/OriginPeakDisplay';
import ExperiencePeakDisplay from './user-interface/ExperiencePeakDisplay';

export interface ZoomOrigin {
  x: number;
  y: number;
}

interface PeakDetailOverlayProps {
  peakId: string | null;
  origin: ZoomOrigin | null;
  onClose: () => void;
}

// Define which peaks should be centered (full width)
// Add more peak IDs here in the future if needed
const CENTERED_PEAKS = new Set(['experience']);

// Shared, heavy drop-shadow so text stays legible over any part of the
// zoomed mountain/sky, without needing a solid card behind it.
const textShadow = 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]';

// Memoized Back Button component to prevent unnecessary re-renders
const BackButton = memo(({ onClick }: {
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label="Back to the journey"
    className="flex w-fit items-center gap-2 rounded-full border border-[rgba(255,210,122,0.4)] px-4 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#fff0c7] backdrop-blur-sm transition hover:border-[#ffd27a] hover:bg-[rgba(255,210,122,0.12)] drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
  >
    Back
  </button>
));

BackButton.displayName = 'BackButton';

// Memoized Project Card
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

const Section = memo(({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1 text-xs leading-6 text-[#fff8ee] opacity-90">
    <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#ffd27a]">{label}</span>
    {children}
  </div>
));

Section.displayName = 'Section';

/* ─────────────────────────────────────────────
   Content renderer — memoized to prevent
   unnecessary re-renders when peak changes
───────────────────────────────────────────── */

const PeakContent = memo(({ peak }: { peak: Peak }) => {
  const { content } = peak;

  // Use useMemo for expensive content types
  const renderedContent = useMemo(() => {
    switch (content.type) {
      case 'origin':
        return (
          <OriginPeakDisplay
            title={content.title}
            tagline={content.tagline}
            bio={content.bio}
          />
        );

      case 'skills':
        return (
          <div className=''>
            <SkillsPeak skills={content.skills} />
          </div>
        );

      case 'experience':
        return <ExperiencePeakDisplay roles={content.roles} />;

      case 'projects':
        return (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {content.projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        );

      case 'impact':
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

      case 'resume':
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

      case 'contact':
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

      default:
        return null;
    }
  }, [content]);

  return renderedContent;
});

PeakContent.displayName = 'PeakContent';

/* ─────────────────────────────────────────────
   Main Component - Optimized
───────────────────────────────────────────── */

export function PeakDetailOverlay({ peakId, origin, onClose }: PeakDetailOverlayProps) {
  // Memoize expensive calculations
  const peak = useMemo(() => peakId ? PEAKS.find((p) => p.id === peakId) ?? null : null, [peakId]);
  const open = !!peak;

  const originX = origin?.x ?? window.innerWidth / 2;
  const originY = origin?.y ?? window.innerHeight / 2;

  // Memoize derived state
  const peakState = useMemo(() => {
    if (!peak) return { isRightZoom: false, isOriginPeak: false, isCentered: false };

    const peakIds = PATH_NODES.filter((n) => n.id !== 'start' && n.id !== 'end').map((n) => n.id);
    const index = peakIds.indexOf(peak.id);

    return {
      isRightZoom: index >= 0 && index % 2 === 1,
      isOriginPeak: peak.id === 'origin',
      isCentered: CENTERED_PEAKS.has(peak.id), // Check if this peak should be centered
    };
  }, [peak]);

  const { isRightZoom, isOriginPeak, isCentered } = peakState;

  // Memoize styles to prevent recalculations
  const containerBackground = useMemo(() => {
    if (isCentered) {
      return 'bg-gradient-to-b from-[rgba(20,6,2,0.4)] via-transparent via-30% to-transparent';
    }
    if (isRightZoom) {
      return 'bg-gradient-to-l from-[rgba(20,6,2,0.4)] via-transparent via-30% to-transparent';
    }
    return 'bg-gradient-to-r from-[rgba(20,6,2,0.4)] via-transparent via-30% to-transparent';
  }, [isCentered, isRightZoom]);

  // Memoize classNames to avoid string concatenation on each render
  const containerClassName = useMemo(() => {
    if (isCentered) {
      return `fixed inset-0 z-[1000] flex flex-col items-center justify-center ${containerBackground}`;
    }
    return `fixed inset-0 z-[1000] flex flex-col ${isRightZoom ? 'md:flex-row-reverse' : 'md:flex-row'} ${containerBackground}`;
  }, [isCentered, isRightZoom, containerBackground]);

  const contentContainerClassName = useMemo(() => {
    const base = 'pointer-events-auto flex w-full flex-1 items-start p-6 md:p-10';
    const scroll = isOriginPeak ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden';
    const align = isCentered ? 'justify-center items-center h-full' : 'justify-center';
    return `${base} ${align} ${scroll}`;
  }, [isOriginPeak, isCentered]);

  // For centered peaks: full width with some padding
  // For non-centered peaks: max width constraint
  const contentDivClassName = useMemo(() => {
    const base = 'w-full py-6';
    const shadow = 'drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]';
    
    if (isCentered) {
      // Full width with padding for breathing room
      return `${base} px-8 mt-20 ${shadow}`;
    }
    // Standard width for non-centered peaks
    return `${base} max-w-[1100px] ${shadow}`;
  }, [isCentered]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Early return if no peak
  if (!open || !peak) return null;

  return (
    <AnimatePresence>
      <motion.div
        key={peak.id}
        className={containerClassName}
        style={{ transformOrigin: `${originX}px ${originY}px` }}
        initial={{ opacity: 0, scale: 0.035 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.035 }}
        transition={{
          type: 'spring',
          stiffness: 165,
          damping: 24,
          mass: 0.95,
          velocity: 0.5,
        }}
      >
        {/* Back button for centered peaks */}
        {isCentered && (
          <div className="absolute top-8 left-8 z-10">
            <BackButton onClick={handleClose} />
          </div>
        )}

        {/* Back button for non-centered peaks */}
        {!isCentered && (
          <div
            data-lenis-prevent
            className={`pointer-events-auto flex w-full flex-1 items-start ${isRightZoom ? 'justify-end' : 'justify-start'
              } ${isOriginPeak ? 'overflow-visible' : 'overflow-y-auto'} md:h-full md:p-10`}
          >
            <BackButton onClick={handleClose} />
          </div>
        )}

        {/* Skills peak content - displayed separately */}
        {peak.content.type === 'skills' && (
          <SkillPeakDislay />
        )}

        {/* Content area */}
        <div
          data-lenis-prevent
          className={contentContainerClassName}
        >
          <div className={contentDivClassName}>
            <PeakContent peak={peak} />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}