// src/components/user-interface/ExperiencePeakDisplay.tsx

import React from 'react';

interface ExperienceRole {
  company: string;
  duration: string;
  highlights: string[];
}

interface ExperiencePeakDisplayProps {
  roles: ExperienceRole[];
}

const ExperiencePeakDisplay: React.FC<ExperiencePeakDisplayProps> = ({ roles }) => {
  return (
    <div className="flex flex-col gap-8 w-full border-2">
      {roles.map((role, index) => (
        <div key={`${role.company}-${index}`} className="w-full">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xl font-bold text-[#ffd27a]">{role.company}</span>
            <span className="rounded-full border border-[rgba(255,210,122,0.4)] px-3 py-1 text-xs text-[#f6d4a0]">
              {role.duration}
            </span>
          </div>
          <ul className="flex list-none flex-col gap-3 p-0">
            {role.highlights.map((highlight, idx) => (
              <li key={idx} className="flex items-start gap-3 text-base leading-7 text-[#fff8ee] opacity-95">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffd27a]" />
                {highlight}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default ExperiencePeakDisplay;