import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false); // mobile menu state
  const controls = useAnimation();

  const handleScroll = () => {
    if (window.scrollY > window.innerHeight / 4) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      // If page is tall, hide until scrolled
      if (document.body.scrollHeight > window.innerHeight + 50) {
        controls.start({ opacity: 0, y: -50 });
      } else {
        // If page is short, always show
        controls.start({ opacity: 1, y: 0 });
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check (important for short pages)
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Registry", path: "/registry" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Community", path: "/community" },
    { name: "SignUp", path: "/login" },
  ];

  return (
    <motion.nav
      animate={controls}
      initial={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50"
    >
      <div className="max-w-3xl mx-10 md:mx-auto flex items-center justify-between px-6 py-2 rounded-xl shadow-lg mt-4 border border-gray-500 bg-[#005B4C] text-p1 backdrop-blur-md">
        {/* Logo */}
        <div className="italic font-bold text-xl md:text-2xl playfont">
          BlueGreen
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 poppins font-medium">
          {navLinks.map((link, i) => (
            <li key={i}>
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `relative px-1 transition duration-300 ${
                    isActive
                      ? "font-semibold after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-[3px] after:rounded-full after:bg-white after:shadow-[0_0_12px_rgba(223,243,145,0.8)]"
                      : "hover:text-white"
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
            className="text-p1 focus:outline-none"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-black backdrop-blur-md rounded-xl mx-4 mt-2 p-4 shadow-lg absolute left-0 right-0 z-40"
        >
          <ul className="flex flex-col gap-4 poppins font-medium text-white">
            {navLinks.map((link, i) => (
              <li key={i}>
                <NavLink
                  to={link.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-2 py-2 rounded-lg transition-colors ${
                      isActive ? "text-p1 font-semibold" : "hover:text-p1"
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
