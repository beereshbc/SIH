import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";

const AddAdmin = () => {
  const { axios, atoken } = useAppContext();
  const [admins, setAdmins] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [secretKey, setSecretKey] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    blockchainAddress: "",
  });
  const [loading, setLoading] = useState(false);

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      const res = await axios.get("/api/admin/admins", {
        headers: { Authorization: atoken },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch admins");
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Secret key validation
  const handleSecretKey = (e) => {
    e.preventDefault();
    if (!secretKey) return toast.error("Enter secret key!");
    setFormVisible(true);
  };

  // Input change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit new admin
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/add-admin",
        { ...form, secretKey },
        { headers: { Authorization: atoken } }
      );

      if (data.success) {
        toast.success("Admin added successfully!");
        setForm({ name: "", email: "", password: "", blockchainAddress: "" });
        setSecretKey("");
        setFormVisible(false);
        fetchAdmins();
      } else {
        toast.error(data.message || "Failed to add admin");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error!");
    }
    setLoading(false);
  };

  return (
    <div className="p-8 bg-green-50 min-h-screen">
      <h2 className="text-3xl font-bold text-green-900 mb-6 text-center">
        🌱 Admin Management
      </h2>

      {/* Add New Admin Button */}
      {!formVisible && (
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setFormVisible("secret")}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition"
          >
            Add New Admin
          </button>
        </div>
      )}

      {/* Secret Key Input */}
      {formVisible === "secret" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <form onSubmit={handleSecretKey} className="flex gap-3">
            <input
              type="password"
              placeholder="Enter Admin Secret Key"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              className="p-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              Submit
            </button>
          </form>
        </motion.div>
      )}

      {/* Add Admin Form */}
      {formVisible && formVisible !== "secret" && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-2xl shadow-xl max-w-md mx-auto mb-6 border border-green-200"
        >
          <h3 className="text-xl font-bold text-green-900 mb-4 text-center">
            Add Admin Details
          </h3>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={form.email}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <input
              type="text"
              name="blockchainAddress"
              placeholder="Ethereum Wallet Address"
              value={form.blockchainAddress}
              onChange={handleChange}
              required
              className="p-3 rounded-lg border border-green-200 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="mt-2 p-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow-md transition"
            >
              {loading ? "Adding..." : "Add Admin"}
            </button>
          </form>
        </motion.div>
      )}

      {/* Admins Table */}
      <div className="overflow-x-auto bg-white p-6 rounded-2xl shadow-xl border border-green-200">
        <h3 className="text-xl font-bold text-green-900 mb-4 text-center">
          All Admins
        </h3>
        <table className="min-w-full">
          <thead className="bg-green-100">
            <tr>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Wallet</th>
              <th className="py-2 px-4 text-left">Role</th>
              <th className="py-2 px-4 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin._id} className="border-t">
                <td className="py-2 px-4">{admin.name}</td>
                <td className="py-2 px-4">{admin.email}</td>
                <td className="py-2 px-4">{admin.blockchainAddress}</td>
                <td className="py-2 px-4">{admin.role}</td>
                <td className="py-2 px-4">
                  {new Date(admin.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AddAdmin;
