// client/src/pages/Verification.jsx
import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Wallet,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import OverlayModal from "../components/OverlayModal";
import InspectImages from "./InspectImages";
import ProjectDetails from "./ProjectDetails";

const Verification = () => {
  const { atoken, axios } = useAppContext();
  const [ngoProjects, setNgoProjects] = useState([]);
  const [selectedNgo, setSelectedNgo] = useState(null);
  const [view, setView] = useState(null); // "images" | "details"

  // Fetch NGO Projects
  const fetchNgoProjects = async () => {
    try {
      const { data } = await axios.get("/api/admin/ngo-projects", {
        headers: { atoken },
      });

      if (data.success) {
        setNgoProjects(data.ngoProjects);
        toast.success("NGO Projects loaded");
      } else {
        // If no data, keep empty list
        setNgoProjects([]);
        toast.error(data.message || "No projects found");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchNgoProjects();
  }, []);

  return (
    <div className="p-6 bg-gray-50 min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold tracking-wide border-b border-gray-200 pb-3">
        Verification Panel
      </h1>

      {/* NGO Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {ngoProjects.map((ngo, index) => (
          <motion.div
            key={ngo._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
            className="border border-gray-200 bg-white rounded-2xl shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition"
          >
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-6 h-6 text-gray-700" />
              <h2 className="text-lg font-semibold">{ngo.ngoName}</h2>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MapPin className="w-4 h-4" />
              <span>{ngo.ngoLocation}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
              <Wallet className="w-4 h-4" />
              <span className="truncate">{ngo.ngoWallet}</span>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => {
                  setSelectedNgo(ngo);
                  setView("images");
                }}
                className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                <ImageIcon className="w-4 h-4" />
                Inspect Images
              </button>

              <button
                onClick={() => {
                  setSelectedNgo(ngo);
                  setView("details");
                }}
                className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                <FileText className="w-4 h-4" />
                Project Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overlay */}
      <OverlayModal
        isOpen={!!view}
        onClose={() => {
          setSelectedNgo(null);
          setView(null);
        }}
        title={view === "images" ? "Inspect Images" : "Project Details"}
      >
        {view === "images" && <InspectImages ngo={selectedNgo} />}
        {view === "details" && <ProjectDetails ngo={selectedNgo} />}
      </OverlayModal>
    </div>
  );
};

export default Verification;
