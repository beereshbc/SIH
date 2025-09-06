import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Verification from "./pages/Verification";
import CarbonCredits from "./pages/CarbonCredits";
import Reports from "./pages/Reports";
import Blockchain from "./pages/Blockchain";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <div className="flex bg-gray-50 min-h-screen text-[13px]">
      <Sidebar onLogout={() => (window.location.href = "/login")} />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/users" element={<Users />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/credits" element={<CarbonCredits />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/blockchain" element={<Blockchain />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
}
