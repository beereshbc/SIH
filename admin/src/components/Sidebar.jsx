import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Users,
  Menu,
  Zap,
  FileText,
  Database,
  Settings,
  LogOut,
} from "lucide-react";

export default function Sidebar({ onLogout }) {
  const items = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/users", label: "Users", icon: Users },
    { to: "/verification", label: "Verification", icon: Menu },
    { to: "/credits", label: "Carbon Credits", icon: Zap },
    { to: "/reports", label: "Reports", icon: FileText },
    { to: "/blockchain", label: "Blockchain", icon: Database },
    { to: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 text-sm text-gray-700 hidden md:block">
      <div className="p-4 border-b border-gray-100 flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-black/80 text-white flex items-center justify-center text-xs font-semibold">
          SIH
        </div>
        <div className="text-xs">
          <div className="font-semibold">SIH Admin</div>
          <div className="text-[11px] text-gray-500">Tree Verification</div>
        </div>
      </div>
      <nav className="p-3">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md border border-transparent hover:border-gray-200 mb-1 ${
                isActive ? "bg-black/5 font-semibold" : ""
              }`
            }
          >
            <it.icon className="w-4 h-4" />
            <span className="text-[13px]">{it.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 mt-auto">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 text-xs py-2 px-3 rounded-md border border-gray-100 hover:bg-gray-50"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}
