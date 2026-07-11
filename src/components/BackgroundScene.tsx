/**
 * @file BackgroundScene.tsx
 * @description Fixed parallax background layer — shows the desert/mountain
 * images. The background slowly drifts while the foreground mountain image
 * shifts with scroll for a multi-layer parallax depth effect.
 */

import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import desertBg from '../assets/images/desert-bg.png';
import mountain1 from '../assets/images/mountain1.png';

interface BackgroundSceneProps {
  onPeakClick: (id: string) => void;
  activePeakId: string | null;
  onActivePeakChange: (id: string | null) => void;
}

// The scroll positions where the "camera" (parallax layer) is roughly near each peak
const PEAK_ZONES = [
  { id: 'skills',      scrollStart: 0.08, scrollEnd: 0.22 },
  { id: 'experience',  scrollStart: 0.22, scrollEnd: 0.36 },
  { id: 'projects',    scrollStart: 0.36, scrollEnd: 0.50 },
  { id: 'education',   scrollStart: 0.50, scrollEnd: 0.64 },
  { id: 'leadership',  scrollStart: 0.64, scrollEnd: 0.78 },
  { id: 'contact',     scrollStart: 0.78, scrollEnd: 1.00 },
];

export function BackgroundScene({ onActivePeakChange }: BackgroundSceneProps) {
  const { scrollYProgress } = useScroll();
  const lastActiveIdRef = useRef<string | null>(null);

  // Parallax: background moves slower than foreground (classic parallax)
  const rawBgY = useTransform(scrollYProgress, [0, 1], ['0%', '-18%']);
  const bgY = useSpring(rawBgY, { stiffness: 40, damping: 18 });

  // Foreground mountain shifts more aggressively
  const rawFgY = useTransform(scrollYProgress, [0, 1], ['0%', '-35%']);
  const fgY = useSpring(rawFgY, { stiffness: 40, damping: 18 });

  // Slight horizontal drift for life
  const rawBgX = useTransform(scrollYProgress, [0, 0.5, 1], ['0%', '-1.5%', '0%']);
  const bgX = useSpring(rawBgX, { stiffness: 20, damping: 15 });

  // Vignette / overlay opacity darkens slightly mid-scroll for scenic depth
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.25, 0.38, 0.38, 0.25]);

  // Track which peak zone we're in and notify parent
  useEffect(() => {
    const unsub = scrollYProgress.on('change', (v) => {
      const zone = PEAK_ZONES.find((z) => v >= z.scrollStart && v < z.scrollEnd);
      const newId = zone ? zone.id : null;
      if (newId !== lastActiveIdRef.current) {
        lastActiveIdRef.current = newId;
        onActivePeakChange(newId);
      }
    });
    return unsub;
  }, [scrollYProgress, onActivePeakChange]);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* ── Deep background image — slowest layer ── */}
      <motion.div
        className="absolute inset-0"
        style={{ y: bgY, x: bgX }}
      >
        <img
          src={desertBg}
          alt=""
          draggable={false}
          className="h-full w-full select-none object-cover object-center"
          style={{ transform: 'scale(1.12)' }}
        />
      </motion.div>

      {/* ── Foreground mountain — faster parallax layer, blending with top gradient ── */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ y: fgY }}
      >
        {/* Gradient mask fades the top edge so it blends into the bg seamlessly */}
        <div style={{ position: 'relative' }}>
          <img
            src={mountain1}
            alt=""
            draggable={false}
            className="w-full select-none object-cover object-bottom"
            style={{
              height: '75vh',
              objectPosition: 'bottom center',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 22%)',
            }}
          />
        </div>
      </motion.div>

      {/* ── Subtle warm vignette overlay for text readability ── */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity: overlayOpacity,
          background: 'radial-gradient(ellipse at 50% 80%, rgba(26,8,2,0.9) 0%, rgba(26,8,2,0.3) 55%, transparent 100%)',
        }}
      />

      {/* ── Top sky gradient for hero text readability ── */}
      <div
        className="absolute inset-x-0 top-0 h-[40vh]"
        style={{
          background: 'linear-gradient(to bottom, rgba(26,8,2,0.45) 0%, transparent 100%)',
        }}
      />

      {/* ── Atmospheric heat shimmer lines ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,180,60,0.015) 3px, rgba(255,180,60,0.015) 4px)',
        }}
      />
    </div>
  );
}
