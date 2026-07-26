import React from 'react'

import CliffImg from "../../assets/my_assets/cliffImg.png"
import Coins1 from "../../assets/my_assets/coins_1.png"
import Coins3 from "../../assets/my_assets/coins_3.png"
import snakeAsset from "../../assets/my_assets/snake_asset.png"
import potionBottle from "../../assets/my_assets/potionBottle.png"
import tresureBox from "../../assets/my_assets/tresure_box.png"
import Cliff2Img from "../../assets/my_assets/cliff3Img.png"

export const SkillPeakDislay = () => {
    return (
        <div>

            <div>
                <img
                    src={CliffImg}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              -left-20
              -bottom-24
              w-[800px]
              lg:w-[600px]
              xl:w-[600px]
              select-none
              rotate-12
              z-[5]
            "
                />

                <img
                    src={CliffImg}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              -left-20
              -bottom-16
              w-[800px]
              lg:w-[600px]
              xl:w-[600px]
              select-none
              z-[5]
            "
                />

                <img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              -left-14
              -bottom-20
              w-[800px]
              lg:w-[600px]
              rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />

                <img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              left-8
              -bottom-28
              w-[800px]
              lg:w-[600px]
              rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />

                <img
                    src={Cliff2Img}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              left-40
              -bottom-48
              w-[800px]
              lg:w-[600px]
              rotate-12
              xl:w-[600px]
              select-none
              z-[4]
            "
                />
                {/* ------------------------------------------------------------------------------------ */}


                <img
                    src={tresureBox}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-10
              -bottom-10
              w-[300px]
              lg:w-[400px]
              xl:w-[300px]
              select-none
              z-[5]
            "
                />

                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-0
              -bottom-3
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              rotate-12
              select-none
              z-[1]
            "
                />

                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-28
              bottom-8
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              select-none
              rotate-12
              z-[1]
            "
                />


                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-32
               -bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[4]
            "
                />


                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-0
               -bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[6]
            "
                />

                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-32
              bottom-20
              w-[300px]
              lg:w-[300px]
              xl:w-[200px]
              select-none
              z-[1]
            "
                />


                {/* -------------------------------------------------------------------Coins3 */}

                <img
                    src={potionBottle}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-80
              bottom-10
              w-[50px]
              lg:w-[60px]
              xl:w-[80px]
              select-none
              z-[5]
            "
                />

                <img
                    src={Coins1}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-60
              -bottom-20
              w-[300px]
              lg:w-[460px]
              xl:w-[250px]
              rotate-12
              select-none
              z-[1]
            "
                />


                <img
                    src={Coins3}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-60
              bottom-20
              w-[250px]
              lg:w-[250px]
              xl:w-[150px]
              rotate-12
              select-none
              z-[1]
            "
                />

                <img
                    src={snakeAsset}
                    alt=""
                    draggable={false}
                    className="
              pointer-events-none
              fixed
              right-0
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
