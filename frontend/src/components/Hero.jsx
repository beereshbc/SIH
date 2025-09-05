import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  hover: { scale: 1.03, y: -5, transition: { duration: 0.3, ease: "easeOut" } },
};

const imageVariants = {
  hidden: { opacity: 0, rotate: -20, scale: 0.8 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

const textVariantsLeft = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const textVariantsRight = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const Hero = () => {
  return (
    <motion.div
      className="h-auto bg-p1 flex justify-center items-center px-4 py-10 md:py-16 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="z-20 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-10 max-w-6xl w-full">
        {/* Image */}
        <motion.div
          className="flex-1 w-full md:w-auto cursor-pointer"
          variants={imageVariants}
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          <img
            className="w-full rounded-xl object-cover  duration-500"
            src={assets.img12}
            alt="Blue Carbon"
          />
        </motion.div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Left Card */}
          <motion.div
            className="border border-p2 px-6 md:px-10 py-4 rounded-sm shadow-lg "
            variants={textVariantsLeft}
            whileHover={{ scale: 1.02, rotate: -1 }}
          >
            <p className="text-xl md:text-3xl font-bold mb-2 text-p2">
              WHAT IS <span className="playfont italic">BLUE CARBON</span> ?
            </p>
            <p className="text-black text-sm md:text-base leading-relaxed">
              Blue Carbon refers to the carbon captured and stored by coastal
              ecosystems like mangroves, seagrasses, and salt marshes. These
              habitats act as natural climate solutions by locking carbon in
              plants and sediments for centuries, while also protecting coasts
              and supporting marine life.
            </p>
          </motion.div>

          {/* Right Card */}
          <motion.div
            className="border border-p2 px-6 md:px-10 py-4 rounded-sm shadow-lg"
            variants={textVariantsRight}
            whileHover={{ scale: 1.02, rotate: 1 }}
          >
            <p className="text-xl md:text-3xl font-bold mb-2 text-p2">
              WHAT IS <span className="playfont italic">OUR MISSION</span> ?
            </p>
            <p className="text-black text-sm md:text-base leading-relaxed">
              To restore and protect blue carbon ecosystems — mangroves,
              seagrasses, and salt marshes — using blockchain transparency. We
              aim to ensure verifiable carbon storage, empower communities, and
              build a sustainable future where nature and people thrive
              together.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Hero;
