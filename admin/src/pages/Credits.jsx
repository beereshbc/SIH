import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Search, CheckCircle, Clock, XCircle } from "lucide-react";

export default function Credits() {
  const { axios, atoken } = useAppContext();
  const [credits, setCredits] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchCredits = async () => {
      try {
        const res = await axios.get("/api/admin/credits", {
          headers: { atoken },
        });
        if (res.data.success) setCredits(res.data.credits);
      } catch (err) {
        console.error("Failed to fetch credits:", err);
      }
    };
    fetchCredits();
  }, []);

  const filteredCredits = credits.filter(
    (c) =>
      c.projectTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.ngoName.toLowerCase().includes(search.toLowerCase())
  );

  const totalCredits = credits.reduce((acc, c) => acc + c.creditsIssued, 0);

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🌱 Issued Carbon Credits
        </h1>
        <p className="text-green-700 text-sm">
          Total carbon credits issued across all projects and NGOs.
        </p>
        <p className="mt-2 font-semibold text-green-900">
          Total Credits Issued: {totalCredits}
        </p>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4 flex items-center gap-2 max-w-sm"
      >
        <Search className="w-5 h-5 text-green-500" />
        <input
          type="text"
          placeholder="Search by project or NGO..."
          className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </motion.div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-lg rounded-xl overflow-hidden">
          <thead className="bg-green-100">
            <tr>
              <th className="py-3 px-4 text-left text-green-700">Project</th>
              <th className="py-3 px-4 text-left text-green-700">NGO</th>
              <th className="py-3 px-4 text-left text-green-700">
                Credits Issued
              </th>
              <th className="py-3 px-4 text-left text-green-700">Admin</th>
              <th className="py-3 px-4 text-left text-green-700">Status</th>
              <th className="py-3 px-4 text-left text-green-700">TX Hash</th>
            </tr>
          </thead>
          <tbody>
            {filteredCredits.map((c) => (
              <motion.tr
                key={c._id}
                className="border-t hover:bg-green-50 cursor-pointer transition-colors duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td className="py-3 px-4 font-medium">{c.projectTitle}</td>
                <td className="py-3 px-4">{c.ngoName}</td>
                <td className="py-3 px-4 font-semibold">{c.creditsIssued}</td>
                <td className="py-3 px-4">{c.adminName || "N/A"}</td>
                <td className="py-3 px-4">
                  {c.status === "success" ? (
                    <CheckCircle className="text-green-500 inline-block w-5 h-5" />
                  ) : c.status === "pending" ? (
                    <Clock className="text-yellow-500 inline-block w-5 h-5" />
                  ) : (
                    <XCircle className="text-red-500 inline-block w-5 h-5" />
                  )}
                </td>
                <td className="py-3 px-4 break-all">{c.txHash}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredCredits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center text-green-700"
        >
          No credits found.
        </motion.div>
      )}
    </div>
  );
}
