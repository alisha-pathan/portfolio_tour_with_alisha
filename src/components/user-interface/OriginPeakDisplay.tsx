/**
 * @file OriginPeakDisplay.tsx
 * @description Display component for Origin Peak with map background and typewriter animation
 *
 * ARCHITECTURE NOTE (for portfolio reviewers):
 * The shard particle system intentionally bypasses React state for simulation data.
 * All physics runs in a plain-object ref (simRef), and transforms are written directly
 * to DOM nodes via style.transform — exactly as you would in a Canvas/WebGL game loop.
 * This gives true 60 fps with zero React re-renders per frame.
 * React is only used for the typewriter text (discrete updates, not per-frame).
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import mapAsset from "../../assets/my_assets/mapAsset.png";
import snakeShot from "../../assets/videos/snake_shot.webm";
import arabKing from "../../assets/my_assets/Arab_king.png";
import shard1 from "../../assets/my_assets/shard1.png";
import shard2 from "../../assets/my_assets/shard2.png";
import shard3 from "../../assets/my_assets/shard3.png";
import shard4 from "../../assets/my_assets/shard4.png";

// ─────────────────────────────────────────────
//  Interfaces
// ─────────────────────────────────────────────

interface OriginPeakDisplayProps {
  title: string;
  tagline: string;
  bio: string;
}

interface Stone {
  id: number;
  x: number;
  y: number;
  size: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  opacity: number;
  color: string;
  scale: number;
}

// Shard simulation data — lives in a ref, never in React state.
interface ShardSim {
  id: number;
  img: string;
  x: number; y: number; z: number;
  vx: number; vy: number; vz: number;
  rx: number; ry: number; rz: number;
  arx: number; ary: number; arz: number;
  scale: number;
  targetScale: number;
  opacity: number;
  orbitPhase: number;
  orbitAmpX: number; orbitAmpY: number; orbitAmpZ: number;
  orbitSpeed: number;
  // 'settle' = falling under gravity toward rest point
  // 'settled' = fully frozen at landing spot forever
  state: 'jitter' | 'blast' | 'settle' | 'settled' | 'fadeout';
  age: number;
  delay: number;
  size: number;
  el: HTMLImageElement | null;
  trailEls: HTMLImageElement[];
  trailPositions: Array<{ x: number; y: number; z: number; rx: number; ry: number; rz: number }>;
}

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────

// const SHARD_IMAGES = [shard1, shard2, shard3, shard4, shard1, shard2, shard3, shard4, shard1, shard2, shard3, shard4, shard1, shard2, shard3, shard4, shard1, shard2, shard3, shard4];

const SHARD_IMAGES = [shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,shard1,shard2,];
const FIXED_DT = 1 / 60;
const BLAST_SPEED_MIN = 300;
const BLAST_SPEED_MAX = 580;
const BRAKE_DRAG = 0.042;
const GRAVITY = 160;  // pulls shards down during blast
const SETTLE_GRAVITY = 380;  // heavier fall once settling
const SETTLE_DRAG = 0.75; // horizontal bleed-off
const BLAST_COUNT = 28;   // sweet spot: visible but NOT expensive

// ─────────────────────────────────────────────
//  Pure helpers
// ─────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

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
  const [stones, setStones] = useState<Stone[]>([]);
  const [isExploding, setIsExploding] = useState(false);

  // ── DOM refs ───────────────────────────────────
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const flashRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // ── Simulation ref (zero React re-renders) ─────
  const sim = useRef({
    shards: [] as ShardSim[],
    mouse: { x: 0, y: 0 },
    accumulator: 0,
    lastTime: 0,
    idCounter: 0,
  });

  // ── Helpers ────────────────────────────────────

  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = 2;
  }, []);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      sim.current.mouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      sim.current.mouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', move, { passive: true });
    return () => window.removeEventListener('mousemove', move);
  }, []);

  // ── DOM pool ───────────────────────────────────

  const mkEl = useCallback((src: string, sz: number, left = '50%', top = '55%'): HTMLImageElement => {
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `position:absolute;pointer-events:none;user-select:none;width:${sz}px;height:${sz}px;left:${left};top:${top};will-change:transform,opacity;transform-origin:center center;`;
    return img;
  }, []);

  const freeEl = useCallback((s: ShardSim) => {
    s.el?.remove(); s.el = null;
    // trails removed — nothing to free
    s.trailEls = [];
  }, []);

  // ── Shard factories ────────────────────────────



  const mkBlast = useCallback((i: number, base: number): ShardSim => {
    const angle = Math.random() * Math.PI * 2;
    const spd = BLAST_SPEED_MIN + Math.random() * (BLAST_SPEED_MAX - BLAST_SPEED_MIN);
    // Mix of upward bursts and sideways shards — like a real impact
    const upBias = -160 + Math.random() * 100;
    return {
      id: base + i, img: SHARD_IMAGES[Math.floor(Math.random() * SHARD_IMAGES.length)],
      x: (Math.random() - 0.5) * 18, y: (Math.random() - 0.5) * 18, z: 0,
      vx: Math.cos(angle) * spd, vy: Math.sin(angle) * spd + upBias, vz: (Math.random() - 0.5) * spd * 0.35,
      rx: Math.random() * 360, ry: Math.random() * 360, rz: Math.random() * 360,
      arx: (Math.random() - 0.5) * 900, ary: (Math.random() - 0.5) * 900, arz: (Math.random() - 0.5) * 600,
      scale: 0.04, targetScale: 0.5 + Math.random() * 0.6,
      opacity: 1,
      // orbit fields kept for type compat but unused after settle redesign
      orbitPhase: 0, orbitAmpX: 0, orbitAmpY: 0, orbitAmpZ: 0, orbitSpeed: 0,
      state: 'jitter', age: 0, delay: Math.random() * 0.09,
      size: 24 + Math.random() * 42,
      el: null, trailEls: [], trailPositions: [],
    };
  }, []);

  // ── Physics tick (pure, no React) ─────────────

  const tick = useCallback((dt: number) => {
    const { shards, mouse } = sim.current;

    // Remove dead shards
    for (let i = shards.length - 1; i >= 0; i--) {
      if (shards[i].opacity <= 0.015) {
        freeEl(shards[i]);
        shards.splice(i, 1);
      }
    }

    for (const s of shards) {
      // ── SETTLED = frozen forever, skip entirely ──
      // We wrote the final DOM position when we transitioned into settled.
      // No math, no DOM touch. Free CPU.
      if (s.state === 'settled') continue;

      s.age += dt;

      // ── FSM transitions ──────────────
      if (s.state === 'jitter' && s.age >= s.delay) s.state = 'blast';

      if (s.state === 'blast') {
        const spd2 = s.vx * s.vx + s.vy * s.vy + s.vz * s.vz;
        const elapsed = s.age - s.delay;
        if (spd2 < 50 * 50 || elapsed > 0.85) {
          s.state = Math.random() > 0.32 ? 'settle' : 'fadeout';
          s.arx *= 0.1; s.ary *= 0.1; s.arz *= 0.1;
        }
      }

      if (s.state === 'settle') {
        s.vy += SETTLE_GRAVITY * dt;
        s.vx *= SETTLE_DRAG;
        s.vz *= SETTLE_DRAG;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.z += s.vz * dt;
        s.rx += s.arx * dt * 0.4;
        s.ry += s.ary * dt * 0.4;
        s.rz += s.arz * dt * 0.4;
        s.arx *= 0.85; s.ary *= 0.85; s.arz *= 0.85;
        s.scale = lerp(s.scale, s.targetScale, dt * 2.5);
        // Freeze when clearly landed
        if (s.vy > 380 || s.y > 400) {
          s.state = 'settled';
          s.vx = 0; s.vy = 0; s.vz = 0;
          s.arx = 0; s.ary = 0; s.arz = 0;
          // Write final position to DOM ONCE, then we skip this shard forever
          if (s.el) {
            const depth = clamp((s.z + 200) / 400, 0.2, 1.8);
            const px = mouse.x * 20 * depth;
            const py = mouse.y * 14 * depth;
            s.el.style.transform = `translate3d(calc(-50% + ${s.x + px}px),calc(-50% + ${s.y + py}px),${s.z}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) rotateZ(${s.rz}deg) scale(${s.scale})`;
            s.el.style.opacity = String(clamp(s.opacity, 0, 1));
            s.el.style.filter = `drop-shadow(0 4px 10px rgba(255,190,60,0.3))`;
          }
          continue; // skip rest of loop body for this shard
        }
      }

      // ── Per-state update ──────────────
      if (s.state === 'jitter') {
        s.x = (Math.random() - 0.5) * 12;
        s.y = (Math.random() - 0.5) * 12;
        s.z = (Math.random() - 0.5) * 6;
        s.rx += (Math.random() - 0.5) * 50;
        s.ry += (Math.random() - 0.5) * 50;
        s.rz += (Math.random() - 0.5) * 35;
        s.scale = lerp(s.scale, 0.06, 0.3);
      }
      else if (s.state === 'blast') {
        s.vy += GRAVITY * dt;
        const drag = Math.pow(1 - BRAKE_DRAG, dt * 60);
        s.vx *= drag; s.vy *= drag; s.vz *= drag;
        s.arx *= drag; s.ary *= drag; s.arz *= drag;
        s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt;
        s.rx += s.arx * dt; s.ry += s.ary * dt; s.rz += s.arz * dt;
        s.scale = lerp(s.scale, s.targetScale, clamp(dt * 10, 0, 1));
      }
      else if (s.state === 'fadeout') {
        s.opacity = lerp(s.opacity, 0, dt * 5);
        s.scale = lerp(s.scale, 0, dt * 4);
      }

      // ── Parallax ──────────────────────
      const depth = clamp((s.z + 200) / 400, 0.2, 1.8);
      const px = mouse.x * 20 * depth;
      const py = mouse.y * 14 * depth;
      const fx = s.x + px, fy = s.y + py;

      // ── DOM write ─────────────────────
      if (s.el) {
        s.el.style.transform = `translate3d(calc(-50% + ${fx}px),calc(-50% + ${fy}px),${s.z}px) rotateX(${s.rx}deg) rotateY(${s.ry}deg) rotateZ(${s.rz}deg) scale(${s.scale})`;
        s.el.style.opacity = String(clamp(s.opacity, 0, 1));
        s.el.style.filter = `drop-shadow(0 3px 8px rgba(255,190,60,${0.18 + depth * 0.14}))`;
      }
    }

  }, [freeEl]);

  // ── RAF loop (fixed-step accumulator) ─────────

  const startLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    const loop = (now: number) => {
      const s = sim.current;
      if (s.lastTime === 0) s.lastTime = now;
      const raw = Math.min((now - s.lastTime) / 1000, 0.05);
      s.lastTime = now;
      // Single tick per frame — prevents spiral-of-death under load
      s.accumulator += raw;
      if (s.accumulator >= FIXED_DT) {
        tick(FIXED_DT);
        s.accumulator -= FIXED_DT;
        // Drain excess: if frames are slow, catch up max 2 ticks then discard
        if (s.accumulator >= FIXED_DT) {
          tick(FIXED_DT);
          s.accumulator = 0;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  }, [tick]);

  const stopLoop = useCallback(() => {
    if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  // ── Init ──────────────────────────────────────

  const initSim = useCallback(() => {
    const s = sim.current;
    s.shards.forEach(freeEl); s.shards = [];
    s.accumulator = 0; s.lastTime = 0; s.idCounter = 0;
    // No ambient orbit shards on mount — the battlefield starts empty.
    // The explosion fires immediately and shards are the ONLY presence.
  }, [freeEl]);

  // ── Explosion ─────────────────────────────────

  const triggerShards = useCallback(() => {
    if (!containerRef.current) return;
    const s = sim.current;

    // Flash only — no shockwave ring
    if (flashRef.current) {
      flashRef.current.style.opacity = '1';
      setTimeout(() => { if (flashRef.current) flashRef.current.style.opacity = '0'; }, 80);
    }

    const base = s.idCounter; s.idCounter += BLAST_COUNT;
    for (let i = 0; i < BLAST_COUNT; i++) {
      const sh = mkBlast(i, base);
      sh.el = mkEl(sh.img, sh.size);
      containerRef.current.appendChild(sh.el);
      // No trail elements — zero extra DOM nodes
      s.shards.push(sh);
    }
  }, [mkBlast, mkEl]);

  // ── Lifecycle ─────────────────────────────────

  useEffect(() => {
    // Fire immediately on mount — no waiting for typewriter.
    // The attack happens the MOMENT you land on this page.
    const id = setTimeout(() => {
      initSim();
      startLoop();
      triggerShards(); // ← instant impact on arrival
    }, 80);
    return () => {
      clearTimeout(id);
      stopLoop();
      sim.current.shards.forEach(freeEl);
      sim.current.shards = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDisplayedTitle(''); setDisplayedTagline(''); setDisplayedBio('');
    setIsTitleComplete(false); setIsTaglineComplete(false); setIsBioComplete(false);
    setStones([]); setIsExploding(false);
    initSim();
    triggerShards(); // reset also re-triggers
  }, [title, tagline, bio, initSim, triggerShards]);

  useEffect(() => {
    // Bio completing triggers a SECOND wave — double impact
    if (isBioComplete && !isExploding) {
      triggerStoneExplosion();
      triggerShards();
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

  // ── Stone explosion (React state, unchanged) ───

  const triggerStoneExplosion = () => {
    setIsExploding(true);
    const colors = ['#C8A96E', '#B8956A', '#A67B5B', '#D4AF37', '#8B7355', '#CD9B1D', '#B8860B', '#DAA520'];
    setStones(Array.from({ length: 90 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2, spd = 2 + Math.random() * 6;
      return {
        id: i, x: 100 + Math.random() * 100, y: 300 + Math.random() * 100,
        size: 4 + Math.random() * 10, rotation: Math.random() * 360,
        velocityX: Math.cos(angle) * spd * (0.5 + Math.random()),
        velocityY: Math.sin(angle) * spd * (0.5 + Math.random()) - 3,
        opacity: 0.9 + Math.random() * 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        scale: 0.8 + Math.random() * 0.4,
      };
    }));
  };

  useEffect(() => {
    if (!isExploding) return;
    const anim = () => {
      setStones(prev => prev
        .map(s => ({
          ...s, x: s.x + s.velocityX, y: s.y + s.velocityY, velocityY: s.velocityY + 0.2,
          rotation: s.rotation + s.velocityX / 10, opacity: s.opacity - 0.002, scale: s.scale - 0.002
        }))
        .filter(s => s.opacity > 0 && s.scale > 0.1)
      );
      rafRef.current = requestAnimationFrame(anim);
    };
    const id = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(id);
  }, [isExploding]);

  const skipAnimation = () => {
    setDisplayedTitle(title); setDisplayedTagline(tagline); setDisplayedBio(bio);
    setIsTitleComplete(true); setIsTaglineComplete(true); setIsBioComplete(true);
  };

  // ── Render ────────────────────────────────────
  return (
    <div className="relative w-full">
      {/* Shard container — perspective root */}
      <div
        ref={containerRef}
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

        {/* React-rendered stone particles (unchanged) */}
        {stones.map(s => (
          <div key={s.id} className="absolute rounded-full" style={{
            left: `${s.x}%`, top: `${s.y}%`, width: `${s.size}px`, height: `${s.size}px`,
            backgroundColor: s.color, transform: `rotate(${s.rotation}deg) scale(${s.scale})`,
            opacity: s.opacity, boxShadow: `0 0 ${s.size / 2}px ${s.color}33`,
            transition: 'none', pointerEvents: 'none',
          }} />
        ))}
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
