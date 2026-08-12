// src/components/user-interface/ExperiencePeakDisplay.tsx

import React from 'react';
import { motion } from 'framer-motion';
import circle_skull from '../../assets/my_assets/circle_skull.png';
import experince_banner from '../../assets/my_assets/experience_banner_svg.svg';

interface ExperienceRole {
    company: string;
    duration: string;
    highlights: string[];
}

interface ExperiencePeakDisplayProps {
    roles: ExperienceRole[];
}

function ExperiencePeakDisplay({ roles }: ExperiencePeakDisplayProps) {
    return (
        <div className="relative w-full -top-16">
            {/* Experience Banner Background - now contained with content */}
            <div className="relative flex items-center justify-center min-h-[700px] w-full">
                {/* Banner Image - with sharpening filters */}
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img
                        src={experince_banner}
                        alt=""
                        className="h-full w-[2000px] object-cover"
                        style={{
                            filter: 'contrast(1.05) brightness(1.02) saturate(1.05)',
                            imageRendering: 'auto'
                        }}
                        draggable={false}
                    />
                </div>



                {/* Animated Circle Skull Background */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <motion.div
                        className="relative h-[100px] w-[100px] md:h-[200px] md:w-[200px] opacity-20"
                        animate={{
                            scale: [1, 1.05, 1],
                        }}
                        transition={{
                            scale: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                    >
                        <motion.img
                            src={circle_skull}
                            alt=""
                            className="h-full w-full select-none object-contain opacity-60"
                            draggable={false}
                            style={{
                                transform: 'rotate(0deg)',
                            }}
                            animate={{
                                transform: 'rotate(-360deg)',
                            }}
                            transition={{
                                duration: 20,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                        />
                        <div className="absolute inset-0 rounded-full bg-[#ffd27a] opacity-15 blur-2xl" />
                    </motion.div>
                </div>

                {/* Content overlay - Now pushes banner height */}
                <div className="relative z-10 flex flex-col items-center justify-center gap-6 py-12 px-4 w-full max-w-[1000px]">
                    {roles.map((role, index) => (
                        <div key={`${role.company}-${index}`} className="max-w-[620px] w-full">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                <span className="text-md ml-3 font-bold text-[#332202] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                    {role.company}
                                </span>
                                <span className="rounded-full border border-[rgba(255,210,122,0.4)] px-2.5 py-0.5 text-[10px] text-[#694104] drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                    {role.duration}
                                </span>
                            </div>
                            <ul className="flex list-none flex-col gap-2 p-0">
                                {role.highlights.map((highlight, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-xs leading-6 text-[#4c2d03] opacity-95">
                                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#604001] drop-shadow-[0_0_4px_rgba(255,210,122,0.5)]" />
                                        <span className="text-justify text-xs leading-relaxed tracking-wide drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                                            {highlight}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ExperiencePeakDisplay;