import React from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import { useAppContext } from "./context/AppContext";
import AdminLayout from "./layout/AdminLayout";

import Dashboard from "./pages/Dashboard";
import Verification from "./pages/Verification";
import Users from "./pages/Users";
import Credits from "./pages/Credits";
import Transactions from "./pages/Transactions";
import toast, { Toaster } from "react-hot-toast";

const App = () => {
  const { atoken } = useAppContext();

  if (!atoken) return <Login />; // Redirect to login if no token

  return (
    <>
      <Toaster />
      <AdminLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/verification" element={<Verification />} />
          <Route path="/users" element={<Users />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="/transactions" element={<Transactions />} />
        </Routes>
      </AdminLayout>
    </>
  );
};

export default App;
