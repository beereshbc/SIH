import React from "react";
import { motion } from "framer-motion";

const sectionVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.2, duration: 0.6, ease: "easeOut" },
  }),
};

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      className="bg-black text-white py-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-10">
        {/* Left Section */}
        <motion.div custom={0} variants={sectionVariant} className="flex-1">
          <h2 className="text-2xl font-bold mb-2 italic">SIH25038</h2>
          <p className="text-gray-300">
            Connecting you to reliable services seamlessly.
          </p>
        </motion.div>

        {/* Center Section */}
        <motion.div custom={1} variants={sectionVariant} className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Contact</h3>
          <motion.p
            whileHover={{ scale: 1.05, color: "#40A2E3" }}
            className="cursor-pointer"
          >
            Email: support@sih.com
          </motion.p>
          <motion.p
            whileHover={{ scale: 1.05, color: "#40A2E3" }}
            className="cursor-pointer"
          >
            Phone: +91 12345 67890
          </motion.p>
          <motion.p
            whileHover={{ scale: 1.05, color: "#40A2E3" }}
            className="cursor-pointer"
          >
            Address: Bengaluru, Karnataka, India
          </motion.p>
        </motion.div>

        {/* Right Section */}
        <motion.div custom={2} variants={sectionVariant} className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Follow Us</h3>
          <motion.p
            whileHover={{ scale: 1.05, color: "#40A2E3" }}
            className="cursor-pointer"
          >
            Facebook | Twitter | Instagram | LinkedIn
          </motion.p>
        </motion.div>
      </div>

      {/* Bottom Copyright */}
      <motion.div
        custom={3}
        variants={sectionVariant}
        className="mt-10 border-t border-gray-800 pt-4 text-center text-gray-400 text-sm"
      >
        © {year} SIH25038. All rights reserved.
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
