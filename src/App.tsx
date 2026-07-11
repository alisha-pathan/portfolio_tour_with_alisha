/**
 * @file App.tsx
 * @description Root portfolio experience. Handles smooth scroll, eagle
 * awakening, dialog state, and proximity state.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';
import Lenis from 'lenis';

import './index.css';

import { Scene3D } from './components/Scene3D';
import { EagleOverlay } from './components/EagleOverlay';
import { HeroSection } from './components/HeroSection';
import { PeakDetailsDialog } from './components/PeakDetailsDialog';

function App() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [selectedPeakId, setSelectedPeakId] = useState<string | null>(null);
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
  const handlePeakClick = useCallback((id: string) => setSelectedPeakId(id), []);
  const handleDialogClose = useCallback(() => setSelectedPeakId(null), []);
  const handleBeginAscent = useCallback(() => {
    lenisRef.current?.scrollTo(window.innerHeight * 0.75, {
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    });
  }, []);

  return (
    <>
      {/* Layer 0 — 3D Runner Scene! Fixed desert theme */}
      <Scene3D
        onPeakClick={handlePeakClick}
        activePeakId={nearPeakId}
        onActivePeakChange={setNearPeakId}
      />

      {/* Layer 1 — screen-locked eagle (Subway Surfers style) */}
      <EagleOverlay hasScrolled={hasScrolled} />

      {/* Layer 2 — scrollable main content (controls scroll height) */}
      <main id="main-content" className="relative z-10 h-[900vh]">
        <HeroSection onBeginAscent={handleBeginAscent} hasScrolled={hasScrolled} />
      </main>

      {/* Layer 3 — peak detail sheet */}
      <PeakDetailsDialog peakId={selectedPeakId} onClose={handleDialogClose} />
    </>
  );
}

export default App;