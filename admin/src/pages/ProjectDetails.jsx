// src/pages/ProjectDetails.jsx
import React from "react";
import {
  Building2,
  Mail,
  MapPin,
  Wallet,
  Hash,
  Leaf,
  Calendar,
} from "lucide-react";

const ProjectDetails = ({ ngo }) => {
  if (!ngo)
    return (
      <p className="text-gray-500 italic text-center p-4">
        No project details available.
      </p>
    );

  const details = [
    {
      label: "NGO Name",
      value: ngo.ngoName,
      icon: <Building2 size={18} />,
    },
    {
      label: "Email",
      value: ngo.email,
      icon: <Mail size={18} />,
    },
    {
      label: "Location",
      value: ngo.ngoLocation,
      icon: <MapPin size={18} />,
    },
    {
      label: "Wallet",
      value: ngo.ngoWallet,
      icon: <Wallet size={18} />,
      overlay: true, // mark this to show as overlay
    },
    {
      label: "Project ID",
      value: ngo.project,
      icon: <Hash size={18} />,
    },
    {
      label: "Total Credits",
      value: ngo.totalCarbonCredits,
      icon: <Leaf size={18} className="text-green-600" />,
      highlight: true,
    },
    {
      label: "Created At",
      value: new Date(ngo.createdAt).toLocaleString(),
      icon: <Calendar size={18} />,
    },
  ];

  return (
    <div className="w-full border border-gray-200 bg-white rounded-2xl shadow-md p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        {details.map((item, idx) => (
          <div
            key={idx}
            className={`relative flex items-center gap-3 p-3 rounded-lg border ${
              item.highlight
                ? "bg-green-50 border-green-200"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <div
              className={`p-2 rounded-lg ${
                item.highlight ? "bg-green-100" : "bg-gray-100"
              }`}
            >
              {item.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-medium">
                {item.label}
              </p>
              <p
                className={`text-sm font-semibold break-all ${
                  item.highlight ? "text-green-700" : "text-gray-800"
                }`}
              >
                {item.value || "N/A"}
              </p>
            </div>

            {/* Overlay style for Wallet ID */}
            {item.overlay && (
              <span className="absolute -top-2 right-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-md shadow">
                Wallet ID
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectDetails;
