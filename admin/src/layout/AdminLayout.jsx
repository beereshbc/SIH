import React from "react";
import Sidebar from "../components/Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen bg-gray-50 p-6">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
