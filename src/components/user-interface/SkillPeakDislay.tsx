import { motion, type Variants, type MotionProps } from 'framer-motion'

import CliffImg from "../../assets/my_assets/cliffImg.png"
import Coins1 from "../../assets/my_assets/coins_1.png"
import Coins3 from "../../assets/my_assets/coins_3.png"
import snakeAsset from "../../assets/my_assets/snake_asset.png"
import potionBottle from "../../assets/my_assets/potionBottle.png"
import tresureBox from "../../assets/my_assets/tresure_box.png"
import Cliff2Img from "../../assets/my_assets/cliff3Img.png"

// Stage 2: Cliffs slide in from below (staggered starting at t=0.35s)
const cliffVariants: Variants = {
    hidden: { opacity: 0, y: 110, scale: 1.04 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.85,
            delay: 0.35 + 0.07 * i,
            ease: [0.16, 1, 0.3, 1] as const,
        },
    }),
}

// Stage 3: Coins fall/settle in starting at t=0.95s, then float forever
const coinFloat = (delay = 0, distance = 10, duration = 3.2): MotionProps => ({
    initial: { opacity: 0, y: -40, rotate: 0 },
    animate: {
        opacity: 1,
        y: [0, -distance, 0],
        transition: {
            opacity: { duration: 0.7, delay: 0.95 + delay },
            y: {
                duration,
                delay: 0.95 + delay + 0.7,
                repeat: Infinity,
                ease: "easeInOut" as const,
            },
        },
    },
})

export const SkillPeakDislay = () => {
    return (
        <div>
            <div>
                {/* ---------------------------- CLIFFS (STAGE 2) - SWAPPED TO RIGHT SIDE ---------------------------- */}

                <motion.img
                    src={CliffImg}
                    alt=""
                    draggable={false}
                    custom={0}
                    initial="hidden"
                    animate="visible"
                    variants={cliffVariants}
                    className="
              pointer-events-none
              fixed
              -right-20
              -bottom-24
              w-[800px]
              lg:w-[600px]
              xl:w-[600px]
              select-none
              -rotate-12
              z-[5]
            "
                />

                <motion.img
                    src={CliffImg}
                    alt=""
                    draggable={false}
                    custom={1}
                    initial="hidden"
                    animate="visible"
                    variants={cliffVariants}
                    className="
              pointer-events-none
              fixed
              -right-20
              -bottom-16
              w-[800px]
              lg:w-[600px]
              xl:w-[600px]
              select-none
              z-[5]
            "
                />

                <motion.img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    custom={2}
                    initial="hidden"
                    animate="visible"
                    variants={cliffVariants}
                    className="
              pointer-events-none
              fixed
              -right-14
              -bottom-20
              w-[800px]
              lg:w-[600px]
              -rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />

                <motion.img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    custom={3}
                    initial="hidden"
                    animate="visible"
                    variants={cliffVariants}
                    className="
              pointer-events-none
              fixed
              right-8
              -bottom-28
              w-[800px]
              lg:w-[600px]
              -rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />

                <motion.img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    custom={4}
                    initial="hidden"
                    animate="visible"
                    variants={cliffVariants}
                    className="
              pointer-events-none
              fixed
              right-40
              -bottom-48
              w-[800px]
              lg:w-[600px]
              -rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />

                {/* ---------------------------- TREASURE & ITEMS (STAGE 3) - SWAPPED TO LEFT SIDE ---------------------------- */}

                {/* Treasure box: pop in + bounce at t=0.90s, then idle sway */}
                <motion.img
                    src={tresureBox}
                    alt=""
                    draggable={false}
                    initial={{ opacity: 0, y: 70, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        y: [0, -6, 0],
                        scale: 1,
                        rotate: [0, 1.5, 0, -1.5, 0],
                    }}
                    transition={{
                        opacity: { duration: 0.6, delay: 0.9 },
                        scale: { duration: 0.6, delay: 0.9, ease: "backOut" as const },
                        y: { duration: 3.5, delay: 1.5, repeat: Infinity, ease: "easeInOut" as const },
                        rotate: { duration: 6, delay: 1.5, repeat: Infinity, ease: "easeInOut" as const },
                    }}
                    className="
              pointer-events-none
              fixed
              left-10
              -bottom-10
              w-[300px]
              lg:w-[400px]
              xl:w-[300px]
              select-none
              z-[5]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.05, 8, 3)}
                    className="
              pointer-events-none
              fixed
              left-0
              -bottom-3
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              -rotate-12
              select-none
              z-[1]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.15, 10, 3.4)}
                    className="
              pointer-events-none
              fixed
              left-28
              bottom-8
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              select-none
              -rotate-12
              z-[1]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.25, 6, 2.6)}
                    className="
              pointer-events-none
              fixed
              left-32
               -bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[4]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.1, 7, 3.1)}
                    className="
              pointer-events-none
              fixed
              left-0
               -bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[6]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.3, 9, 3.6)}
                    className="
              pointer-events-none
              fixed
              left-32
              bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[1]
            "
                />

                {/* -------------------------------------------------------------------Coins3 */}

                {/* Potion: fade/scale in at t=1.05s */}
                <motion.img
                    src={potionBottle}
                    alt=""
                    draggable={false}
                    initial={{ opacity: 0, scale: 0.6, y: 20 }}
                    animate={{
                        opacity: 1,
                        scale: [1, 1.08, 1],
                        y: [0, -5, 0],
                    }}
                    transition={{
                        opacity: { duration: 0.6, delay: 1.05 },
                        scale: { duration: 2.4, delay: 1.65, repeat: Infinity, ease: "easeInOut" as const },
                        y: { duration: 2.4, delay: 1.65, repeat: Infinity, ease: "easeInOut" as const },
                    }}
                    className="
              pointer-events-none
              fixed
              left-80
              bottom-10
              w-[50px]
              lg:w-[60px]
              xl:w-[80px]
              select-none
              z-[5]
            "
                />

                <motion.img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.2, 8, 3.2)}
                    className="
              pointer-events-none
              fixed
              left-60
              -bottom-20
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              -rotate-12
              select-none
              z-[1]
            "
                />

                <motion.img
                    src={Coins3}
                    alt=""
                    draggable={false}
                    {...coinFloat(0.35, 7, 2.9)}
                    className="
              pointer-events-none
              fixed
              left-60
              bottom-20
              w-[250px]
              lg:w-[250px]
              xl:w-[150px]
              -rotate-12
              select-none
              z-[1]
            "
                />

                {/* Snake: slithers in at t=1.10s */}
                <motion.img
                    src={snakeAsset}
                    alt=""
                    draggable={false}
                    initial={{ opacity: 0, x: 40 }}
                    animate={{
                        opacity: 1,
                        x: [0, -6, 0, 6, 0],
                        rotate: [0, -2, 0, 2, 0],
                    }}
                    transition={{
                        opacity: { duration: 0.7, delay: 1.1 },
                        x: { duration: 4, delay: 1.8, repeat: Infinity, ease: "easeInOut" as const },
                        rotate: { duration: 4, delay: 1.8, repeat: Infinity, ease: "easeInOut" as const },
                    }}
                    className="
              pointer-events-none
              fixed
              left-0
              bottom-0
              w-[250px]
              lg:w-[250px]
              xl:w-[150px]
            scale-100         
              select-none
              z-[5]
            "
                />

                {/* ------------------------------------------------------------------- */}
            </div>
        </div>
    )
}