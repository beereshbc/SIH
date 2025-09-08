import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Pie, Bar, Line } from "react-chartjs-2";
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
import { CheckCircle, XCircle, Clock, Coins } from "lucide-react";
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
  const { dashboardData, dashData } = useAppContext();
  const [selected, setSelected] = useState("All");

  useEffect(() => {
    dashboardData(); // fetch API on mount
  }, []);

  if (!dashData || !dashData.projects) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen mt-16 flex justify-center items-center text-lg">
          Loading dashboard...
        </div>
      </>
    );
  }

  // ✅ Flatten images from all projects
  const allImages = dashData.projects.flatMap((p) => p.images || []);

  // ✅ Compute stats
  const verified = allImages.filter((img) => img.status === "verified").length;
  const rejected = allImages.filter((img) => img.status === "rejected").length;
  const pending = allImages.filter((img) => img.status === "pending").length;
  const totalCredits = allImages.reduce(
    (sum, img) => sum + (img.carbonCredits || 0),
    0
  );

  // ✅ Filtered Images
  const filteredImages =
    selected === "All"
      ? allImages
      : selected === "Credits"
      ? []
      : allImages.filter(
          (img) => img.status?.toLowerCase() === selected.toLowerCase()
        );

  // 📊 Pie Chart Data
  const chartData = {
    labels: ["Verified", "Rejected", "Pending"],
    datasets: [
      {
        label: "Image Status",
        data: [verified, rejected, pending],
        backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
        borderWidth: 1,
      },
    ],
  };

  // 📊 Dummy Monthly Distribution (replace later with API)
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
        backgroundColor: "#eab308",
      },
    ],
  };

  // 📊 Credits Growth
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Credits Earned",
        data: [20, 40, 70, totalCredits],
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
      },
    ],
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-16 p-4 sm:p-6 md:p-10 lg:px-20 xl:px-40">
        {/* ===== Top Stats ===== */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-10"
        >
          {/* All */}
          <div
            onClick={() => setSelected("All")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "All" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <h2 className="text-base sm:text-lg font-semibold">All Images</h2>
            <p className="mt-2 text-xl sm:text-2xl font-bold">
              {allImages.length}
            </p>
          </div>

          {/* Credits */}
          <div
            onClick={() => setSelected("Credits")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "Credits" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Coins className="text-yellow-500" size={24} />
              <h2 className="text-base sm:text-lg font-semibold">Credits</h2>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{totalCredits}</p>
          </div>

          {/* Verified */}
          <div
            onClick={() => setSelected("Verified")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "Verified" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-600" size={24} />
              <h2 className="text-base sm:text-lg font-semibold">Verified</h2>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{verified}</p>
          </div>

          {/* Rejected */}
          <div
            onClick={() => setSelected("Rejected")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "Rejected" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <XCircle className="text-red-600" size={24} />
              <h2 className="text-base sm:text-lg font-semibold">Rejected</h2>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{rejected}</p>
          </div>

          {/* Pending */}
          <div
            onClick={() => setSelected("Pending")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "Pending" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <Clock className="text-yellow-600" size={24} />
              <h2 className="text-base sm:text-lg font-semibold">Pending</h2>
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{pending}</p>
          </div>
        </motion.div>

        {/* ===== Detailed List ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-md rounded-2xl p-4 sm:p-6 mb-10"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            {selected === "All"
              ? "All Images"
              : selected === "Credits"
              ? "Credits Overview"
              : `${selected} Images`}
          </h3>

          {selected === "Credits" ? (
            <div className="text-center text-blue-600 font-semibold text-lg">
              You have earned <span className="text-2xl">{totalCredits}</span>{" "}
              credits 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImages.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      Image ID:{" "}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {dashData.ngoLocation}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {img.timestamp
                        ? new Date(img.timestamp).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                  <div>
                    <img
                      className="w-16 rounded-sm"
                      src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${img.ipfsHash}`}
                      alt=""
                    />
                  </div>
                  <span
                    className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      img.status === "verified"
                        ? "bg-green-100 text-green-700"
                        : img.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {img.status || "unknown"}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ===== Charts ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Image Status Overview
            </h3>
            <div className="w-full h-48">
              {" "}
              {/* reduced height */}
              <Pie
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Credits Growth Over Time
            </h3>
            <div className="w-full h-52">
              {" "}
              {/* reduced height */}
              <Line
                data={lineData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6 md:col-span-2">
            <h3 className="text-lg sm:text-xl font-semibold mb-4">
              Monthly Status Distribution
            </h3>
            <div className="w-full h-56">
              {" "}
              {/* reduced height */}
              <Bar
                data={barData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Dashboard;
