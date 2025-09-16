// pages/Login.jsx
import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, Wallet, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { connectWallet as connectWalletUtil } from "../utils/wallet";

const Login = () => {
  const [state, setState] = useState("login"); // login or register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ngoLocation, setNgoLocation] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { token, setToken, axios, navigate } = useAppContext();

  const inputVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  // Connect MetaMask wallet via wallet.js
  const handleConnectWallet = async () => {
    const walletData = await connectWalletUtil();
    if (walletData?.address) {
      setWalletAddress(walletData.address); // original checksum address
      toast.success(`Wallet connected: ${walletData.address}`);
    }
  };

  // Form submit handler
  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (state === "login") {
        const { data } = await axios.post("/api/user/login", {
          email,
          password,
        });
        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Logged in successfully");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      } else {
        if (!walletAddress) {
          toast.error("Please connect your wallet first!");
          setLoading(false);
          return;
        }

        const { data } = await axios.post("/api/user/register", {
          name,
          email,
          password,
          walletAddress,
          ngoLocation,
        });

        if (data.success) {
          setToken(data.token);
          localStorage.setItem("token", data.token);
          toast.success("Account created successfully");
          navigate("/");
        } else {
          toast.error(data.message);
        }
      }
    } catch (error) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-100 px-4">
        <motion.form
          onSubmit={submitHandler}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-8 sm:p-10 w-full max-w-md"
        >
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
            {state === "login" ? "Login to Your Account" : "Create NGO Account"}
          </h2>

          <div className="flex flex-col gap-5">
            {/* Name Field */}
            <AnimatePresence mode="wait">
              {state === "register" && (
                <motion.div
                  key="name"
                  variants={inputVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.4 }}
                >
                  <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                    <User size={16} /> Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    required
                    className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <motion.div
              key="email"
              variants={inputVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5 }}
            >
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                <Mail size={16} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
            </motion.div>

            {/* Password Field */}
            <motion.div
              key="password"
              variants={inputVariant}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative"
            >
              <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                <Lock size={16} /> Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter secure password"
                required
                className="w-full px-4 py-2 text-sm border rounded-lg pr-10 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 cursor-pointer text-gray-400"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </motion.div>

            {/* NGO Location */}
            {state === "register" && (
              <motion.div
                key="location"
                variants={inputVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                  <MapPin size={16} /> NGO Location
                </label>
                <input
                  type="text"
                  value={ngoLocation}
                  onChange={(e) => setNgoLocation(e.target.value)}
                  placeholder="City, State"
                  required
                  className="w-full px-4 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                />
              </motion.div>
            )}

            {/* Wallet Address */}
            {state === "register" && (
              <motion.div
                key="wallet"
                variants={inputVariant}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.4 }}
              >
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1 mb-1">
                  <Wallet size={16} /> Wallet Address
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    readOnly
                    placeholder="Connect wallet"
                    required
                    className="w-full px-4 py-2 text-sm border rounded-lg bg-gray-100 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={handleConnectWallet}
                    className="px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {walletAddress ? "Reconnect" : "Connect"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg font-medium shadow-md hover:bg-blue-700 transition-all disabled:opacity-60"
          >
            {loading
              ? state === "login"
                ? "Logging in..."
                : "Creating account..."
              : state === "login"
              ? "Login"
              : "Sign Up"}
          </motion.button>

          {/* Toggle Link */}
          <p className="text-center text-sm text-gray-500 mt-4">
            {state === "login"
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <span
              onClick={() => setState(state === "login" ? "register" : "login")}
              className="text-blue-600 cursor-pointer font-medium hover:underline"
            >
              Click here
            </span>
          </p>
        </motion.form>
      </div>
    </>
  );
};

export default Login;
