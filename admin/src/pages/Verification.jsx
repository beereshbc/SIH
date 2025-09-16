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
  Mail,
  Award,
  ClipboardList,
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
    <div className="p-6 bg-green-50 min-h-screen text-gray-900">
      <h1 className="text-2xl font-bold tracking-wide border-b border-green-200 pb-3 text-green-800">
        🌿 Verification Panel
      </h1>

      {/* NGO Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {ngoProjects.map((ngo, index) => (
          <motion.div
            key={ngo._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="border border-green-200 bg-white rounded-2xl shadow-sm p-5 hover:shadow-lg hover:border-green-300 transition"
          >
            {/* NGO Name */}
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="w-6 h-6 text-green-700" />
              <h2 className="text-lg font-semibold text-green-900">
                {ngo.ngoName}
              </h2>
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>{ngo.ngoLocation}</span>
            </div>

            {/* Wallet */}
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1 truncate">
              <Wallet className="w-4 h-4" />
              <span>{ngo.ngoWallet}</span>
            </div>

            {/* Email */}
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1 truncate">
              <Mail className="w-4 h-4" />
              <span>{ngo.email}</span>
            </div>

            {/* Submission & Project Info */}
            <div className="flex items-center gap-2 text-green-700 text-sm mb-1">
              <ClipboardList className="w-4 h-4" />
              <span>Project ID: {ngo.project?._id || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-green-700 text-sm mb-3">
              <Award className="w-4 h-4" />
              <span>Total Pending Images: {ngo.images?.length || 0}</span>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-3">
              <button
                onClick={() => {
                  setSelectedNgo(ngo);
                  setView("images");
                }}
                className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-800 transition"
              >
                <ImageIcon className="w-4 h-4" />
                Inspect Images
              </button>

              <button
                onClick={() => {
                  setSelectedNgo(ngo);
                  setView("details");
                }}
                className="flex items-center gap-2 border border-green-300 px-4 py-2 rounded-xl text-sm font-medium text-green-700 hover:bg-green-100 transition"
              >
                <FileText className="w-4 h-4" />
                Project Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Overlay Modal */}
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
