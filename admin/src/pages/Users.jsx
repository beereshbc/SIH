import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

export default function Users() {
  const { axios, atoken } = useAppContext();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/admin/users", {
          headers: { atoken },
        });
        setUsers(res.data.users);
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter users by search
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.walletAddress.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-green-50 p-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-6"
      >
        <h1 className="text-3xl font-bold text-green-800 mb-2">
          🌿 Registered NGOs / Users
        </h1>
        <p className="text-green-700 text-sm">
          View all registered users with their details and projects.
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
          placeholder="Search by name, email or wallet..."
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
              <th className="py-3 px-4 text-left text-green-700">Name</th>
              <th className="py-3 px-4 text-left text-green-700">Email</th>
              <th className="py-3 px-4 text-left text-green-700">Wallet</th>
              <th className="py-3 px-4 text-left text-green-700">Projects</th>
              <th className="py-3 px-4 text-left text-green-700">Location</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <motion.tr
                key={user._id}
                className="border-t hover:bg-green-50 cursor-pointer transition-colors duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <td className="py-3 px-4">{user.name}</td>
                <td className="py-3 px-4">{user.email}</td>
                <td className="py-3 px-4">{user.walletAddress}</td>
                <td className="py-3 px-4">{user.projects?.length || 0}</td>
                <td className="py-3 px-4">{user.ngoLocation}</td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-10 text-center text-green-700"
        >
          No users found.
        </motion.div>
      )}
    </div>
  );
}
