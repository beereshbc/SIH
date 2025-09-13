import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";

export default function Dashboard() {
  const { axios, aToken } = useAppContext();
  const [stats, setStats] = useState({
    verifiedCount: 0,
    pendingCount: 0,
    rejectedCount: 0,
    creditsIssued: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${aToken}`, // 🔑 Ensure token is sent
          },
        });

        setStats(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };

    if (aToken) fetchStats();
  }, [aToken, axios]);

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Verified Images</p>
          <p className="text-xl font-bold">{stats.verifiedCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Pending Images</p>
          <p className="text-xl font-bold">{stats.pendingCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Rejected Images</p>
          <p className="text-xl font-bold">{stats.rejectedCount}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <p className="text-gray-500">Total Carbon Credits</p>
          <p className="text-xl font-bold">{stats.creditsIssued}</p>
        </div>
      </div>
    </div>
  );
}
