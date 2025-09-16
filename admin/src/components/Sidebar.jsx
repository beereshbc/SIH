// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
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
  UserCircle,
  Copy,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { adminDetails, fetchAdminDetails } = useAppContext();

  useEffect(() => {
    fetchAdminDetails();
  }, []);

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

  // Sidebar UI (reused for both desktop + mobile)
  const SidebarContent = () => (
    <div className="w-64 h-full flex flex-col bg-white border-r border-green-200 shadow-lg">
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
              onClick={() => setIsOpen(false)} // close sidebar on mobile
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

      {/* Admin Profile */}
      {adminDetails && (
        <div className="p-4 border-t border-green-200">
          {/* Profile Toggle */}
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-green-50 transition"
          >
            <UserCircle size={28} className="text-green-700 shrink-0" />
            <div className="flex flex-col text-left overflow-hidden">
              <span className="font-semibold text-green-900 truncate">
                {adminDetails.name}
              </span>
              <span className="text-xs text-gray-600 truncate">
                {adminDetails.email}
              </span>
            </div>
          </button>

          {/* Profile Card */}
          <AnimatePresence>
            {showProfile && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 bg-green-50 rounded-lg p-4 text-sm text-gray-700 shadow-inner space-y-3"
              >
                {/* Role */}
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <strong>Role:</strong> <span>{adminDetails.role}</span>
                </p>

                {/* Blockchain Address */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <strong className="shrink-0">Blockchain:</strong>
                    <span className="ml-1 font-mono text-gray-800 truncate block max-w-[180px] sm:max-w-[280px]">
                      {adminDetails.blockchainAddress.slice(0, 6)}...
                      {adminDetails.blockchainAddress.slice(-4)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        adminDetails.blockchainAddress
                      );
                      toast.success("Wallet address copied!");
                    }}
                    className="p-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition flex items-center justify-center"
                    title="Copy address"
                  >
                    <Copy size={16} />
                  </button>
                </div>

                {/* Created At */}
                <p className="flex flex-col sm:flex-row sm:justify-between">
                  <strong>Created At:</strong>{" "}
                  <span>
                    {new Date(adminDetails.createdAt).toLocaleDateString()}
                  </span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 border border-green-300 rounded-lg bg-white shadow-lg text-green-700 hover:bg-green-50 transition"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed top-0 left-0 h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar (Slide-in) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-40 flex"
          >
            {/* Sidebar panel */}
            <div className="w-64 h-full bg-white shadow-lg">
              <SidebarContent />
            </div>

            {/* Overlay */}
            <div
              className="flex-1 bg-black bg-opacity-40"
              onClick={() => setIsOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
