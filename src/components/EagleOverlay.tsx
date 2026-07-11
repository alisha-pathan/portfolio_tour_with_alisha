/**
 * @file EagleOverlay.tsx
 * @description The eagle "player" — stays with the viewer on screen like a
 * Subway Surfer character, drifting left/right and leaning into turns in sync
 * with the scroll journey. mix-blend-mode: multiply removes the white
 * background from the eagle PNG so it reads cleanly over the desert scene.
 */

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

import eagleWings from '../assets/images/eagle-back.png';

/**
 * Lane rhythm — mirrors the journey path.
 * Positions in vw — screen-space lane.
 * Rotation in degrees — lean into the turn.
 */
const SCROLL_STOPS  = [0,   0.14, 0.29, 0.43, 0.58, 0.72, 0.86, 1];
const X_STOPS       = [50,  38,   62,   37,   63,   40,   60,   50];
const ROTATE_STOPS  = [0,   -9,   9,    -9,   9,    -9,   9,    0];

interface EagleOverlayProps {
  hasScrolled: boolean;
}

export function EagleOverlay({ hasScrolled }: EagleOverlayProps) {
  const { scrollYProgress } = useScroll();

  const rawX      = useTransform(scrollYProgress, SCROLL_STOPS, X_STOPS);
  const rawRotate = useTransform(scrollYProgress, SCROLL_STOPS, ROTATE_STOPS);

  const springX      = useSpring(rawX,      { stiffness: 55, damping: 20, mass: 0.9 });
  const springRotate = useSpring(rawRotate, { stiffness: 70, damping: 20 });

  const eagleLeft    = useTransform(springX, (v) => `${v}vw`);
  // Eagle fades in quickly after first scroll, and stays visible after that
  const eagleOpacity = useTransform(scrollYProgress, [0, 0.06], [0.15, 1]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <motion.div
        className="eagle-flap absolute top-[58%] flex aspect-square -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        style={{
          left: eagleLeft,
          rotate: springRotate,
          opacity: eagleOpacity,
          width: 'clamp(120px, 15vw, 220px)',
          // Renders the black eagle beautifully over any warm/light background
          mixBlendMode: 'multiply',
          filter: 'drop-shadow(0 8px 18px rgba(80,20,0,0.45)) drop-shadow(0 0 24px rgba(255,160,40,0.3))',
        }}
      >
        <img
          src={eagleWings}
          alt=""
          aria-hidden="true"
          draggable={false}
          className="h-full w-full select-none object-contain"
        />
      </motion.div>

      {/* Awakening glow ring — visible before first scroll */}
      {!hasScrolled && (
        <motion.div
          className="fixed left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: 200,
            height: 200,
            background: 'radial-gradient(circle, rgba(255,180,60,0.28), transparent 65%)',
          }}
          animate={{ scale: [0.9, 1.12, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}