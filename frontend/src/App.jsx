import React from "react";
import { assets } from "./assets/assets";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Registry from "./pages/Registry";
import Dashboard from "./pages/Dashboard";
import Community from "./pages/Community";
import Login from "./pages/Login";
import toast, { Toaster } from "react-hot-toast";
import { useAppContext } from "./context/AppContext";

const App = () => {
  const { token } = useAppContext();
  return (
    <div>
      <Toaster />
      <Routes>
        <Route path="/" element={<Home />} />
        {token ? (
          <>
            <Route path="/registry" element={<Registry />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/community" element={<Community />} />
          </>
        ) : (
          <Route path="/login" element={<Login />} />
        )}
      </Routes>
    </div>
  );
};

export default App;
