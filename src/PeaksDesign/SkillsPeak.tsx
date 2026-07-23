import treasureChest from "../assets/icons/treasure.png";
import type { Skill } from "../data/portfolioPeaks";
import { useState } from "react";

interface Props {
  skills: Skill[];
}

export function SkillsPeak({ skills }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto ">
      {/* Skills Grid - Individual Cards with their own styling */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4 ">
        {skills.map((skill, index) => {
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={skill.name}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {/* Glow Effect */}
              {isHovered && (
                <div className="absolute -inset-2 rounded-xl bg-[#f5a623]/10 blur-xl animate-pulse" />
              )}

              {/* Individual Card - Same styling as before */}
              <div
                className={`
                  relative p-3 rounded-xl h-full min-h-[120px] sm:min-h-[130px]
                  flex flex-col items-center justify-center
                  transition-all duration-300 ease-out
                  bg-gradient-to-b from-[#1a1208] via-[#2a1a0a] to-[#0d0805]
                  border border-[#f5a623]/30
                  shadow-xl shadow-[#f5a623]/5
                  ${isHovered
                    ? 'scale-105 shadow-xl shadow-[#f5a623]/20 border-[#f5a623]/40'
                    : 'hover:shadow-lg hover:shadow-[#f5a623]/15 hover:border-[#f5a623]/30'
                  }
                `}
              >
                {/* Grid/Texture Background - Lighter */}
                <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxjaXJjbGUgY3g9IjEiIGN5PSIxIiByPSIxIiBmaWxsPSIjZjVhNjIzIiBvcGFjaXR5PSIwLjA0Ii8+PC9zdmc+')]" />
                </div>

                {/* Inner Glow */}
                <div className={`
                  absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300
                  bg-gradient-to-b from-[#f5a623]/5 to-transparent
                  ${isHovered ? 'opacity-100' : ''}
                `} />

                {/* Shimmer Effect */}
                {isHovered && (
                  <div className="absolute inset-0 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#f5a623]/10 to-transparent 
                                  animate-shimmer" />
                  </div>
                )}

                {/* Content */}
                <div className="relative flex flex-col items-center justify-center gap-1.5">
                  {/* Icon */}
                  <div className={`
                    relative w-12 h-12 rounded-lg
                    flex items-center justify-center
                    transition-all duration-500
                    bg-[#f5a623]/5
                    ${isHovered ? 'scale-110' : 'group-hover:scale-105'}
                  `}>
                    <img
                      src={treasureChest}
                      className={`
                        w-7 h-7 object-contain
                        transition-all duration-500
                        ${isHovered
                          ? 'scale-110 rotate-[-6deg] drop-shadow-[0_0_20px_rgba(245,166,35,0.3)]'
                          : 'drop-shadow-[0_0_10px_rgba(245,166,35,0.05)]'
                        }
                      `}
                      alt={skill.name}
                    />

                    {/* Collectible Badge */}
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#f5a623] rounded-full flex items-center justify-center text-[7px] text-black font-bold shadow-md shadow-[#f5a623]/30">
                      ✓
                    </div>
                  </div>

                  {/* Skill Name */}
                  <span className={`
                    text-[10px] sm:text-xs font-medium text-center font-mono
                    transition-all duration-300
                    text-[#f5a623]/90
                    ${isHovered ? 'text-[#f5a623] drop-shadow-[0_0_15px_rgba(245,166,35,0.15)]' : ''}
                  `}>
                    {skill.name}
                  </span>

                  {/* Hover Text */}
                  {isHovered && (
                    <div className="absolute -bottom-5 text-[7px] font-mono text-[#f5a623]/30 tracking-wider animate-float">
                      ▶ COLLECTED
                    </div>
                  )}
                </div>

                {/* Corner Decorations */}
                <div className="absolute top-1.5 left-1.5 text-[5px] text-[#f5a623]/15"></div>
                <div className="absolute top-1.5 right-1.5 text-[5px] text-[#f5a623]/15">✦</div>
                <div className="absolute bottom-1.5 left-1.5 text-[5px] text-[#f5a623]/15">✦</div>
                <div className="absolute bottom-1.5 right-1.5 text-[5px] text-[#f5a623]/15">✦</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.8; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}