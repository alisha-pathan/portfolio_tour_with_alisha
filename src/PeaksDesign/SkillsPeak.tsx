import treasureChest from "../assets/icons/treasure.png";
import type { Skill } from "../data/portfolioPeaks";

interface Props {
  skills: Skill[];
}

export function SkillsPeak({ skills }: Props) {
  return (
    <div className="flex flex-col items-center ">

      <div className="grid w-full grid-cols-3 gap-6 sm:gap-8">
        {skills.map((skill) => (
          <div
            key={skill.name}
            className="group flex flex-col items-center cursor-pointer"
          >
            <img
              src={treasureChest}
              className="w-16 transition duration-300 group-hover:scale-110"
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