/**
 * @file OriginPeakDisplay.tsx
 * @description Display component for Origin Peak with map background and typewriter animation
 */

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import mapAsset from "../../assets/my_assets/mapAsset.png";
import snakeShot from "../../assets/videos/snake_shot.webm";
import arabKing from "../../assets/my_assets/Arab_king.png";
import arrow2 from "../../assets/my_assets/Arrow2.png";
import arrow3 from "../../assets/my_assets/Arrow3.png";
import arrow4 from "../../assets/my_assets/Arrow4.png";
import arrow5 from "../../assets/my_assets/Arrow5.png"
import { createPortal } from 'react-dom';

const FULL_ARROW_IMAGES = [arrow2, arrow3]; // used mid-flight
const HALF_ARROW_IMAGES = [arrow4, arrow5];


// ─────────────────────────────────────────────
//  Interfaces
// ─────────────────────────────────────────────

interface OriginPeakDisplayProps {
  title: string;
  tagline: string;
  bio: string;
}

// ─────────────────────────────────────────────
//  Component
// ─────────────────────────────────────────────

const OriginPeakDisplay = ({ title, tagline, bio }: OriginPeakDisplayProps) => {

  // ── React state (typewriter only) ─────────────
  const [displayedTitle, setDisplayedTitle] = useState('');
  const [displayedTagline, setDisplayedTagline] = useState('');
  const [displayedBio, setDisplayedBio] = useState('');
  const [isTitleComplete, setIsTitleComplete] = useState(false);
  const [isTaglineComplete, setIsTaglineComplete] = useState(false);
  const [isBioComplete, setIsBioComplete] = useState(false);

  // ── DOM refs ───────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);

  // Battlefield arrows — seeded (not Math.random() directly), so this
  // component's frequent typewriter re-renders don't make them jump
  // around. "Stratified" placement: the screen is split into equal
  // slots first, then jittered within each slot — this is what
  // guarantees full left-to-right coverage instead of random clumps
  // with gaps, which is what pure randomness tends to produce.
  const ARROW_COUNT = 44;
  const groundArrows = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed * 999.77) * 10000;
      return x - Math.floor(x);
    };
    const slotWidth = 100 / ARROW_COUNT;
    return Array.from({ length: ARROW_COUNT }, (_, i) => ({
      id: i,
      fullImage: FULL_ARROW_IMAGES[i % 2],
      halfImage: HALF_ARROW_IMAGES[i % 2],
      left: i * slotWidth + seededRandom(i * 1.13) * slotWidth,
      rotate: -24 + seededRandom(i * 2.71) * 48,
      scale: 0.75 + seededRandom(i * 3.59) * 0.6,
      sink: -18 + seededRandom(i * 4.87) * 22,
      // Volley trajectory — one consistent shot direction (upper-right
      // to lower-left), not random-per-arrow, is what makes this read
      // as coordinated enemy fire instead of scattered rain.
      flightRotate: 14 + seededRandom(i * 5.31) * 22,
      flightDx: -230 + seededRandom(i * 6.47) * 60 - 30,
      delay: Math.floor(seededRandom(i * 7.19) * 550),
      duration: 260 + Math.floor(seededRandom(i * 8.71) * 160),
    }));
  }, []);

  // Per-arrow @keyframes — unique names per id since each has a
  // different trajectory/timing. Generated once, injected as raw CSS.
  const arrowKeyframes = useMemo(
    () =>
      groundArrows
        .map(
          (a) => `
      @keyframes arrowFly-${a.id} {
        0% { transform: translateX(-50%) translate(${a.flightDx}px, -130vh) rotate(${a.flightRotate}deg) scale(${a.scale * 0.9}); opacity: 0; }
        6% { opacity: 1; }
        88% { transform: translateX(-50%) translate(${a.flightDx * 0.04}px, ${a.sink}px) rotate(${a.rotate}deg) scale(${a.scale}); opacity: 1; }
        100% { transform: translateX(-50%) translate(0px, ${a.sink}px) rotate(${a.rotate}deg) scale(${a.scale}); opacity: 0; }
      }
      @keyframes arrowLand-${a.id} {
        0%, 96% { opacity: 0; }
        100% { opacity: 1; }
      }
    `
        )
        .join(''),
    [groundArrows]
  );
  // ── Helpers ────────────────────────────────────

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 2;
  }, []);

  // ── Lifecycle ─────────────────────────────────

  useEffect(() => {
    // Fire immediately on mount
    const id = setTimeout(() => {
      triggerFlash();
    }, 80);
    return () => {
      clearTimeout(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayedTitle(''); setDisplayedTagline(''); setDisplayedBio('');
    setIsTitleComplete(false); setIsTaglineComplete(false); setIsBioComplete(false);
    triggerFlash();
  }, [title, tagline, bio]);

  useEffect(() => {
    // Bio completing triggers a flash
    if (isBioComplete) {
      triggerFlash();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isBioComplete]);

  // ── Typewriters ───────────────────────────────

  useEffect(() => {
    if (displayedTitle.length < title.length) {
      const t = setTimeout(() => setDisplayedTitle(title.slice(0, displayedTitle.length + 1)), 50);
      return () => clearTimeout(t);
    } else { setIsTitleComplete(true); }
  }, [displayedTitle, title]);

  useEffect(() => {
    if (isTitleComplete && displayedTagline.length < tagline.length) {
      const t = setTimeout(() => setDisplayedTagline(tagline.slice(0, displayedTagline.length + 1)), 40);
      return () => clearTimeout(t);
    } else if (isTitleComplete && displayedTagline.length === tagline.length) { setIsTaglineComplete(true); }
  }, [isTitleComplete, displayedTagline, tagline]);

  useEffect(() => {
    if (isTaglineComplete && displayedBio.length < bio.length) {
      const t = setTimeout(() => setDisplayedBio(bio.slice(0, displayedBio.length + 1)), 30);
      return () => clearTimeout(t);
    } else if (isTaglineComplete && displayedBio.length === bio.length) { setIsBioComplete(true); }
  }, [isTaglineComplete, displayedBio, bio]);

  const skipAnimation = () => {
    setDisplayedTitle(title); setDisplayedTagline(tagline); setDisplayedBio(bio);
    setIsTitleComplete(true); setIsTaglineComplete(true); setIsBioComplete(true);
  };

  // ── Flash trigger ────────────────────────────

  const triggerFlash = useCallback(() => {
    if (flashRef.current) {
      flashRef.current.style.opacity = '1';
      setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = '0'; }, 80);
    }
  }, []);

  // ── Render ────────────────────────────────────
  return (
    <div className="relative w-full">
      {createPortal(
        <>
          <style>{arrowKeyframes}</style>

          {/* Flying full arrows — the incoming volley */}
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[999] h-full overflow-hidden"
            aria-hidden="true"
          >
            {groundArrows.map((a) => (
              <img
                key={`fly-${a.id}`}
                src={a.fullImage}
                alt=""
                className="absolute select-none"
                style={{
                  left: `${a.left}%`,
                  bottom: 0,
                  width: '280px',
                  transformOrigin: 'bottom center',
                  filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.4)) blur(0.4px)',
                  animation: `arrowFly-${a.id} ${a.duration}ms ${a.delay}ms cubic-bezier(0.16,0.84,0.44,1) forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </div>

          {/* Landed half arrows — your approved size/position, now timed
              to appear right as each flying arrow strikes */}
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[998] h-44 overflow-hidden"
            aria-hidden="true"
          >
            {groundArrows.map((a) => (
              <img
                key={`land-${a.id}`}
                src={a.halfImage}
                alt=""
                className="absolute select-none"
                style={{
                  left: `${a.left}%`,
                  bottom: `${a.sink}px`,
                  width: '290px',
                  transform: `translateX(-50%) rotate(${a.rotate}deg) scale(${a.scale})`,
                  transformOrigin: 'bottom center',
                  filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.4))',
                  animation: `arrowLand-${a.id} ${a.duration}ms ${a.delay}ms linear forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </div>
        </>,
        document.body
      )}

      {/* Container for Arab King */}
      <div
        className="pointer-events-none absolute -left-[800px] -bottom-14 z-10 h-[90%] select-none"
        style={{ perspective: '900px', perspectiveOrigin: '50% 55%', transformStyle: 'preserve-3d', overflow: 'visible' }}
      >
        <img src={arabKing} alt="Arab King" className="h-full object-contain"
          style={{ transform: 'translateZ(0)' }} />

        {/* Impact flash */}
        <div ref={flashRef} style={{
          position: 'absolute', inset: '-30%',
          background: 'radial-gradient(ellipse at 50% 55%, rgba(255,230,120,0.88) 0%, rgba(255,160,30,0.42) 40%, transparent 70%)',
          opacity: 0, pointerEvents: 'none', transition: 'opacity 0.08s ease-out', zIndex: 20, borderRadius: '50%',
        }} />
      </div>

      {/* Map / content (position unchanged) */}
      <div className="relative w-full rounded-2xl overflow-hidden" style={{
        backgroundImage: `url(${mapAsset})`, backgroundSize: 'cover',
        backgroundPosition: 'center', backgroundRepeat: 'no-repeat',
        minHeight: '650px', width: '100%',
      }}>
        <div className="relative z-20 p-6 left-32 top-24 md:p-10 max-w-md">
          <h3 className="mb-2 text-lg font-bold text-[#5c2e0e] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
            {displayedTitle}
            {!isTitleComplete && <span className="inline-block w-0.5 h-5 ml-1 bg-[#5c2e0e] animate-pulse" />}
          </h3>
          <p className="mb-3 border-l-4 border-[#5c2e0e] pl-4 text-base italic leading-6 text-[#4a2208] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)]">
            {displayedTagline}
            {isTitleComplete && !isTaglineComplete && <span className="inline-block w-0.5 h-5 ml-1 bg-[#4a2208] animate-pulse" />}
          </p>
          <p className="text-sm leading-6 text-[#3d1b05] drop-shadow-[0_2px_4px_rgba(255,255,255,0.4)] text-justify max-w-2xl">
            {displayedBio}
            {isTaglineComplete && !isBioComplete && <span className="inline-block w-0.5 h-5 ml-1 bg-[#3d1b05] animate-pulse" />}
          </p>
        </div>

        {(!isBioComplete || !isTaglineComplete || !isTitleComplete) && (
          <button onClick={skipAnimation}
            className="absolute bottom-0 right-0 z-20 flex w-fit items-center gap-2 rounded-lg border border-[rgba(255,210,122,0.4)] px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-[#fff0c7] backdrop-blur-sm transition hover:border-[#ffd27a] hover:bg-[rgba(255,210,122,0.12)]">
            Skip
          </button>
        )}

        <video className="snake-crawler pointer-events-none fixed z-30 w-40 sm:w-56 md:w-72 opacity-90"
          src={snakeShot} autoPlay ref={videoRef} loop muted playsInline />

        <style>{`
          @keyframes snakeCrawlDiagonal {
            0%  { bottom:-10%; right:-100%; transform:rotate(0deg) scale(1); opacity:1; }
            15% { bottom:-10%; right:130%;  transform:rotate(0deg) scale(1); opacity:1; }
            20% { bottom:-10%; right:130%;  transform:rotate(0deg) scale(1); opacity:0; }
            45% { bottom:-10%; right:130%;  transform:rotate(0deg) scale(1); opacity:0; }
            50% { bottom:-10%; right:-100%; transform:rotate(0deg) scale(1); opacity:0; }
            100%{ bottom:-10%; right:-100%; transform:rotate(0deg) scale(1); opacity:1; }
          }
          .snake-crawler { animation: snakeCrawlDiagonal 120s ease-in-out infinite; }
        `}</style>
      </div>
    </div>
  );
};

export default OriginPeakDisplay;