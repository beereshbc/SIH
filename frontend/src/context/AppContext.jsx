import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔄 Keep localStorage in sync with token
  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);
  const logout = () => {
    setToken("");
    localStorage.removeItem("token");
    navigate("/login"); // redirect back to login page
  };

  // inside AppContext
  const getImageTransactions = async (imageId) => {
    if (!token) return [];
    try {
      const { data } = await axios.post(
        "/api/user/imageTx",
        { imageId },
        { headers: { token } }
      );
      if (data.success) return data.transactions || [];
      return [];
    } catch (err) {
      console.error("Image transactions fetch error:", err);
      return [];
    }
  };

  const dashboardData = async () => {
    if (!token) {
      toast.error("No authentication token found. Please log in.");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/user/dashData",
        {},
        { headers: { token } }
      );

      console.log("📊 Dashboard API response:", data);

      if (data.success) {
        setDashData(data.dashboardData || {});
      } else {
        toast.error(data.message || "Failed to load dashboard data");
      }
    } catch (error) {
      console.error("Dashboard fetch error:", error);
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    axios,
    navigate,
    token,
    setToken,
    dashData,
    dashboardData,
    logout,
    loading,
    getImageTransactions,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
