
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const [state, setState] = React.useState("login");
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  const inputVariant = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 30 },
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col gap-4 m-auto mt-12 items-start p-8 py-12 w-80 sm:w-[352px] text-gray-500 rounded-lg shadow-xl border border-gray-200 bg-white"
    >
      {/* Heading */}
      <p className="text-xl font-normal m-auto">
        <span className="text-p2">User</span>{" "}
        {state === "login" ? "Login" : "Sign Up"}
      </p>

      <AnimatePresence mode="wait">
        {state === "register" && (
          <motion.div
            key="name"
            variants={inputVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.4 }}
            className="w-full"
          >
            <p>Name</p>
            <input
              onChange={(e) => setName(e.target.value)}
              value={name}
              placeholder="type here"
              className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
              type="text"
              required
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key="email"
          variants={inputVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="email"
            required
          />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key="password"
          variants={inputVariant}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full"
        >
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="type here"
            className="border border-gray-200 rounded w-full p-2 mt-1 outline-indigo-500"
            type="password"
            required
          />
        </motion.div>
      </AnimatePresence>

      {/* Switch State */}
      {state === "register" ? (
        <p className="text-sm">
          Already have account?{" "}
          <span
            onClick={() => setState("login")}
            className="text-indigo-500 cursor-pointer"
          >
            click here
          </span>
        </p>
      ) : (
        <p className="text-sm">
          Create an account?{" "}
          <span
            onClick={() => setState("register")}
            className="text-p2 cursor-pointer"
          >
            click here
          </span>
        </p>
      )}

      {/* Submit Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-p2 hover:bg-p2-600 transition-all text-white w-full py-2 rounded-md cursor-pointer"
      >
        {state === "register" ? "Create Account" : "Login"}
      </motion.button>
    </motion.form>
  );
};

export default Login;
