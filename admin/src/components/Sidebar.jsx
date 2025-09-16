import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Coins,
  Receipt,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Verification", path: "/verification", icon: ShieldCheck },
    { name: "Users", path: "/users", icon: Users },
    { name: "Credits", path: "/credits", icon: Coins },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Add Admin", path: "/add-admin", icon: Users },
  ];

  const linkVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="flex">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 border border-green-300 rounded-lg bg-white shadow-lg text-green-700 hover:bg-green-50 transition"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 min-h-screen flex-col bg-white border-r border-green-200 shadow-lg">
        <div className="text-2xl font-extrabold p-6 text-green-800 border-b border-green-200">
          🌱 BlueCarbon Admin
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-3">
          {links.map(({ name, path, icon: Icon }, i) => (
            <motion.div
              key={name}
              initial="hidden"
              animate="visible"
              variants={linkVariants}
              transition={{ delay: i * 0.05 }}
            >
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-green-900 hover:bg-green-100 hover:text-green-800 ${
                    isActive ? "bg-green-200 shadow-inner font-semibold" : ""
                  }`
                }
              >
                <Icon size={18} />
                {name}
              </NavLink>
            </motion.div>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-64 h-full bg-white border-r border-green-200 shadow-lg z-50 flex flex-col"
          >
            <div className="text-2xl font-extrabold p-6 text-green-800 border-b border-green-200">
              🌱 BlueCarbon Admin
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-3">
              {links.map(({ name, path, icon: Icon }, i) => (
                <motion.div
                  key={name}
                  initial="hidden"
                  animate="visible"
                  variants={linkVariants}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-green-900 hover:bg-green-100 hover:text-green-800 ${
                        isActive
                          ? "bg-green-200 shadow-inner font-semibold"
                          : ""
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <Icon size={18} />
                    {name}
                  </NavLink>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
