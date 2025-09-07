import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(
    localStorage.getItem("token") ? localStorage.getItem("token") : ""
  );

  const navigate = useNavigate();

  const value = {
    axios,
    navigate,
    setToken,
    token,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
