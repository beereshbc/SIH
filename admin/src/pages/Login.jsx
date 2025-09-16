import React, { useState } from "react";
import { User, Mail, Lock, Wallet } from "lucide-react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";
import { connectWallet as walletConnect } from "../utils/wallet"; // wallet util
import { motion, AnimatePresence } from "framer-motion";

export default function AdminAuth() {
  const [mode, setMode] = useState("signup"); // signup | login
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    blockchainAddress: "",
  });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const { setAtoken } = useAppContext();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const connectWallet = async () => {
    try {
      const result = await walletConnect();
      if (result?.address) {
        setForm((f) => ({ ...f, blockchainAddress: result.address }));
        setMsg(`Wallet connected: ${result.address}`);
      }
    } catch (err) {
      console.error(err);
      setMsg("Wallet connection failed");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (mode === "signup" && !form.blockchainAddress) {
      setMsg("Wallet address is required. Please connect your wallet.");
      return;
    }

    setLoading(true);
    try {
      const url = mode === "signup" ? "/api/admin/signup" : "/api/admin/login";
      const payload =
        mode === "signup"
          ? form
          : { email: form.email, password: form.password };

      const res = await axios.post(url, payload);

      localStorage.setItem("atoken", res.data.token);
      setAtoken(res.data.token);

      setMsg(mode === "signup" ? "Signup successful" : "Login successful");
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || `${mode} failed`);
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          {mode === "signup" ? "Admin Signup" : "Admin Login"}
        </h2>

        <div className="flex flex-col gap-4">
          <AnimatePresence mode="wait">
            {mode === "signup" && (
              <motion.div
                key="name"
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <label className="flex items-center gap-2 text-gray-700 mb-1">
                  <User size={18} /> Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your full name"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            key="email"
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Mail size={18} /> Email
            </label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </motion.div>

          <motion.div
            key="password"
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <label className="flex items-center gap-2 text-gray-700 mb-1">
              <Lock size={18} /> Password
            </label>
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              required
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </motion.div>

          {mode === "signup" && (
            <motion.div
              key="wallet"
              variants={inputVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <label className="flex items-center gap-2 text-gray-700 mb-1">
                <Wallet size={18} /> Blockchain Wallet
              </label>
              <div className="flex gap-2">
                <input
                  name="blockchainAddress"
                  value={form.blockchainAddress}
                  onChange={handleChange}
                  required
                  className="flex-1 p-2 border rounded-lg bg-gray-100 focus:outline-none"
                  placeholder="Connect your wallet"
                />
                <button
                  type="button"
                  onClick={connectWallet}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {form.blockchainAddress ? "Reconnect" : "Connect"}
                </button>
              </div>
            </motion.div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {loading
            ? mode === "signup"
              ? "Signing up..."
              : "Logging in..."
            : mode === "signup"
            ? "Signup"
            : "Login"}
        </button>

        {msg && <p className="mt-3 text-center text-red-600">{msg}</p>}

        <p className="mt-4 text-center text-sm text-gray-500">
          {mode === "signup"
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setMode(mode === "signup" ? "login" : "signup")}
            className="text-blue-600 font-medium hover:underline"
          >
            {mode === "signup" ? "Login here" : "Signup here"}
          </button>
        </p>
      </motion.form>
    </div>
  );
}
