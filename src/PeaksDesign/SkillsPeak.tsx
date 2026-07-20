import treasureChest from "../assets/icons/treasure.png";
import type { Skill } from "../data/portfolioPeaks";

interface Props {
  skills: Skill[];
}

export function SkillsPeak({ skills }: Props) {
  return (
    <div className="flex flex-col items-center ">
      <h2 className="mb-2 font-display text-5xl font-bold text-[#fff0c7]">
        Skills Peak
      </h2>

      <p className="mb-12 uppercase tracking-[0.3em] text-[#ffbd53]">
        Hidden Treasure Camp
      </p>

      <div className="grid grid-cols-3 gap-10">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="group flex flex-col items-center cursor-pointer"
          >
            <img
              src={treasureChest}
              className="w-20 transition duration-300 group-hover:scale-110"
              alt={skill.name}
            />

            <span className="mt-3 text-sm font-semibold text-[#fff8ee]">
              {skill.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}