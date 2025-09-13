import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import { Menu, X, Leaf, Users, LayoutDashboard, Home } from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const controls = useAnimation();
  const { token } = useAppContext();

  // Scroll animation
  const handleScroll = () => {
    // Always visible if page content is smaller than window
    if (document.body.scrollHeight <= window.innerHeight) {
      controls.start({ opacity: 1, y: 0 });
      return;
    }

    // Fade in/out on scroll for larger pages
    if (window.scrollY > window.innerHeight / 4) {
      controls.start({ opacity: 1, y: 0 });
    } else {
      controls.start({ opacity: 0, y: -50 });
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Auth-based links
  const navLinks = token
    ? [
        { name: "Home", path: "/", icon: <Home size={18} /> },
        { name: "Registry", path: "/registry", icon: <Leaf size={18} /> },
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: <LayoutDashboard size={18} />,
        },
        { name: "Community", path: "/community", icon: <Users size={18} /> },
      ]
    : [
        { name: "Home", path: "/", icon: <Home size={18} /> },
        { name: "Sign In", path: "/login", icon: <Users size={18} /> },
      ];

  return (
    <motion.nav
      animate={controls}
      initial={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 w-full z-50"
    >
      {/* Navbar Container */}
      <div className="max-w-6xl mx-4 md:mx-auto flex items-center justify-between px-6 py-3 mt-4 border border-white rounded-xl bg-[#002b25]/80 text-white backdrop-blur-md">
        {/* Logo */}
        <div className="italic font-extrabold text-xl md:text-2xl tracking-wide cursor-pointer">
          BlueGreen
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 font-medium items-center">
          {navLinks.map((link, i) => (
            <li key={i} className="flex items-center gap-2">
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-2 transition duration-300 ${
                    isActive
                      ? "font-semibold text-green-300 border-b-2 border-green-300"
                      : "hover:text-green-300"
                  }`
                }
              >
                {link.icon}
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
          className="md:hidden bg-[#002b25]/95 backdrop-blur-xl rounded-xl mx-4 mt-2 p-5 border border-white"
        >
          <ul className="flex flex-col gap-4 font-medium text-white">
            {navLinks.map((link, i) => (
              <li key={i}>
                <NavLink
                  to={link.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green-600/30 text-green-200 font-semibold"
                        : "hover:text-green-300"
                    }`
                  }
                >
                  {link.icon}
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
