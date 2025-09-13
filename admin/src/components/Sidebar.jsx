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
  ];

  return (
    <div className="flex">
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 border border-gray-300 rounded-lg bg-white"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Sidebar for Desktop */}
      <div className="hidden md:flex w-64 min-h-screen border-r border-gray-200 bg-white text-gray-900 flex-col">
        <div className="text-xl font-bold p-6 border-b border-gray-200">
          BlueCarbon Admin
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          {links.map(({ name, path, icon: Icon }) => (
            <NavLink
              key={name}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2 rounded-lg border border-transparent hover:border-gray-300 transition-colors ${
                  isActive ? "bg-gray-100 font-semibold border-gray-300" : ""
                }`
              }
            >
              <Icon size={18} />
              {name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Mobile Sidebar with Animation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-64 h-full bg-white border-r border-gray-200 text-gray-900 z-40 flex flex-col"
          >
            <div className="text-xl font-bold p-6 border-b border-gray-200">
              BlueCarbon Admin
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-2">
              {links.map(({ name, path, icon: Icon }) => (
                <NavLink
                  key={name}
                  to={path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2 rounded-lg border border-transparent hover:border-gray-300 transition-colors ${
                      isActive
                        ? "bg-gray-100 font-semibold border-gray-300"
                        : ""
                    }`
                  }
                  onClick={() => setIsOpen(false)} // Close sidebar on click
                >
                  <Icon size={18} />
                  {name}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
