import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { useState, useMemo } from 'react';

import treasureChest from '../assets/icons/treasure.png';
import type { Skill } from '../data/portfolioPeaks';

interface Props {
  skills: Skill[];
}

// Stage 4: Skill Card Board "stab into mountain" animation
const stabBoardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -150,
    scale: 1.14,
    rotate: -4,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 460,
      damping: 17,
      mass: 0.85,
      delay: 1.35, // Stabs down right after cliffs & treasure settle
    },
  },
};

// Stage 5: Container for staggered skill cards
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 1.75, // Skill cards flip into place after board stabs in
    },
  },
};

// Stage 5: Individual skill cards pop/flip in
const cardVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 32,
    scale: 0.75,
    rotate: -6,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 380,
      damping: 20,
    },
  },
};

export function SkillsPeak({ skills }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(skills.map((s) => s.category).filter(Boolean)));
    return ['All', ...cats];
  }, [skills]);

  // Filter skills by category
  const filteredSkills = useMemo(() => {
    if (selectedCategory === 'All') return skills;
    return skills.filter((s) => s.category === selectedCategory);
  }, [skills, selectedCategory]);

  return (
    <motion.div
      variants={stabBoardVariants}
      initial="hidden"
      animate="visible"
      className="relative mx-auto w-full max-w-4xl"
    >
      {/* Mountain Stab Impact Shockwave Aura */}
      <motion.div
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 0.8, 0], scale: [0.5, 1.25, 1.4] }}
        transition={{ duration: 0.65, delay: 1.48, ease: "easeOut" as const }}
        className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-16 w-3/4 rounded-full bg-gradient-to-r from-transparent via-[#f5a623]/40 to-transparent blur-md"
      />

      {/* Category Tabs Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f5a623]/20 pb-4">
        {/* Filter Chips */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`relative rounded-lg px-3 text-xs font-semibold tracking-wide transition-colors ${
                  isActive ? 'text-[#0e0804]' : 'text-[#ffd27a]/70 hover:text-[#ffd27a]'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSkillTab"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#f5a623] to-[#ffd27a] shadow-md shadow-[#f5a623]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Skills Grid with Animated Stagger (Stage 5) */}
      <motion.div
        key={selectedCategory}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3.5 mt-4"
      >
        <AnimatePresence mode="popLayout">
          {filteredSkills.map((skill, index) => {
            const isHovered = hoveredIndex === index;

            return (
              <motion.div
                key={skill.name}
                layout
                variants={cardVariants}
                whileHover={{ y: -6, scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="group relative cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => setSelectedSkill(skill)}
              >
                {/* Outer Golden Glow on Hover */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1.1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-[#f5a623]/20 via-[#ffd27a]/20 to-[#f5a623]/20 blur-lg"
                  />
                )}

                {/* Main Skill Chest Card */}
                <div
                  className={`
                    relative p-3 rounded-xl h-full min-h-[125px] sm:min-h-[135px]
                    flex flex-col items-center justify-center
                    transition-all duration-300 ease-out overflow-hidden
                    bg-gradient-to-b from-[#1a1208] via-[#2a1a0a] to-[#0d0805]
                    border backdrop-blur-md
                    ${
                      isHovered
                        ? 'border-[#f5a623] shadow-xl shadow-[#f5a623]/30'
                        : 'border-[#f5a623]/30 hover:border-[#f5a623]/60 shadow-lg shadow-[#f5a623]/5'
                    }
                  `}
                >
                  {/* Subtle Grid Texture Background */}
                  <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none opacity-40">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjZjVhNjIzIiBvcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')]" />
                  </div>

                  {/* Top Golden Light Ray / Inner Shimmer */}
                  <div
                    className={`
                      absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none
                      bg-gradient-to-b from-[#f5a623]/15 via-transparent to-transparent
                      ${isHovered ? 'opacity-100' : 'opacity-30'}
                    `}
                  />

                  {/* Animated Shimmer Sweep */}
                  {isHovered && (
                    <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#f5a623]/20 to-transparent animate-shimmer" />
                    </div>
                  )}

                  {/* Sparkle Particle Accents on Hover */}
                  {isHovered && (
                    <>
                      <span className="absolute top-2 left-2 text-[8px] text-[#ffd27a] animate-ping opacity-75">
                        ✦
                      </span>
                      <span className="absolute bottom-2 right-2 text-[8px] text-[#ffd27a] animate-ping opacity-75 delay-150">
                        ✦
                      </span>
                    </>
                  )}

                  {/* Chest Icon + Check Badge */}
                  <div className="relative flex flex-col items-center justify-center gap-2 z-10">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5a623]/10 border border-[#f5a623]/20 shadow-inner">
                      <motion.img
                        src={treasureChest}
                        alt={skill.name}
                        className="h-7 w-7 object-contain drop-shadow-[0_0_12px_rgba(245,166,35,0.4)]"
                        animate={
                          isHovered
                            ? { rotate: [-5, 5, -3, 3, 0], scale: 1.15 }
                            : { rotate: 0, scale: 1 }
                        }
                        transition={{ duration: 0.4 }}
                      />

                      {/* Collectible Checkmark Badge */}
                      <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-r from-[#f5a623] to-[#ffd27a] text-[8px] font-black text-[#0d0805] shadow-md shadow-[#f5a623]/40">
                        ✓
                      </div>
                    </div>

                    {/* Skill Title */}
                    <span
                      className={`
                        text-[10px] sm:text-xs font-semibold tracking-tight text-center font-mono transition-colors duration-200
                        ${isHovered ? 'text-[#ffd27a] drop-shadow-[0_0_10px_rgba(255,210,122,0.4)]' : 'text-[#f5a623]/90'}
                      `}
                    >
                      {skill.name}
                    </span>

                    {/* Sub-label on Hover */}
                    <div className="h-3 flex items-center justify-center">
                      {isHovered ? (
                        <span className="text-[8px] font-mono font-bold tracking-widest text-[#ffd27a] animate-pulse">
                          ▶ COLLECTED
                        </span>
                      ) : (
                        <span className="text-[7px] font-mono text-[#f5a623]/40 tracking-wider">
                          {skill.category || 'SKILL'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Corner Gaming Accents */}
                  <div className="absolute top-1.5 right-1.5 text-[6px] text-[#f5a623]/30">✦</div>
                  <div className="absolute bottom-1.5 left-1.5 text-[6px] text-[#f5a623]/30">✦</div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Interactive Modal for Selected Skill */}
      <AnimatePresence>
        {selectedSkill && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setSelectedSkill(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              className="relative w-full max-w-sm rounded-2xl border border-[#f5a623]/50 bg-gradient-to-b from-[#24170d] via-[#1a1008] to-[#0e0804] p-6 shadow-2xl shadow-[#f5a623]/20 text-[#fff0c7]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="absolute top-3 right-3 flex h-7 w-7 items-center justify-center rounded-full border border-[#f5a623]/40 bg-[#f5a623]/10 text-xs font-bold text-[#ffd27a] hover:bg-[#f5a623]/20"
              >
                ✕
              </button>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#f5a623]/40 bg-[#f5a623]/15 shadow-inner">
                  <img src={treasureChest} alt="" className="h-8 w-8 object-contain" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#f5a623]">
                    {selectedSkill.category}
                  </span>
                  <h4 className="text-xl font-bold text-[#ffd27a]">{selectedSkill.name}</h4>
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs ${i < selectedSkill.level ? 'text-[#f5a623]' : 'text-[#f5a623]/20'}`}
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-1 text-[10px] font-mono text-[#ffd27a]/80">
                      Level {selectedSkill.level}/5
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-[#f5a623]/20 bg-[#0d0805]/60 p-3 text-xs leading-relaxed text-[#fff0c7]/90">
                <p>
                  <strong className="text-[#ffd27a]">Mastered & Applied:</strong> Part of Alisha's core engineering toolkit for building high-performance, production web apps.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSkill(null)}
                className="mt-5 w-full rounded-xl border border-[#f5a623]/50 bg-gradient-to-r from-[#f5a623] to-[#ffd27a] py-2.5 text-xs font-bold uppercase tracking-wider text-[#0e0804] shadow-md shadow-[#f5a623]/20 transition hover:brightness-110"
              >
                Got It
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyframe Styles */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
        }
        .animate-shimmer {
          animation: shimmer 1.8s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}