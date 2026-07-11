/**
 * @file JourneySections.tsx
 * @description All the scroll-driven tour behaviours that used to live in
 * Scene3D, rebuilt as 2D DOM overlays — no Three.js, desert-themed.
 *
 *  - Scroll progress HUD (trail of dots)
 *  - Peak name label that floats near the eagle and pulses when active
 *  - Clickable section card anchored to the eagle's horizontal position
 *  - Click any card → opens the PeakDetailsDialog
 */

import { useEffect, useRef, useState } from 'react';
import {
  motion,
  AnimatePresence,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
} from 'framer-motion';
import { PEAKS } from '../data/portfolioPeaks';

// ─────────────────────────────────────────────────────────────
// Each peak occupies a band of scroll progress.
// These align with EagleOverlay's SCROLL_STOPS so the label
// appears exactly when the eagle is over that section.
// ─────────────────────────────────────────────────────────────
const PEAK_ZONES = [
  { id: 'origin',     scrollAt: 0.10, xVw: 15 },
  { id: 'skills',     scrollAt: 0.22, xVw: 78 },
  { id: 'experience', scrollAt: 0.35, xVw: 37 },
  { id: 'projects',   scrollAt: 0.49, xVw: 63 },
  { id: 'impact',     scrollAt: 0.63, xVw: 40 },
  { id: 'resume',     scrollAt: 0.76, xVw: 60 },
  { id: 'contact',    scrollAt: 0.90, xVw: 50 },
] as const;

// Window (±) to consider the eagle "at" a peak
const ACTIVE_WINDOW = 0.07;

interface JourneySectionsProps {
  onPeakClick: (id: string) => void;
  onActivePeakChange: (id: string | null) => void;
}

export function JourneySections({ onPeakClick, onActivePeakChange }: JourneySectionsProps) {
  const { scrollYProgress } = useScroll();

  // Smooth, spring-lagged scroll value for label transitions
  const smoothed = useSpring(scrollYProgress, { stiffness: 55, damping: 20, mass: 0.7 });

  const [activePeakId, setActivePeakId] = useState<string | null>(null);
  const [progressVal, setProgressVal] = useState(0);
  const lastActiveRef = useRef<string | null>(null);

  // Track which peak we're near
  useMotionValueEvent(smoothed, 'change', (v) => {
    setProgressVal(v);

    let closest: string | null = null;
    let closestDist = Infinity;

    for (const zone of PEAK_ZONES) {
      const dist = Math.abs(zone.scrollAt - v);
      if (dist < closestDist) {
        closestDist = dist;
        closest = zone.id;
      }
    }

    const newId = closestDist <= ACTIVE_WINDOW ? closest : null;
    if (newId !== lastActiveRef.current) {
      lastActiveRef.current = newId;
      setActivePeakId(newId);
      onActivePeakChange(newId);
    }
  });

  const activePeak = PEAKS.find((p) => p.id === activePeakId) ?? null;
  const activeZone = PEAK_ZONES.find((z) => z.id === activePeakId) ?? null;

  return (
    <>
      {/* ── Scroll Progress Trail (right edge) ───────────── */}
      <ScrollProgressDots progressVal={progressVal} activePeakId={activePeakId} />

      {/* ── Floating peak label + click card near eagle ───── */}
      <AnimatePresence mode="wait">
        {activePeak && activeZone && (
          <PeakCard
            key={activePeak.id}
            peak={activePeak}
            xVw={activeZone.xVw}
            onClick={() => onPeakClick(activePeak.id)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Vertical dot progress bar on the right edge
// ─────────────────────────────────────────────────────────────

function ScrollProgressDots({
  progressVal,
  activePeakId,
}: {
  progressVal: number;
  activePeakId: string | null;
}) {
  return (
    <div
      className="pointer-events-none fixed right-6 top-1/2 z-[90] flex -translate-y-1/2 flex-col items-center gap-3"
      aria-hidden="true"
    >
      {PEAK_ZONES.map((zone) => {
        const isActive = zone.id === activePeakId;
        const isPassed = progressVal > zone.scrollAt - 0.04;
        const peak = PEAKS.find((p) => p.id === zone.id);

        return (
          <div key={zone.id} className="group relative flex items-center">
            {/* Dot */}
            <motion.div
              animate={{
                scale: isActive ? 1.5 : 1,
                backgroundColor: isPassed ? '#ffd27a' : 'rgba(255,210,122,0.25)',
                boxShadow: isActive
                  ? '0 0 14px #ffd27a, 0 0 28px rgba(255,210,122,0.5)'
                  : 'none',
              }}
              transition={{ type: 'spring', stiffness: 250, damping: 22 }}
              style={{
                width: isActive ? 10 : 7,
                height: isActive ? 10 : 7,
                borderRadius: '50%',
                border: '1.5px solid rgba(255,210,122,0.5)',
              }}
            />

            {/* Label tooltip on active */}
            <AnimatePresence>
              {isActive && peak && (
                <motion.span
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-full mr-3 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em]"
                  style={{
                    background: 'rgba(26,8,2,0.7)',
                    border: '1px solid rgba(255,210,122,0.3)',
                    color: '#ffd27a',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  {peak.label}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* Trail line connecting dots */}
      <div
        className="absolute left-1/2 top-0 -z-10 -translate-x-1/2"
        style={{
          width: 1,
          height: '100%',
          background:
            'linear-gradient(to bottom, transparent, rgba(255,210,122,0.2) 15%, rgba(255,210,122,0.2) 85%, transparent)',
        }}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// The floating card that appears near the eagle when active.
// Positioned almost over the eagle (from EagleOverlay's xVw).
// ─────────────────────────────────────────────────────────────

function PeakCard({
  peak,
  xVw,
  onClick,
}: {
  peak: (typeof PEAKS)[0];
  xVw: number;
  onClick: () => void;
}) {
  // Eagle is at top: 58%, card sits just above it
  const cardTop = 'calc(58vh - 140px)';

  // Clamp x so card never overflows screen edges
  const clampedLeft = Math.min(Math.max(xVw, 14), 86);

  return (
    <motion.div
      className="pointer-events-auto fixed z-[95]"
      style={{
        top: cardTop,
        left: `${clampedLeft}vw`,
        transform: 'translateX(-50%)',
      }}
      initial={{ opacity: 0, y: 18, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.92 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Open ${peak.label} details`}
        className="group flex flex-col items-center gap-2 rounded-2xl px-5 py-3 text-center transition-transform duration-200 hover:-translate-y-1"
        style={{
          background: 'rgba(26,8,2,0.72)',
          border: '1px solid rgba(255,210,122,0.38)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 8px 32px rgba(26,8,2,0.5), 0 0 0 0 rgba(255,210,122,0)',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 12px 40px rgba(26,8,2,0.6), 0 0 24px rgba(255,210,122,0.25)';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.boxShadow =
            '0 8px 32px rgba(26,8,2,0.5), 0 0 0 0 rgba(255,210,122,0)';
        }}
      >
        {/* Label */}
        <span
          className="font-display text-sm font-bold leading-none tracking-[-0.01em]"
          style={{ color: '#fff8ee' }}
        >
          {peak.label}
        </span>

        {/* Subtitle */}
        <span
          className="text-[10px] font-semibold uppercase tracking-[0.13em]"
          style={{ color: '#ffd27a' }}
        >
          {peak.subtitle}
        </span>

        {/* Tap hint */}
        <motion.span
          className="mt-0.5 flex items-center gap-1.5 text-[9px] font-medium tracking-wide"
          style={{ color: 'rgba(246,212,160,0.65)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#ffd27a',
              boxShadow: '0 0 8px #ffd27a',
            }}
          />
          Tap to explore
        </motion.span>
      </button>

      {/* ── Connector line down to eagle ── */}
      <div
        className="mx-auto mt-1"
        style={{
          width: 1.5,
          height: 32,
          background:
            'linear-gradient(to bottom, rgba(255,210,122,0.5), transparent)',
          borderRadius: 999,
        }}
      />

      {/* ── Peak marker dot ── */}
      <motion.div
        className="mx-auto"
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: '#ffd27a',
          border: '2px solid rgba(255,255,255,0.6)',
        }}
        animate={{
          scale: [1, 1.4, 1],
          boxShadow: [
            '0 0 6px rgba(255,210,122,0.5)',
            '0 0 18px rgba(255,210,122,0.9)',
            '0 0 6px rgba(255,210,122,0.5)',
          ],
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  );
}
