import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  const navigate = useNavigate();
  const [dashData, setDashData] = useState(null); // use null for initial

  const dashboardData = async () => {
    try {
      const { data } = await axios.post(
        "/api/user/dashData",
        {},
        {
          headers: { token },
        }
      );
      console.log("Token used:", token);

      if (data.success) {
        // ✅ Save the full dashboardData object
        setDashData(data.dashboardData);
        console.log("Fetched dashboardData:", data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const value = {
    axios,
    navigate,
    setToken,
    token,
    dashData,
    dashboardData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
