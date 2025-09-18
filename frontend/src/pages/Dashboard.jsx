import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Pie, Bar, Line } from "react-chartjs-2";
import {
  CheckCircle,
  XCircle,
  Clock,
  Coins,
  Leaf,
  Sprout,
  Image as ImageIcon,
  Video,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAppContext } from "../context/AppContext";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
);

const Dashboard = () => {
  const { dashData, dashboardData, token, loading, getImageTransactions } =
    useAppContext();
  const [selected, setSelected] = useState("All");

  // 🔴 Modal states
  const [rejectReason, setRejectReason] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [imageTx, setImageTx] = useState([]);
  const [selectedImageId, setSelectedImageId] = useState(null);

  useEffect(() => {
    if (selectedImageId) {
      getImageTransactions(selectedImageId).then(setImageTx);
    }
  }, [selectedImageId]);

  useEffect(() => {
    if (token) dashboardData();
  }, [token]);

  if (loading || !dashData || !dashData.projects) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen mt-16 flex justify-center items-center text-lg">
          <motion.div
            initial={{ opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              repeatType: "reverse",
            }}
            className="text-green-600 font-semibold"
          >
            Loading your eco dashboard...
          </motion.div>
        </div>
      </>
    );
  }

  // Flatten all media (images + videos)
  const allMedia = dashData.projects.flatMap((p) =>
    (p.images || []).map((img) => ({
      ...img,
      projectTitle: p.project?.title || "No Project",
      projectId: p.project?._id,
      type: img.type || "image",
    }))
  );

  const verified = allMedia.filter((m) => m.status === "verified").length;
  const rejected = allMedia.filter((m) => m.status === "rejected").length;
  const pending = allMedia.filter((m) => m.status === "pending").length;
  const totalCredits = allMedia.reduce(
    (sum, m) => sum + (m.carbonCredits || 0),
    0
  );

  const filteredMedia =
    selected === "All"
      ? allMedia
      : selected === "Credits"
      ? []
      : allMedia.filter(
          (m) => m.status?.toLowerCase() === selected.toLowerCase()
        );

  const chartData = {
    labels: ["Verified", "Rejected", "Pending"],
    datasets: [
      {
        label: "Media Status",
        data: [verified, rejected, pending],
        backgroundColor: ["#16a34a", "#dc2626", "#facc15"],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Verified",
        data: [5, 8, 6, 10, verified],
        backgroundColor: "#22c55e",
      },
      {
        label: "Rejected",
        data: [2, 1, 3, 2, rejected],
        backgroundColor: "#ef4444",
      },
      {
        label: "Pending",
        data: [1, 3, 2, 4, pending],
        backgroundColor: "#facc15",
      },
    ],
  };

  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Credits Earned",
        data: [20, 40, 70, totalCredits],
        fill: true,
        borderColor: "#16a34a",
        backgroundColor: "rgba(34,197,94,0.3)",
        tension: 0.4,
      },
    ],
  };

  return (
    <>
      <Navbar />

      {/* ===== Hero Section ===== */}
      <div className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20 px-6 sm:px-12 lg:px-20 rounded-b-3xl shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold mb-4 flex items-center justify-center playfont italic gap-2">
            <Leaf size={40} className="text-lime-300" /> Welcome to the Eco
            Dashboard
          </h1>
          <p className="text-md sm:text-lg mb-6 text-center font-medium text-emerald-100">
            Track your impact, monitor project media, and grow{" "}
            <span className="font-bold text-lime-200">carbon credits 🌍</span>
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-emerald-200 italic"
        >
          🌱 Together, we save the Earth. Every verified media = a step towards
          sustainability.
        </motion.div>
      </div>

      {/* ===== Dashboard Content ===== */}
      <div className="min-h-screen mt-10 p-4 sm:p-6 md:p-10 lg:px-20 xl:px-40">
        {/* ===== Top Stats ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-10"
        >
          {[
            {
              key: "All",
              title: "All Media",
              value: allMedia.length,
              icon: <Sprout className="text-green-600" size={24} />,
            },
            {
              key: "Credits",
              title: "Credits",
              value: totalCredits,
              icon: <Coins className="text-yellow-500" size={24} />,
            },
            {
              key: "Verified",
              title: "Verified",
              value: verified,
              icon: <CheckCircle className="text-green-600" size={24} />,
            },
            {
              key: "Rejected",
              title: "Rejected",
              value: rejected,
              icon: <XCircle className="text-red-600" size={24} />,
            },
            {
              key: "Pending",
              title: "Pending",
              value: pending,
              icon: <Clock className="text-yellow-600" size={24} />,
            },
          ].map((card) => (
            <motion.div
              key={card.key}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              onClick={() => setSelected(card.key)}
              className={`bg-white border rounded-2xl p-4 sm:p-6 cursor-pointer transition hover:border-green-400 shadow-md hover:shadow-lg ${
                selected === card.key ? "ring-2 ring-green-400" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {card.icon}
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {card.title}
                </h2>
              </div>
              <p className="mt-2 text-xl sm:text-2xl font-bold text-green-700">
                {card.value}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== Media Cards ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10"
        >
          {filteredMedia.map((m, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.02 }}
              className="bg-white border rounded-xl p-3 shadow-sm hover:shadow-md transition flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  {m.projectTitle}
                </span>
                <span
                  onClick={() => {
                    setSelectedProject(m.projectId), setSelectedImageId(m._id);
                  }}
                  className="cursor-pointer hover:scale-110 transition"
                >
                  {m.type === "image" ? (
                    <ImageIcon size={18} className="text-blue-500" />
                  ) : (
                    <Video size={18} className="text-purple-500" />
                  )}
                </span>
              </div>

              {/* Media Preview */}
              <div className="w-full h-36 bg-gray-100 rounded-md overflow-hidden mb-2">
                {m.type === "image" ? (
                  <img
                    src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${m.ipfsHash}`}
                    alt="media"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video controls className="w-full h-full object-cover">
                    <source
                      src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${m.ipfsHash}`}
                      type="video/mp4"
                    />
                  </video>
                )}
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  ID:
                  <span className="font-mono text-green-700 break-all text-xs sm:text-sm max-w-[180px] sm:max-w-[250px] md:max-w-[300px] truncate">
                    {m.ipfsHash}
                  </span>
                </span>
                <span className="flex items-center gap-1">
                  Status:
                  <span
                    className={`px-1 rounded ${
                      m.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : m.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    } ml-1 flex items-center gap-1`}
                  >
                    {m.status || "unknown"}

                    {/* 🔴 Show reason icon if rejected */}
                    {m.status === "rejected" && m.reason && (
                      <AlertCircle
                        size={14}
                        className="cursor-pointer text-red-600 hover:text-red-800"
                        onClick={() => setRejectReason(m.reason)}
                      />
                    )}
                  </span>
                </span>
                <span>Credits: {m.carbonCredits || 0}</span>
                <span>
                  Date:{" "}
                  {m.timestamp
                    ? new Date(m.timestamp).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ===== Charts ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700">
              Media Status Overview
            </h3>
            <div className="w-full h-48">
              <Pie
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700">
              Credits Growth Over Time
            </h3>
            <div className="w-full h-52">
              <Line
                data={lineData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white border rounded-2xl p-4 sm:p-6 md:col-span-2 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700">
              Monthly Status Distribution
            </h3>
            <div className="w-full h-56">
              <Bar
                data={barData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </motion.div>
      </div>

      {/* ===== 🔴 Rejection Reason Modal ===== */}
      {rejectReason && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setRejectReason(null)} // close on backdrop click
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white border-2 border-red-400 p-6 rounded-2xl shadow-2xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon */}
            <button
              onClick={() => setRejectReason(null)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition"
            >
              ✖
            </button>

            <h2 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
              🚫 Rejection Reason
            </h2>
            <p className="text-gray-700 mb-4 border-l-4 border-red-500 pl-3 italic">
              {rejectReason}
            </p>

            <button
              onClick={() => setRejectReason(null)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}

      {/* ===== 🔴 Project Details Overlay ===== */}
      {selectedProject && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedProject(null)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white border-2 border-green-400 rounded-2xl p-6 max-w-lg w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close icon */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-3 right-3 text-green-600 hover:text-green-800 transition"
            >
              ✖
            </button>

            <h2 className="text-xl font-bold text-green-700 mb-4 flex items-center gap-2">
              🌱 Project Details
            </h2>

            {(() => {
              const project = dashData.projects.find(
                (p) => p.project?._id === selectedProject
              );
              if (!project)
                return (
                  <p className="text-gray-500">No project info available</p>
                );

              return (
                <div className="space-y-3 text-gray-700">
                  <p>
                    <span className="font-semibold text-green-700">Title:</span>{" "}
                    {project.project.title}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Description:
                    </span>{" "}
                    {project.project.description}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Location:
                    </span>{" "}
                    {project.project.location}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Ecosystem:
                    </span>{" "}
                    {project.project.ecosystem}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Trees Planted:
                    </span>{" "}
                    {project.project.treesPlanted}
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Area Restored:
                    </span>{" "}
                    {project.project.areaRestored} acres
                  </p>
                  <p>
                    <span className="font-semibold text-green-700">
                      Carbon Stored:
                    </span>{" "}
                    {project.project.carbonStored} tons
                  </p>
                </div>
              );
            })()}
            <div className="mt-4 border-t pt-3">
              <h3 className="font-semibold text-green-700 mb-2">
                Transactions
              </h3>

              {imageTx.length === 0 ? (
                <p className="text-gray-500 text-sm">No transactions yet</p>
              ) : (
                <ul className="space-y-2 text-gray-700 text-sm">
                  {imageTx.map((tx, idx) => (
                    <li
                      key={idx}
                      className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4"
                    >
                      <span className="font-semibold">
                        {tx.status.toUpperCase()}
                      </span>
                      <span>Credits: {tx.credits}</span>

                      {/* TX Hash Button */}
                      <a
                        href={`https://sepolia.etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition w-fit"
                      >
                        <span className="text-sm font-medium">TX Hash</span>
                        <ExternalLink size={14} />
                      </a>

                      <span>{new Date(tx.timestamp).toLocaleDateString()}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedProject(null)}
                className="bg-green-600 text-white px-5 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default Dashboard;
