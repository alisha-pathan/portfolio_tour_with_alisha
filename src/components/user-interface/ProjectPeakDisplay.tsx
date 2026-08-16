import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import type { Project } from '../../data/portfolioPeaks';
import { PEAKS } from '../../data/portfolioPeaks';

import crystel1 from '../../assets/my_assets/golden_crystel.svg';
import crystel2 from '../../assets/my_assets/blue_crystel.svg';
import crystel3 from '../../assets/my_assets/white_crystel.svg';
import crystel4 from '../../assets/my_assets/dark_crystel.svg';
import crystel5 from '../../assets/my_assets/red_crystel.svg';
import crystel6 from '../../assets/my_assets/green_crystel.svg';

// ============================================
// CRYSTAL DATA - ALL 6 CRYSTALS
// ============================================

const crystals = [
  { id: 'golden', color: '#f9a825', image: crystel1 },
  { id: 'blue', color: '#1565c0', image: crystel2 },
  { id: 'white', color: '#ffffff', image: crystel3 },
  { id: 'purple', color: '#6a1b9a', image: crystel4 },
  { id: 'red', color: '#c62828', image: crystel5 },
  { id: 'dark', color: '#1e1e1e', image: crystel6 },
];

// ============================================
// CORNER DEFINITIONS
// ============================================

const corners = [
  { name: 'top-right', x: 80, y: -80, rotate: 70 },
  { name: 'top-left', x: -80, y: -80, rotate: -70 },
  { name: 'bottom-right', x: 80, y: 80, rotate: 70 },
  { name: 'bottom-left', x: -80, y: 80, rotate: -70 },
];

const getOppositeCorner = (corner: typeof corners[0]) => {
  const opposites = {
    'top-right': { x: -80, y: 80, rotate: -70 },
    'top-left': { x: 80, y: 80, rotate: 70 },
    'bottom-right': { x: -80, y: -80, rotate: -70 },
    'bottom-left': { x: 80, y: -80, rotate: 70 },
  };
  return opposites[corner.name as keyof typeof opposites] || opposites['top-right'];
};

const getRandomCorner = () => {
  return corners[Math.floor(Math.random() * corners.length)];
};

// ============================================
// SPLIT DESCRIPTION INTO 2 SIDES (Left & Right)
// ============================================

const splitIntoTwoSides = (text: string): [string, string] => {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];

  if (sentences.length === 1) {
    return [text, ''];
  }

  const half = Math.floor(sentences.length / 2);
  const left = sentences.slice(0, half).join(' ');
  const right = sentences.slice(half).join(' ');

  return [left, right];
};

// ============================================
// FLOATING CONTENT CHUNK (Left & Right)
// ============================================

const FloatingChunk = React.memo(({ text, delay, align }: { text: string; delay: number; align?: 'left' | 'right' }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9, y: 10 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.9, y: -10 }}
    transition={{ duration: 0.7, delay, ease: 'easeOut' }}
    className="max-w-[280px] text-sm leading-relaxed"
    style={{
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      color: 'white',
      letterSpacing: '0.02em',
      fontWeight: 500,
      textAlign: align || 'left',
    }}
  >
    {text}
  </motion.div>
));

FloatingChunk.displayName = 'FloatingChunk';

// ============================================
// DUST MOTE (ambient depth layer, sits behind the crystal)
// ============================================

const DustMote = React.memo(({ x, delay, duration, size, colorHex }: { x: number; delay: number; duration: number; size: number; colorHex: string }) => (
  <motion.div
    className="absolute rounded-full pointer-events-none"
    style={{
      left: `${x}%`,
      bottom: '10%',
      width: size,
      height: size,
      background: colorHex,
      filter: 'blur(1.5px)',
    }}
    animate={{
      y: [0, -140, -260],
      opacity: [0, 0.55, 0],
      x: [0, x % 2 === 0 ? 20 : -20, 0],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
));

DustMote.displayName = 'DustMote';

// ============================================
// MAIN COMPONENT
// ============================================

interface ProjectPeakDisplayProps {
  projects?: Project[];
}

export function ProjectPeakDisplay({ projects: customProjects }: ProjectPeakDisplayProps) {
  const projectsPeak = PEAKS.find(peak => peak.id === 'projects');
  const projectsData = customProjects || (projectsPeak?.content.type === 'projects' ? projectsPeak.content.projects : []);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [entryCorner, setEntryCorner] = useState(getRandomCorner());
  const [exitCorner, setExitCorner] = useState(getOppositeCorner(entryCorner));

  // ===== 🟢 TILT (mouse-parallax) MOTION VALUES =====
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  const handleCrystalMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    tiltY.set(px * 22);
    tiltX.set(-py * 22);
  };

  const resetTilt = () => {
    tiltX.set(0);
    tiltY.set(0);
  };

  const changeCrystal = (newIndex: number) => {
    if (isAnimating || projectsData.length === 0) return;

    const safeIndex = ((newIndex % projectsData.length) + projectsData.length) % projectsData.length;
    if (safeIndex === activeIndex) return;

    setIsAnimating(true);
    const newEntry = getRandomCorner();
    const newExit = getOppositeCorner(newEntry);
    setEntryCorner(newEntry);
    setExitCorner(newExit);

    setTimeout(() => {
      setActiveIndex(safeIndex);
      setIsAnimating(false);
    }, 1200);
  };

  const handleDotClick = (index: number) => changeCrystal(index);
  const handleNext = () => changeCrystal(activeIndex + 1);
  const handlePrev = () => changeCrystal(activeIndex - 1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, isAnimating, projectsData.length]);

  // ===== ENTRY / EXIT ANIMATIONS =====
  const crystalVariants = {
    enter: (corner: typeof corners[0]) => ({
      opacity: 0,
      x: `${corner.x}vw`,
      y: `${corner.y}vh`,
      scale: 0.2,
      rotateX: 180,
      rotateZ: corner.rotate,
      transition: { duration: 0.9, ease: [0.22, 1.1, 0.36, 1] as const },
    }),
    center: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      rotateX: 0,
      rotateZ: 0,
      transition: { duration: 0.9, ease: [0.22, 1.1, 0.36, 1] as const },
    },
    exit: (corner: typeof corners[0]) => ({
      opacity: 0,
      x: `${corner.x}vw`,
      y: `${corner.y}vh`,
      scale: 0.2,
      rotateX: 180,
      rotateZ: corner.rotate,
      transition: { duration: 0.8, ease: 'easeIn' as const },
    }),
  };

  // ===== 🟢 LIVING IDLE ANIMATION (Floating + Breathing Tilt) =====
  const idleVariants = {
    animate: {
      y: [0, -18, 0, 18, 0],
      rotateX: [0, 5, 0, -5, 0],
      rotateZ: [0, 3, 0, -3, 0],
      scale: [1, 1.03, 1, 0.97, 1],
      transition: {
        duration: 6,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  // ===== 🟢 DYNAMIC 3D SHADOW (Moves opposite to crystal) =====
  const shadowVariants = {
    animate: {
      scale: [0.9, 1.2, 0.9, 0.6, 0.9],
      opacity: [0.4, 0.7, 0.4, 0.2, 0.4],
      x: [0, 15, 0, -15, 0],
      y: [0, 5, 0, -5, 0],
      transition: {
        duration: 6,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  // ===== 🟢 PULSING AURA GLOW =====
  const auraVariants = {
    animate: {
      scale: [1, 1.4, 1],
      opacity: [0.6, 0.1, 0.6],
      transition: {
        duration: 3,
        ease: "easeInOut" as const,
        repeat: Infinity,
        repeatType: "loop" as const,
      },
    },
  };

  // ===== 🟢 SPECULAR HIGHLIGHT (glint riding the surface) =====
  const glintVariants = {
    animate: {
      opacity: [0.3, 0.9, 0.3],
      scale: [0.9, 1.1, 0.9],
      transition: {
        duration: 4,
        ease: 'easeInOut' as const,
        repeat: Infinity,
        repeatType: 'loop' as const,
      },
    },
  };

  const currentProject = projectsData.length > 0 ? projectsData[activeIndex % projectsData.length] : null;
  const currentCrystal = crystals[activeIndex % crystals.length];

  if (!currentProject || projectsData.length === 0) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-transparent flex items-center justify-center">
        <p className="text-slate-700" style={{ textShadow: '0 2px 10px rgba(255,255,255,0.8)' }}>No projects available</p>
      </div>
    );
  }

  // Split description into exactly 2 sides (Left & Right)
  const [leftChunk, rightChunk] = splitIntoTwoSides(currentProject.description);

  // Dust motes: a handful of positions/timings, memoized-in-place since values are cheap
  const dustMotes = [
    { x: 42, delay: 0, duration: 7, size: 4 },
    { x: 55, delay: 1.5, duration: 8.5, size: 3 },
    { x: 47, delay: 3, duration: 6.5, size: 5 },
    { x: 60, delay: 2, duration: 9, size: 3 },
    { x: 38, delay: 4, duration: 7.5, size: 4 },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-transparent flex flex-col items-center justify-center">

      {/* ===== TOP: PROJECT TITLE (Only) ===== */}
      <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20 text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl md:text-4xl font-semibold tracking-wide"
          style={{
            color: 'white',
            textShadow: '0 3px 15px rgba(255,255,255,0.9), 0 0 30px rgba(255,255,255,0.5)',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}
        >
          {currentProject.title}
        </motion.h2>
      </div>

      {/* ===== CENTER: CRYSTAL WITH 3D SHADOW, AURA & TILT ===== */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative flex h-[350px] w-[350px] items-center justify-center pointer-events-auto"
          style={{ perspective: 900 }}
          onMouseMove={handleCrystalMouseMove}
          onMouseLeave={resetTilt}
        >
          {/* 0. Ambient dust motes — behind everything, sells depth */}
          {dustMotes.map((m, i) => (
            <DustMote key={i} x={m.x} delay={m.delay} duration={m.duration} size={m.size} colorHex={`${currentCrystal.color}99`} />
          ))}

          {/* 1. Outer Pulsing Aura */}
          <motion.div
            variants={auraVariants}
            animate="animate"
            className="absolute inset-0 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, ${currentCrystal.color}60 0%, transparent 70%)`,
              width: '100%',
              height: '100%',
            }}
          />

          {/* 2a. Wide soft ambient shadow (existing) */}
          <motion.div
            variants={shadowVariants}
            animate="animate"
            className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 w-[140px] h-[30px] rounded-[50%]"
            style={{
              background: `radial-gradient(ellipse, ${currentCrystal.color}80 0%, transparent 70%)`,
              filter: 'blur(15px)',
            }}
          />

          {/* 2b. Tight dark contact shadow — grounds the object */}
          <div
            className="absolute bottom-[-14px] left-1/2 -translate-x-1/2 w-[90px] h-[14px] rounded-[50%] pointer-events-none"
            style={{
              background: 'rgba(0,0,0,0.35)',
              filter: 'blur(6px)',
            }}
          />

          {/* 3. The Crystal Itself, now with mouse-parallax tilt */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              custom={entryCorner}
              variants={crystalVariants}
              initial="enter"
              animate="center"
              exit="exit"
              style={{
                width: '280px',
                height: '320px',
                position: 'absolute',
                transformStyle: 'preserve-3d',
                zIndex: 10,
              }}
            >
              <motion.div
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'relative',
                  transformStyle: 'preserve-3d',
                  rotateX: tiltX,
                  rotateY: tiltY,
                }}
              >
                <motion.div
                  variants={idleVariants}
                  animate="animate"
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <img
                    src={currentCrystal.image}
                    alt="Crystal"
                    className="h-full w-full object-contain"
                    style={{
                      filter: `
                        drop-shadow(0 0 50px ${currentCrystal.color}60) 
                        drop-shadow(0 0 100px ${currentCrystal.color}30)
                      `,
                      transform: 'perspective(1200px) rotateX(8deg)',
                    }}
                  />

                  {/* Specular glint — reads as light hitting a facet */}
                  <motion.div
                    variants={glintVariants}
                    animate="animate"
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: '18%',
                      left: '32%',
                      width: '34px',
                      height: '64px',
                      background: 'rgba(255,255,255,0.9)',
                      filter: 'blur(9px)',
                      mixBlendMode: 'overlay',
                      transform: 'rotate(-18deg)',
                    }}
                  />
                  <motion.div
                    variants={glintVariants}
                    animate="animate"
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      top: '46%',
                      left: '55%',
                      width: '18px',
                      height: '30px',
                      background: 'rgba(255,255,255,0.7)',
                      filter: 'blur(6px)',
                      mixBlendMode: 'overlay',
                      transform: 'rotate(12deg)',
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== LEFT: Half of the description ===== */}
      <div className="absolute left-6 top-[30%] z-10 w-[280px]">
        <FloatingChunk text={leftChunk} delay={0.2} align="left" />
      </div>

      {/* ===== RIGHT: Other half of the description ===== */}
      <div className="absolute right-6 top-[30%] z-10 w-[280px]">
        <FloatingChunk text={rightChunk} delay={0.4} align="right" />
      </div>

      {/* ===== BOTTOM: NAV CLUSTER — arrows + crystal navbar together ===== */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6">
        {/* <button
          onClick={handlePrev}
          disabled={isAnimating}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1a1a2e" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button> */}

        <div className="flex items-center gap-5">
          {crystals.map((crystal, index) => (
            <button
              key={crystal.id}
              onClick={() => handleDotClick(index)}
              className="group relative transition-all duration-300 hover:scale-110"
              disabled={isAnimating}
            >
              <div
                className={`rounded-full overflow-hidden transition-all duration-500 ${index === activeIndex % crystals.length
                  ? 'ring-2 ring-white/80 shadow-[0_0_30px_rgba(255,255,255,0.6)] scale-110'
                  : 'opacity-40 hover:opacity-80'
                  }`}
                style={{
                  width: index === activeIndex % crystals.length ? '48px' : '36px',
                  height: index === activeIndex % crystals.length ? '48px' : '36px',
                  boxShadow:
                    index === activeIndex % crystals.length
                      ? `0 0 40px ${crystal.color}80`
                      : 'none',
                }}
              >
                <img
                  src={crystal.image}
                  alt="Crystal"
                  className="w-full h-full object-contain"
                />
              </div>
            </button>
          ))}
        </div>

        {/* <button
          onClick={handleNext}
          disabled={isAnimating}
          className="flex h-11 w-11 items-center justify-center rounded-full transition-all hover:scale-110 disabled:opacity-50"
          style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.3)',
            boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="#1a1a2e" className="h-6 w-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button> */}
      </div>

    </div>
  );
}

export default ProjectPeakDisplay;