import React, { useEffect, useState, useRef } from "react";
import { NavLink } from "react-router-dom";
import { motion, useAnimation } from "framer-motion";
import {
  Menu,
  X,
  Leaf,
  Users,
  LayoutDashboard,
  Home,
  User as UserIcon,
  Mail,
  Wallet,
  MapPin,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const profileRef = useRef(null);

  const controls = useAnimation();
  const { token, axios } = useAppContext();

  // ✅ Scroll animation inside useEffect
  useEffect(() => {
    const handleScroll = () => {
      if (document.body.scrollHeight <= window.innerHeight) {
        controls.start({ opacity: 1, y: 0 });
        return;
      }
      if (window.scrollY > 100) {
        controls.start({ opacity: 1, y: 0 });
      } else {
        controls.start({ opacity: 0, y: -50 });
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // initial check on mount

    return () => window.removeEventListener("scroll", handleScroll);
  }, [controls]);

  // Fetch user profile if logged in
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) return;
      try {
        const res = await axios.get("/api/user/profile", {
          headers: { token },
        });
        if (res.data.success) setUser(res.data.user);
      } catch (err) {
        console.error("❌ Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  // Close profile card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileOpen]);

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
      <div
        className="max-w-6xl mx-4 md:mx-auto flex items-center justify-between px-6 py-3 mt-4
        border border-green-300/20 rounded-2xl
        bg-gradient-to-r from-green-900/90 to-emerald-900/90
        text-green-50 backdrop-blur-xl shadow-lg shadow-green-900/40"
      >
        {/* Logo */}
        <div className="flex items-center gap-2 cursor-pointer">
          <Leaf className="text-emerald-300 drop-shadow-lg" size={22} />
          <span className="italic font-extrabold text-xl md:text-2xl tracking-wide text-green-100 drop-shadow">
            BlueCarbon
          </span>
        </div>

        {/* Desktop Links */}
        <ul className="hidden md:flex gap-8 font-medium items-center">
          {navLinks.map((link, i) => (
            <li key={i} className="flex items-center">
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  `relative flex items-center gap-2 px-2 transition duration-300 group ${
                    isActive
                      ? "text-emerald-300 font-semibold"
                      : "hover:text-emerald-200"
                  }`
                }
              >
                {link.icon}
                {link.name}
                <span
                  className="absolute bottom-[-6px] left-0 w-0 h-[2px] bg-emerald-400 
                  transition-all duration-300 group-hover:w-full"
                ></span>
              </NavLink>
            </li>
          ))}

          {/* User Profile Dropdown (Desktop) */}
          {token && user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-full bg-emerald-700 flex items-center justify-center hover:ring-2 hover:ring-emerald-400 transition"
              >
                <UserIcon className="text-white w-6 h-6" />
              </button>

              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 mt-3 w-64 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 p-4 z-50"
                >
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-green-600" /> Profile
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <UserIcon size={16} className="text-green-600" />{" "}
                      <span>{user.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-green-600" />{" "}
                      <span>{user.email}</span>
                    </p>
                    <p className="flex items-center gap-2 break-all">
                      <Wallet size={16} className="text-green-600" />{" "}
                      <span>{user.walletAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />{" "}
                      <span>{user.ngoLocation}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </ul>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-3">
          {token && user && (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-9 h-9 rounded-full bg-emerald-700 flex items-center justify-center hover:ring-2 hover:ring-emerald-400 transition"
              >
                <UserIcon className="text-white w-5 h-5" />
              </button>

              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute right-0 mt-2 w-60 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 p-4 z-50"
                >
                  <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-green-600" /> Profile
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p className="flex items-center gap-2">
                      <UserIcon size={16} className="text-green-600" />{" "}
                      <span>{user.name}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Mail size={16} className="text-green-600" />{" "}
                      <span>{user.email}</span>
                    </p>
                    <p className="flex items-center gap-2 break-all">
                      <Wallet size={16} className="text-green-600" />{" "}
                      <span>{user.walletAddress}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-green-600" />{" "}
                      <span>{user.ngoLocation}</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-green-100 focus:outline-none"
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
          className="md:hidden bg-gradient-to-br from-green-900/95 to-emerald-900/95 
          backdrop-blur-xl rounded-xl mx-4 mt-2 p-5 border border-green-300/20 shadow-xl shadow-green-900/40"
        >
          <ul className="flex flex-col gap-4 font-medium text-green-50">
            {navLinks.map((link, i) => (
              <li key={i}>
                <NavLink
                  to={link.path}
                  end
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-600/30 text-emerald-200 font-semibold"
                        : "hover:text-emerald-200 hover:bg-emerald-700/20"
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
