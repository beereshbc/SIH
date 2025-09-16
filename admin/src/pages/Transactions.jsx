import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CreditCard,
  Calendar,
  User,
  Wallet,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppContext } from "../context/AppContext";
import { motion } from "framer-motion";

const Transactions = () => {
  const { axios, atoken } = useAppContext(); // ✅ use atoken from context
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("/api/admin/transactions", {
        params: { page, limit: 50, search: debouncedSearch },
        headers: { atoken }, // ✅ pass token from context
      });

      if (data.success) {
        setTransactions(data.data);
        setPages(data.pages || 1);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Fetch transactions error:", err);
      setError(err.response?.data?.msg || err.message || "Server Error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch transactions when page or debounced search changes
  useEffect(() => {
    fetchTransactions();
  }, [page, debouncedSearch, atoken]); // ✅ added atoken as dependency

  const shortHash = (hash) =>
    hash ? `${hash.slice(0, 6)}...${hash.slice(-4)}` : "-";

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Recent Transactions
      </h1>

      {/* Search */}
      <div className="flex items-center gap-2 max-w-md mb-6">
        <Search className="text-gray-400" />
        <input
          type="text"
          placeholder="Search by wallet, txHash..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm"
        />
      </div>

      {/* Transaction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full text-center text-gray-500">
            Loading...
          </div>
        ) : error ? (
          <div className="col-span-full text-center text-red-500">{error}</div>
        ) : transactions.length === 0 ? (
          <div className="col-span-full text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          transactions.map((tx) => (
            <motion.div
              key={tx._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              className="bg-white p-5 rounded-xl shadow-md cursor-pointer border border-gray-100 w-full"
              onClick={() => navigate(`/transactions/${tx._id}`)} // ✅ navigate to details page
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600 font-mono truncate w-2/3">
                  {shortHash(tx.txHash)}
                </span>
                <CreditCard size={18} className="text-green-500" />
              </div>

              <div className="text-gray-700 text-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 w-full">
                  <Wallet size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate w-full">
                    {shortHash(tx.adminWallet)}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <User size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate w-full">
                    {shortHash(tx.imageId?.walletAddress)}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Layers size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate w-full">
                    {tx.projectId?.name || "-"}
                  </span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <CreditCard
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                  <span>{tx.credits}</span>
                </div>
                <div className="flex items-center gap-2 w-full">
                  <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate w-full">
                    {new Date(tx.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mt-6 w-full">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
        >
          <ChevronLeft size={16} /> Prev
        </button>
        <span className="px-2 text-gray-700">
          Page {page} of {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => setPage(page + 1)}
          className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-100 transition"
        >
          Next <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Transactions;
