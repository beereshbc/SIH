// src/context/AppContext.jsx
import { createContext, useContext, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AppContext = createContext();

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

export const AppProvider = ({ children }) => {
  const [atoken, setAtoken] = useState(localStorage.getItem("atoken") || "");

  const [ngoProjects, setNgoProjects] = useState([]);
  const [projectDetails, setProjectDetails] = useState(null);
  const [images, setImages] = useState([]);

  const navigate = useNavigate();

  // ------------------------
  // 1. Fetch NGO Projects
  // ------------------------
  const fetchNgoProjects = async () => {
    try {
      const { data } = await axios.get("/api/admin/ngo-projects", {
        headers: { atoken },
      });
      if (data.success) {
        setNgoProjects(data.ngoProjects);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ------------------------
  // 2. Fetch Project Details
  // ------------------------
  const fetchProjectData = async (projectId) => {
    try {
      const { data } = await axios.post(
        "/api/admin/projects",
        { projectId },
        { headers: { atoken } }
      );
      if (data.success) {
        setProjectDetails(data.projects);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ------------------------
  // 3. Fetch Images
  // ------------------------
  const fetchImages = async (imageIds) => {
    try {
      const { data } = await axios.post(
        "/api/admin/images",
        { imageIds },
        { headers: { atoken } }
      );
      if (data.success) {
        setImages(data.images);
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const value = {
    axios,
    navigate,
    atoken,
    setAtoken,

    ngoProjects,
    projectDetails,
    images,

    fetchNgoProjects,
    fetchProjectData,
    fetchImages,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
