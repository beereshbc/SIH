import React, { useState } from "react";
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
  // Dummy Tree Data
  const [trees] = useState([
    {
      id: 1,
      location: "Davanagere, KA",
      date: "2025-08-01",
      status: "Verified",
    },
    { id: 2, location: "Mysuru, KA", date: "2025-08-03", status: "Verified" },
    { id: 3, location: "Hubli, KA", date: "2025-08-05", status: "Rejected" },
    { id: 4, location: "Bengaluru, KA", date: "2025-08-06", status: "Pending" },
    { id: 5, location: "Udupi, KA", date: "2025-08-07", status: "Verified" },
    {
      id: 6,
      location: "Shivamogga, KA",
      date: "2025-08-08",
      status: "Rejected",
    },
  ]);

  // Stats
  const stats = {
    credits: 120,
    verified: trees.filter((t) => t.status === "Verified").length,
    rejected: trees.filter((t) => t.status === "Rejected").length,
    pending: trees.filter((t) => t.status === "Pending").length,
  };

  const [selected, setSelected] = useState("All");

  // Pie Chart Data (Dynamic)
  const chartData = {
    labels: ["Verified", "Rejected", "Pending"],
    datasets: [
      {
        label: "Tree Status",
        data: [stats.verified, stats.rejected, stats.pending],
        backgroundColor: ["#22c55e", "#ef4444", "#eab308"],
        borderWidth: 1,
      },
    ],
  };

  // Bar Chart Data (Example Monthly Growth - could be API driven)
  const barData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"],
    datasets: [
      {
        label: "Verified",
        data: [5, 8, 6, 10, 7],
        backgroundColor: "#22c55e",
      },
      {
        label: "Rejected",
        data: [2, 1, 3, 2, 4],
        backgroundColor: "#ef4444",
      },
      {
        label: "Pending",
        data: [1, 3, 2, 4, 2],
        backgroundColor: "#eab308",
      },
    ],
  };

  // Line Chart Data (Dynamic Credits)
  const lineData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Credits Earned",
        data: [20, 40, 70, stats.credits],
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
      },
    ],
  };

  // Filtered Trees
  const filteredTrees =
    selected === "All"
      ? trees
      : selected === "Credits"
      ? []
      : trees.filter((t) => t.status === selected);

  return (
    <>
      <Navbar />
      <div className="min-h-screen mt-16 p-4 sm:p-6 md:p-10 lg:px-20 xl:px-40">
        {/* Top Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6 mb-10"
        >
          {/* Reset / All */}
          <div
            onClick={() => setSelected("All")}
            className={`bg-white shadow-md rounded-2xl p-4 sm:p-6 cursor-pointer hover:shadow-xl transition ${
              selected === "All" ? "ring-2 ring-blue-400" : ""
            }`}
          >
            <h2 className="text-base sm:text-lg font-semibold">All Trees</h2>
            <p className="mt-2 text-xl sm:text-2xl font-bold">{trees.length}</p>
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
            <p className="mt-2 text-xl sm:text-2xl font-bold">
              {stats.credits}
            </p>
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
            <p className="mt-2 text-xl sm:text-2xl font-bold">
              {stats.verified}
            </p>
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
            <p className="mt-2 text-xl sm:text-2xl font-bold">
              {stats.rejected}
            </p>
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
            <p className="mt-2 text-xl sm:text-2xl font-bold">
              {stats.pending}
            </p>
          </div>
        </motion.div>

        {/* Detailed List Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white shadow-md rounded-2xl p-4 sm:p-6 mb-10"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-4">
            {selected === "All"
              ? "All Trees"
              : selected === "Credits"
              ? "Credits Overview"
              : `${selected} Trees`}
          </h3>

          {selected === "Credits" ? (
            <div className="text-center text-blue-600 font-semibold text-lg">
              You have earned <span className="text-2xl">{stats.credits}</span>{" "}
              credits 🎉
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTrees.map((tree) => (
                <motion.div
                  key={tree.id}
                  whileHover={{ scale: 1.02 }}
                  className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
                >
                  <div>
                    <p className="font-medium text-sm sm:text-base">
                      Tree ID: {tree.id}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">
                      {tree.location}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      {tree.date}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      tree.status === "Verified"
                        ? "bg-green-100 text-green-700"
                        : tree.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {tree.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Graph Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid md:grid-cols-2 gap-8"
        >
          {/* Pie Chart */}
          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-6">
              Tree Status Overview
            </h3>
            <div className="w-full h-64">
              <Pie
                data={chartData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          {/* Line Chart */}
          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-semibold mb-6">
              Credits Growth Over Time
            </h3>
            <div className="w-full h-72">
              <Line
                data={lineData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>

          {/* Bar Chart */}
          <div className="bg-white shadow-md rounded-2xl p-4 sm:p-6 md:col-span-2">
            <h3 className="text-lg sm:text-xl font-semibold mb-6">
              Monthly Tree Status
            </h3>
            <div className="w-full h-80">
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
