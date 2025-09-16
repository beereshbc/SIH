import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

// Container stagger for children
const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.3,
    },
  },
};

// Cards animations with tilt & spring
const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
  hover: {
    rotateY: 5,
    rotateX: 3,
    scale: 1.05,
    transition: { type: "spring", stiffness: 200 },
  },
};

// Image animations with parallax on hover
const imageVariants = {
  hidden: { opacity: 0, rotate: -15, scale: 0.9 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: { duration: 1, ease: "easeOut" },
  },
  hover: {
    scale: 1.08,
    rotate: 2,
    transition: { type: "spring", stiffness: 200 },
  },
};

// Text word animation
const wordAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: "easeOut" },
  }),
};

const splitText = (text) =>
  text.split(" ").map((word, index) => (
    <motion.span
      key={index}
      custom={index}
      variants={wordAnimation}
      className="inline-block mr-1"
    >
      {word}
    </motion.span>
  ));

const Hero2 = () => {
  return (
    <motion.div
      className="h-auto bg-gradient-to-b from-emerald-200 via- to-emerald-50 
                 flex justify-center items-center px-4 py-12 md:py-20 overflow-x-hidden"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="z-20 flex flex-col-reverse md:flex-row items-center gap-10 max-w-6xl w-full">
        {/* Text Content */}
        <div className="flex-1 flex flex-col gap-8">
          <motion.div
            className="bg-white/80 backdrop-blur-md border border-emerald-300 
                       px-6 md:px-8 py-6 rounded-2xl shadow-lg hover:shadow-2xl 
                       cursor-pointer transition duration-300"
            variants={cardVariants}
            whileHover="hover"
          >
            <p className="text-2xl md:text-3xl font-bold mb-3 text-emerald-700">
              {splitText("Understanding GHG Scopes")}
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Scope 1 (Direct) emissions come from company facilities and
              vehicles. Scope 2 (Indirect) includes purchased electricity,
              steam, heating & cooling for own use. Scope 3 (Indirect) covers
              upstream and downstream activities like transportation,
              distribution, and investments.
            </p>
          </motion.div>

          <motion.div
            className="bg-white/80 backdrop-blur-md border border-emerald-300 
                       px-6 md:px-8 py-6 rounded-2xl shadow-lg hover:shadow-2xl 
                       cursor-pointer transition duration-300"
            variants={cardVariants}
            whileHover="hover"
          >
            <p className="text-2xl md:text-3xl font-bold mb-3 text-emerald-700">
              {splitText("Upstream & Downstream Activities")}
            </p>
            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
              Upstream activities include purchased goods, fuel, transportation,
              and waste. Downstream activities include product use, end-of-life
              treatment, and investments. Proper measurement ensures
              transparency and helps companies reduce carbon footprints
              effectively.
            </p>
          </motion.div>
        </div>

        {/* Image */}
        <motion.div
          className="flex-1 w-full md:w-auto cursor-pointer"
          variants={imageVariants}
          whileHover="hover"
        >
          <img
            className="w-full rounded-2xl  object-cover"
            src={assets.img13}
            alt="GHG Scope Illustration"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Hero2;
