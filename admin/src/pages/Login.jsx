import React, { useState } from "react";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

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
      if (!window.ethereum) return setMsg("No Web3 wallet found");
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setForm((f) => ({ ...f, blockchainAddress: accounts[0] }));
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
      // navigate to dashboard
    } catch (err) {
      console.error(err);
      setMsg(err?.response?.data?.message || `${mode} failed`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-white p-8 rounded-2xl shadow"
      >
        <h2 className="text-2xl font-semibold mb-4">
          {mode === "signup" ? "Admin Signup" : "Admin Login"}
        </h2>

        {mode === "signup" && (
          <>
            <label className="block mb-2">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded mb-3"
            />
          </>
        )}

        <label className="block mb-2">Email</label>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
          required
          className="w-full p-2 border rounded mb-3"
        />

        <label className="block mb-2">Password</label>
        <input
          name="password"
          value={form.password}
          onChange={handleChange}
          type="password"
          required
          className="w-full p-2 border rounded mb-3"
        />

        {mode === "signup" && (
          <>
            <label className="block mb-2">Blockchain Address (required)</label>
            <div className="flex gap-2">
              <input
                name="blockchainAddress"
                value={form.blockchainAddress}
                onChange={handleChange}
                required
                className="flex-1 p-2 border rounded"
              />
              <button
                type="button"
                onClick={connectWallet}
                className="px-3 py-2 bg-gray-800 text-white rounded"
              >
                Use Wallet
              </button>
            </div>
          </>
        )}

        <div className="mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded text-white ${
              mode === "signup" ? "bg-blue-600" : "bg-green-600"
            }`}
          >
            {loading
              ? mode === "signup"
                ? "Signing..."
                : "Logging..."
              : mode === "signup"
              ? "Signup"
              : "Login"}
          </button>
        </div>

        {msg && <p className="mt-3 text-sm text-red-600 text-center">{msg}</p>}

        <div className="mt-4 text-center">
          {mode === "signup" ? (
            <p className="text-sm">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-blue-600 hover:underline"
              >
                Login here
              </button>
            </p>
          ) : (
            <p className="text-sm">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="text-green-600 hover:underline"
              >
                Signup here
              </button>
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
