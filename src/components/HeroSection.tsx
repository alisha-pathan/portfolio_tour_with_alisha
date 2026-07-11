/**
 * @file HeroSection.tsx
 * @description Opening hero — fades and lifts away smoothly as soon as
 * scrolling begins, revealing the desert scene beneath. NO 3D flip — that
 * rotateX(-110deg) + preserve-3d combo was causing the upside-down mirror glitch.
 */

import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

interface HeroSectionProps {
  onBeginAscent: () => void;
  hasScrolled: boolean;
}

export function HeroSection({ onBeginAscent, hasScrolled }: HeroSectionProps) {
  const { scrollYProgress } = useScroll();

  // Smooth spring-driven values — NO 3D, just opacity + translateY
  const rawOpacity = useTransform(scrollYProgress, [0, 0.10], [1, 0]);
  const rawY       = useTransform(scrollYProgress, [0, 0.10], [0, -60]);
  const rawScale   = useTransform(scrollYProgress, [0, 0.10], [1, 0.94]);

  const heroOpacity = useSpring(rawOpacity, { stiffness: 80, damping: 22 });
  const heroY       = useSpring(rawY,       { stiffness: 80, damping: 22 });
  const heroScale   = useSpring(rawScale,   { stiffness: 80, damping: 22 });

  return (
    <section
      id="hero"
      aria-label="Introduction"
      className="pointer-events-none sticky top-0 z-20 flex h-screen flex-col items-center justify-center px-6 text-center"
    >
      <motion.div
        style={{
          opacity: heroOpacity,
          y: heroY,
          scale: heroScale,
          // Deliberately NO rotateX, NO transformStyle, NO perspective
        }}
        className="flex flex-col items-center"
      >
        {/* ── Badge ─────────────────────────────── */}
        <motion.div
          className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
          style={{
            border: '1px solid rgba(255,210,122,0.42)',
            background: 'rgba(26,8,2,0.45)',
            color: '#ffd27a',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
          }}
          initial={{ opacity: 0, scale: 0.8, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.25, type: 'spring', stiffness: 180, damping: 18 }}
        >
          <span
            style={{
              display: 'inline-block',
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: '#ffd27a',
              boxShadow: '0 0 10px #ffd27a',
            }}
          />
          Frontend Engineer · React &amp; TypeScript
        </motion.div>

        {/* ── Name ──────────────────────────────── */}
        <motion.h1
          className="font-display mb-4 font-extrabold leading-[0.95] tracking-[-0.04em]"
          style={{
            fontSize: 'clamp(3.5rem, 10vw, 9rem)',
            color: '#fff8ee',
            textShadow:
              '0 2px 4px rgba(26,8,2,0.8), 0 8px 40px rgba(26,8,2,0.6)',
          }}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          Alisha
        </motion.h1>

        {/* ── Role / tagline ────────────────────── */}
        <motion.p
          className="mb-10 max-w-[480px] leading-7"
          style={{
            fontSize: 'clamp(1rem, 2.2vw, 1.2rem)',
            color: '#f6d4a0',
            textShadow: '0 2px 14px rgba(26,8,2,0.75)',
          }}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        >
          Scroll to send the eagle soaring through my engineering story.
        </motion.p>

        {/* ── CTA Buttons ───────────────────────── */}
        <motion.div
          className="pointer-events-auto flex flex-wrap justify-center gap-3.5"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.66, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <button
            id="begin-ascent-btn"
            type="button"
            onClick={onBeginAscent}
            aria-label="Begin the ascent — scroll through portfolio"
            style={{
              background: 'linear-gradient(135deg, #ffd27a 0%, #ff8a2a 100%)',
              color: '#2a0902',
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: '0.875rem',
              fontWeight: 700,
              border: 'none',
              boxShadow: '0 4px 22px rgba(255,140,42,0.45), 0 2px 8px rgba(26,8,2,0.3)',
              transition: 'transform 0.22s ease, box-shadow 0.22s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 32px rgba(255,140,42,0.6), 0 4px 12px rgba(26,8,2,0.3)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 22px rgba(255,140,42,0.45), 0 2px 8px rgba(26,8,2,0.3)';
            }}
          >
            Begin the Ascent ↓
          </button>

          <a
            id="view-resume-btn"
            href="#"
            download
            aria-label="Download resume PDF"
            style={{
              borderRadius: 999,
              padding: '14px 28px',
              fontSize: '0.875rem',
              fontWeight: 600,
              border: '1px solid rgba(255,210,122,0.35)',
              background: 'rgba(26,8,2,0.42)',
              color: '#fff8ee',
              textDecoration: 'none',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'transform 0.22s ease, background 0.22s ease',
              display: 'inline-block',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,210,122,0.12)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = '';
              (e.currentTarget as HTMLElement).style.background = 'rgba(26,8,2,0.42)';
            }}
          >
            View Resume
          </a>
        </motion.div>
      </motion.div>

      {/* ── Scroll nudge indicator ─────────────── */}
      {!hasScrolled && (
        <motion.div
          className="absolute bottom-10 flex flex-col items-center gap-2.5"
          style={{ opacity: heroOpacity }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.7rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#f6d4a0',
              textShadow: '0 2px 8px rgba(26,8,2,0.7)',
            }}
          >
            Begin the ascent
          </span>
          {/* Animated down-arrow chevron */}
          <motion.div
            style={{
              width: 22,
              height: 22,
              borderRight: '2.5px solid #ffd27a',
              borderBottom: '2.5px solid #ffd27a',
              transform: 'rotate(45deg)',
            }}
            animate={{ y: [0, 8, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}
    </section>
  );
}