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
      className="h-auto bg-gradient-to-b from-emerald-50 via-green-100 to-emerald-200 
                 flex justify-center items-center px-4 py-12 md:py-20 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="z-20 flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl w-full">
        {/* Image */}
        <motion.div
          className="flex-1 w-full md:w-auto cursor-pointer"
          variants={imageVariants}
          whileHover={{ scale: 1.05, rotate: 2 }}
        >
          <img
            className="w-full rounded-2xl object-cover"
            src={assets.img12}
            alt="Blue Carbon"
          />
        </motion.div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Left Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-emerald-300 
                       px-6 md:px-10 py-6 rounded-2xl shadow-lg hover:shadow-2xl
                       transition duration-300"
            variants={textVariantsLeft}
            whileHover={{ scale: 1.02, rotate: -1 }}
          >
            <p className="text-2xl md:text-3xl font-bold mb-3 text-emerald-700">
              WHAT IS <span className="italic text-green-900">BLUE CARBON</span>
              ?
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Blue Carbon refers to the carbon captured and stored by coastal
              ecosystems like mangroves, seagrasses, and salt marshes. These
              habitats act as natural climate solutions by locking carbon in
              plants and sediments for centuries, while also protecting coasts
              and supporting marine life.
            </p>
          </motion.div>

          {/* Right Card */}
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-emerald-300 
                       px-6 md:px-10 py-6 rounded-2xl shadow-lg hover:shadow-2xl
                       transition duration-300"
            variants={textVariantsRight}
            whileHover={{ scale: 1.02, rotate: 1 }}
          >
            <p className="text-2xl md:text-3xl font-bold mb-3 text-emerald-700">
              WHAT IS <span className="italic text-green-900">OUR MISSION</span>
              ?
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
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
