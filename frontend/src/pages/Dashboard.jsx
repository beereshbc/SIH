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
import { CheckCircle, XCircle, Clock, Coins, Leaf, Sprout } from "lucide-react";
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
  const { dashboardData, dashData, token, loading } = useAppContext();
  const [selected, setSelected] = useState("All");

  useEffect(() => {
    if (token) {
      dashboardData();
    }
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

  const allImages = dashData.projects.flatMap((p) => p.images || []);
  const verified = allImages.filter((img) => img.status === "verified").length;
  const rejected = allImages.filter((img) => img.status === "rejected").length;
  const pending = allImages.filter((img) => img.status === "pending").length;
  const totalCredits = allImages.reduce(
    (sum, img) => sum + (img.carbonCredits || 0),
    0
  );

  const filteredImages =
    selected === "All"
      ? allImages
      : selected === "Credits"
      ? []
      : allImages.filter(
          (img) => img.status?.toLowerCase() === selected.toLowerCase()
        );

  const chartData = {
    labels: ["Verified", "Rejected", "Pending"],
    datasets: [
      {
        label: "Image Status",
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
            Track your impact, monitor project images, and grow{" "}
            <span className="font-bold text-lime-200">carbon credits 🌍</span>
          </p>
        </motion.div>

        {/* Eco Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center text-emerald-200 italic"
        >
          🌱 Together, we save the Earth. Every verified image = a step towards
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
              title: "All Images",
              value: allImages.length,
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

        {/* ===== Detailed List ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border rounded-2xl p-4 sm:p-6 mb-10 shadow-md"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700">
            {selected === "All"
              ? "All Images"
              : selected === "Credits"
              ? "Credits Overview"
              : `${selected} Images`}
          </h3>

          {selected === "Credits" ? (
            <div className="text-center text-green-700 font-semibold text-lg">
              🎉 You have earned{" "}
              <span className="text-2xl text-lime-600">{totalCredits}</span>{" "}
              credits
            </div>
          ) : (
            <div className="space-y-3">
              {filteredImages.map((img, i) => (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center shadow-sm hover:shadow-md transition"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base text-gray-800">
                      Image ID:{" "}
                      <span className="text-green-600">{img._id}</span>
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
                      className="w-16 rounded-md border border-green-200"
                      src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${img.ipfsHash}`}
                      alt="project"
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
          <div className="bg-white border rounded-2xl p-4 sm:p-6 shadow-md">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 text-green-700">
              Image Status Overview
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
    </>
  );
};

export default Dashboard;
