/**
 * @file App.tsx
 * @description Root portfolio experience. Handles smooth scroll, eagle
 * awakening, and the peak detail overlay (zoom-open from click point).
 *
 * v3: fixed the real click-blocking bug. <main> is 900vh tall, position:
 * relative, z-10 — meaning its invisible box covers the ENTIRE viewport
 * for the entire scroll journey, and sits ABOVE Scene3D's whole subtree
 * in the global stacking order (Scene3D's wrapper is z-0, so everything
 * inside it — including the checkpoint button — is capped at that same
 * z-0 level no matter what z-index is used internally). Since <main> had
 * no pointer-events restriction of its own, it silently absorbed every
 * click meant for the 3D scene underneath it. Now <main> is
 * pointer-events-none; HeroSection's own CTA buttons already opt back
 * into pointer-events-auto on themselves, so they're unaffected.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';
import Lenis from 'lenis';

import './index.css';

import { Scene3D } from './components/Scene3D';
import { EagleOverlay } from './components/EagleOverlay';
import { HeroSection } from './components/HeroSection';
import { PeakDetailOverlay, type ZoomOrigin } from './components/Peakdetailoverlay';

function App() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);

  // Exact click point the checkpoint/mountain was tapped at — the detail
  // overlay zooms open from this point instead of sliding in.
  const [zoomOrigin, setZoomOrigin] = useState<ZoomOrigin | null>(null);

  const [nearPeakId, setNearPeakId] = useState<string | null>(null);

  const lenisRef = useRef<Lenis | null>(null);
  const { scrollYProgress } = useScroll();

  /* ── Lenis Smooth Scroll ───────────────────── */
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.08, smoothWheel: true });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  /* ── Eagle Awakening ───────────────────────── */
  useEffect(() => {
    return scrollYProgress.on('change', (value) => {
      if (value > 0.01 && !hasScrolled) setHasScrolled(true);
    });
  }, [scrollYProgress, hasScrolled]);

  /* ── Handlers ──────────────────────────────── */

  const handlePeakClick = useCallback((id: string, origin?: ZoomOrigin) => {
    setSelectedPeakId(id);
    setZoomOrigin(origin ?? null);
    lenisRef.current?.stop();
  }, []);

  const handleDialogClose = useCallback(() => {
    setSelectedPeakId(null);
    lenisRef.current?.start();
  }, []);

  const handleBeginAscent = useCallback(() => {
    lenisRef.current?.scrollTo(window.innerHeight * 0.75, {
      duration: 1.8,
    });
  }, []);

  return (
    <>
      <Scene3D
        onPeakClick={handlePeakClick}
        activePeakId={nearPeakId}
        onActivePeakChange={setNearPeakId}
        zoomPeakId={selectedPeakId}
      />

      <EagleOverlay hasScrolled={hasScrolled} />

      {/* NEW: pointer-events-none — this was the actual bug. See header comment. */}
      <main id="main-content" className="pointer-events-none relative z-10 h-[900vh]">
        <HeroSection onBeginAscent={handleBeginAscent} hasScrolled={hasScrolled} />
      </main>

      <PeakDetailOverlay
        peakId={selectedPeakId}
        origin={zoomOrigin}
        onClose={handleDialogClose}
      />
    </>
  );
}

export default App;