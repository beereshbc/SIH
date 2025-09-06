import { motion, AnimatePresence } from "framer-motion";
import React, { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [state, setState] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const inputVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
      <motion.form
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col gap-5 p-8 sm:p-10 w-80 sm:w-[400px] bg-white border border-gray-200 rounded-xl shadow-xl"
      >
        {/* Heading */}
        <p className="text-xl sm:text-2xl font-semibold text-center text-gray-700 mb-2">
          <span className="text-p2">User</span>{" "}
          {state === "login" ? "Login" : "Sign Up"}
        </p>

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
              className="relative w-full"
            >
              <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
                <User size={16} /> Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 pl-10 rounded border border-gray-300 focus:ring-2 focus:ring-p2 focus:outline-none text-sm"
                required
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email Field */}
        <AnimatePresence mode="wait">
          <motion.div
            key="email"
            variants={inputVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5 }}
            className="relative w-full"
          >
            <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Mail size={16} /> Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 pl-10 rounded border border-gray-300 focus:ring-2 focus:ring-p2 focus:outline-none text-sm"
              required
            />
          </motion.div>
        </AnimatePresence>

        {/* Password Field */}
        <AnimatePresence mode="wait">
          <motion.div
            key="password"
            variants={inputVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative w-full"
          >
            <label className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <Lock size={16} /> Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 pl-10 pr-10 rounded border border-gray-300 focus:ring-2 focus:ring-p2 focus:outline-none text-sm"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-9 cursor-pointer text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </span>
          </motion.div>
        </AnimatePresence>

        {/* Switch State */}
        <p className="text-sm text-gray-500 text-center">
          {state === "register"
            ? "Already have an account?"
            : "Create an account?"}{" "}
          <span
            onClick={() => setState(state === "login" ? "register" : "login")}
            className="text-p2 cursor-pointer font-medium"
          >
            click here
          </span>
        </p>

        {/* Submit Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-p2 hover:bg-p2-600 text-white w-full py-2 rounded-md font-medium transition-all"
        >
          {state === "register" ? "Create Account" : "Login"}
        </motion.button>
      </motion.form>
    </div>
  );
};

export default Login;
