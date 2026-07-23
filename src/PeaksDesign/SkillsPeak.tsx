import treasureChest from "../assets/icons/treasure.png";
import type { Skill } from "../data/portfolioPeaks";
import { useState } from "react";

interface Props {
  skills: Skill[];
}

export function SkillsPeak({ skills }: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-sm font-mono text-[#f5a623]/60 tracking-[0.2em] uppercase">
          Technical Stack
        </h3>
        <span className="text-xs text-[#fff8ee]/30 font-light tracking-wider">
          TAP TO EXPLORE
        </span>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 sm:gap-6">
        {skills.map((skill, index) => (
          <div
            key={skill.name}
            className="group relative flex flex-col items-center"
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Background glow on hover */}
            {hoveredIndex === index && (
              <div className="absolute -inset-3 bg-[#f5a623]/5 rounded-2xl blur-xl animate-pulse" />
            )}

            {/* Icon Container */}
            <div className={`
              relative w-16 h-16 sm:w-20 sm:h-20 
              rounded-2xl 
              flex items-center justify-center
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${hoveredIndex === index 
                ? 'bg-[#f5a623]/10 scale-110 shadow-lg shadow-[#f5a623]/10' 
                : 'bg-[#fff8ee]/5 hover:bg-[#fff8ee]/10'
              }
            `}>
              <img
                src={treasureChest}
                className={`
                  w-10 h-10 sm:w-12 sm:h-12 object-contain
                  transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
                  ${hoveredIndex === index 
                    ? 'scale-110 rotate-[-5deg] drop-shadow-[0_0_20px_rgba(245,166,35,0.2)]' 
                    : 'group-hover:scale-105'
                  }
                `}
                alt={skill.name}
              />

              {/* Shine effect on hover */}
              {hoveredIndex === index && (
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#f5a623]/5 to-transparent 
                                animate-[shimmer_1.5s_infinite]" />
                </div>
              )}
            </div>

            {/* Skill Name */}
            <span className={`
              mt-3 text-xs sm:text-sm font-medium text-center
              transition-all duration-300
              ${hoveredIndex === index 
                ? 'text-[#f5a623] scale-105' 
                : 'text-[#fff8ee]/70 group-hover:text-[#fff8ee]'
              }
            `}>
              {skill.name}
            </span>

            {/* Decorative dot under name */}
            <div className={`
              mt-1.5 w-4 h-0.5 rounded-full 
              transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]
              ${hoveredIndex === index 
                ? 'w-6 bg-[#f5a623]' 
                : 'bg-[#fff8ee]/10 group-hover:bg-[#fff8ee]/20'
              }
            `} />
          </div>
        ))}
      </div>

      {/* Bottom Decorative Line */}
      <div className="mt-12 flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#fff8ee]/10 to-transparent" />
        <span className="text-[10px] font-mono text-[#fff8ee]/20 tracking-[0.3em] uppercase">
          {skills.length} Skills
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#fff8ee]/10 to-transparent" />
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%) rotate(25deg); }
          100% { transform: translateX(200%) rotate(25deg); }
        }
      `}</style>
    </div>
  );
}