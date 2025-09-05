import React from "react";
import { motion } from "framer-motion";
import { ngos } from "../assets/assets"; // ensure images are exported

// Parent container variant for staggered children
const wrapperVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2, // delay between cards
    },
  },
};

// Card variant for animation
const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 },
  },
};

const hoverEffect = {
  scale: 1.05,
  rotate: 1, // subtle rotation on hover
  transition: { type: "spring", stiffness: 300 },
};

const Testimonials = () => {
  return (
    <motion.div
      className="testimonials-wrapper"
      variants={wrapperVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {ngos.map((ngo, index) => (
        <motion.div
          className="container"
          key={index}
          variants={cardVariants}
          whileHover={hoverEffect}
        >
          <div className="content">
            <motion.img
              src={ngo.image}
              alt={ngo.name}
              className="mb-4"
              initial={{ scale: 0.95 }}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 250 }}
            />
            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {ngo.name}
            </motion.h2>
            <motion.p
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <strong>Location:</strong> {ngo.location}
              <br />
              {ngo.description}
            </motion.p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default Testimonials;
