import React from "react";
import { motion } from "framer-motion";
import { assets } from "../assets/assets";

const textVariant = (delay = 0) => ({
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay, duration: 0.8, ease: "easeOut" },
  },
});

const buttonVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  hover: {
    scale: 1.05,
    y: -2,
    boxShadow: "0px 10px 20px rgba(0,0,0,0.2)",
  },
  tap: { scale: 0.95, y: 0 },
};

const Header = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden z-10">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src={assets.vid2} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/90"></div>

      {/* Branding */}
      <motion.div
        className="absolute top-6 inset-x-0 mx-auto text-center w-full max-w-lg px-4 md:max-w-none md:px-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-4xl text-p1 font-bold italic tracking-wide drop-shadow-lg playfont">
          BlueGreen
        </h2>
        <p className="text-p1 text-sm md:text-base italic playfont">
          Restoring Nature with Blockchain Transparency
        </p>
      </motion.div>

      {/* Hero Text */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center h-full px-6 md:px-20 text-white max-w-4xl mx-auto">
        <motion.p
          className="text-2xl md:text-6xl playfont italic text-p1 mb-6 leading-snug drop-shadow-lg"
          variants={textVariant(0.2)}
          initial="hidden"
          animate="visible"
        >
          “Proof for Every Tree. Trust for Every Step.”
        </motion.p>
        <motion.p
          className="text-sm italic md:text-lg poppins text-[#BBE2EC] leading-relaxed mb-10"
          variants={textVariant(0.4)}
          initial="hidden"
          animate="visible"
        >
          BlueGreen is a blockchain-powered platform ensuring transparent
          monitoring of tree plantations and carbon reduction. With trust,
          accountability, and innovation, we build a greener, more sustainable
          future.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-5"
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.2 }}
        >
          <motion.button
            className="relative px-8 py-3 rounded-2xl border border-p1 font-semibold text-p2 overflow-hidden group shadow-lg"
            variants={buttonVariant}
            whileHover="hover"
            whileTap="tap"
          >
            <span className="relative z-10 group-hover:text-p2">
              Upload Contribution
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-p1 to-[#c9da70] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="absolute inset-0 rounded-2xl shadow-[0_0_25px_rgba(223,243,145,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </motion.button>

          <motion.button
            className="relative px-8 py-3 rounded-2xl font-semibold text-p1 border border-p2 overflow-hidden group shadow-lg"
            variants={buttonVariant}
            whileHover="hover"
            whileTap="tap"
          >
            <span className="relative z-10 group-hover:text-white">
              View Dashboard
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-p2 to-[#003c32] transform translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out"></span>
            <span className="absolute inset-0 rounded-2xl shadow-[0_0_25px_rgba(0,91,76,0.6)] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default Header;
