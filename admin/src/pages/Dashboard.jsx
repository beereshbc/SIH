import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion } from "framer-motion";
import {
  Users,
  Leaf,
  Coins,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const navigate = useNavigate();
  const { axios, atoken } = useAppContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get("/api/admin/dashboard", {
          headers: { atoken },
        });
        if (data.success) {
          setStats(data.stats);
          setLoading(false);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading Dashboard...
      </div>
    );

  // Chart data
  const ecosystemData = {
    labels: Object.keys(stats.ecosystems),
    datasets: [
      {
        label: "Projects per Ecosystem",
        data: Object.values(stats.ecosystems),
        backgroundColor: ["#22c55e", "#16a34a", "#facc15", "#f97316"],
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  const imageStatusData = {
    labels: ["Verified", "Pending", "Rejected"],
    datasets: [
      {
        label: "Images Status",
        data: [stats.verifiedImages, stats.pendingImages, stats.rejectedImages],
        backgroundColor: ["#22c55e", "#facc15", "#ef4444"],
      },
    ],
  };

  const creditsCO2Data = {
    labels: ["CO₂ Restored", "Credits Issued"],
    datasets: [
      {
        label: "CO₂ vs Credits",
        data: [stats.totalCarbon, stats.totalIssuedCredits],
        backgroundColor: ["#3b82f6", "#f59e0b"],
        barPercentage: 0.5,
        categoryPercentage: 0.5,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-green-50 text-gray-800">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="bg-emerald-100 rounded-3xl p-10 mb-10 shadow-lg text-center"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          🌱 Eco Admin Dashboard
        </h1>
        <p className="text-lg md:text-xl text-green-700">
          Manage NGOs, Projects, Trees, Carbon Credits & Images with ease
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4">
        {/* Top Summary Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {[
            {
              icon: <Users className="w-8 h-8 text-blue-500" />,
              label: "Total NGOs",
              value: stats.totalNGOs,
            },
            {
              icon: <Leaf className="w-8 h-8 text-green-500" />,
              label: "Total Projects",
              value: stats.totalProjects,
            },
            {
              icon: <Clock className="w-8 h-8 text-yellow-500" />,
              label: "Total Submissions",
              value: stats.totalSubmissions,
            },
            {
              icon: <Receipt className="w-8 h-8 text-purple-500" />,
              label: "Total Transactions",
              value: stats.totalTransactions,
              onClick: () => navigate("/transactions"),
            },
            {
              icon: <Coins className="w-8 h-8 text-orange-500" />,
              label: "Total Credits Issued",
              value: stats.totalIssuedCredits,
              onClick: () => navigate("/credits"),
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className={`bg-white rounded-2xl p-5 shadow-md flex items-center gap-4 border border-gray-200 cursor-pointer`}
              onClick={card.onClick}
            >
              {card.icon}
              <div>
                <p className="text-gray-500 text-sm">{card.label}</p>
                <p className="font-semibold text-lg">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Image Status Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, staggerChildren: 0.1 }}
        >
          {[
            {
              icon: <CheckCircle className="w-8 h-8 text-green-500" />,
              label: "Approved",
              value: stats.verifiedImages,
            },
            {
              icon: <XCircle className="w-8 h-8 text-red-500" />,
              label: "Rejected",
              value: stats.rejectedImages,
            },
            {
              icon: <Clock className="w-8 h-8 text-yellow-500" />,
              label: "Pending",
              value: stats.pendingImages,
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.05 }}
              className="bg-white rounded-2xl p-5 shadow-md flex items-center gap-4 border border-gray-200 cursor-pointer"
              onClick={() => navigate("/verification")}
            >
              {card.icon}
              <div>
                <p className="text-gray-500 text-sm">{card.label} Images</p>
                <p className="font-semibold text-lg">{card.value}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts Section */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, staggerChildren: 0.2 }}
        >
          {/* Image Status Pie */}
          <motion.div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Image Status Overview
            </h3>
            <div className="h-48">
              <Pie
                data={imageStatusData}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </motion.div>

          {/* Credits vs CO2 */}
          <motion.div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Credits vs CO₂
            </h3>
            <div className="h-48">
              <Bar
                data={creditsCO2Data}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </motion.div>

          {/* Projects per Ecosystem */}
          <motion.div className="bg-white rounded-2xl p-5 shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Projects per Ecosystem
            </h3>
            <div className="h-48">
              <Bar
                data={ecosystemData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
