import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const controls = useAnimation();
  const { token } = useAppContext(); // ✅ read token from context

  // Scroll animation
  const handleScroll = () => {
    if (window.scrollY > window.innerHeight / 4) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      if (document.body.scrollHeight > window.innerHeight + 50) {
        controls.start({ opacity: 0, y: -50 });
      } else {
        controls.start({ opacity: 1, y: 0 });
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Links based on auth
  const navLinks = token
    ? [
        { name: "Home", path: "/" },
        { name: "Registry", path: "/registry" },
        { name: "Dashboard", path: "/dashboard" },
        { name: "Community", path: "/community" },
      ]
    : [
        { name: "Home", path: "/" },
        { name: "Sign In", path: "/login" },
      ];

  return (
    <motion.nav
      animate={controls}
      initial={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="max-w-6xl mx-4 md:mx-auto flex items-center justify-between px-6 py-3 rounded-2xl shadow-lg mt-4 border border-gray-600 bg-[#004D40]/90 text-white backdrop-blur-md">
        {/* Logo */}
        <div className="italic font-extrabold text-xl md:text-2xl tracking-wide playfont cursor-pointer">
          BlueGreen
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 font-medium">
          {navLinks.map((link, i) => (
            <li key={i}>
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `relative px-1 transition duration-300 ${
                    isActive
                      ? "font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[3px] after:rounded-full after:bg-green-300 after:shadow-[0_0_12px_rgba(123,239,178,0.8)]"
                      : "hover:text-green-300"
                  }`
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-[#004D40]/95 backdrop-blur-xl rounded-xl mx-4 mt-2 p-5 shadow-xl absolute left-0 right-0 z-40"
        >
          <ul className="flex flex-col gap-4 font-medium text-white">
            {navLinks.map((link, i) => (
              <li key={i}>
                <NavLink
                  to={link.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-600/30 text-green-200 font-semibold"
                        : "hover:text-green-300"
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
