import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import {
  CreditCard,
  Calendar,
  User,
  Wallet,
  Layers,
  Hash,
  CheckCircle2,
  XOctagon,
} from "lucide-react";
import { motion } from "framer-motion";

const TransactionDetails = () => {
  const { id } = useParams();
  const { axios, atoken } = useAppContext();

  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const { data } = await axios.get(`/api/admin/transaction/${id}`, {
          headers: { atoken },
        });

        if (data.success) {
          setTransaction(data.data);
        } else {
          setError("Transaction not found");
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.msg || "Server Error");
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [id, axios, atoken]);

  if (loading)
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  const tx = transaction;

  return (
    <div className="w-full min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">
        Transaction Details
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg w-full max-w-[100%] mx-auto flex flex-col gap-6 p-6 border border-gray-200"
      >
        {/* Transaction Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
          {[
            {
              label: "Tx Hash",
              icon: <Hash size={16} />,
              value: tx.txHash,
            },
            {
              label: "Admin Wallet",
              icon: <Wallet size={16} />,
              value: tx.adminWallet,
            },
            {
              label: "Image Wallet",
              icon: <User size={16} />,
              value: tx.imageId?.walletAddress || "-",
            },
            {
              label: "Date",
              icon: <Calendar size={16} />,
              value: new Date(tx.createdAt).toLocaleString(),
            },
            {
              label: "Credits",
              icon: <CreditCard size={16} />,
              value: tx.credits,
              highlight: true,
            },
            {
              label: "Status",
              icon: <Layers size={16} />,
              value: tx.status,
              iconStatus: <CheckCircle2 size={16} className="text-green-600" />,
            },
          ].map((item, i) => (
            <div
              key={i}
              className={`flex flex-col border p-3 rounded-lg ${
                item.highlight
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-1 text-sm font-medium text-gray-600">
                {item.icon} {item.label}
              </div>
              <div className="flex items-center gap-2 text-gray-900 font-mono">
                {item.value} {item.iconStatus}
              </div>
            </div>
          ))}
        </div>

        {/* Project & Image Cards in Reverse Layout */}
        <div className="flex flex-col-reverse md:flex-row gap-6">
          {/* Verified Image */}
          {tx.imageId && tx.imageId.status === "verified" && (
            <motion.div
              className="flex-1 bg-green-50 p-4 rounded-xl border-l-4 border-green-400 shadow-sm flex flex-col gap-2"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Verified Image
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  <strong>IPFS Hash:</strong> {tx.imageId.ipfsHash}
                </div>
                <div>
                  <strong>Lat:</strong> {tx.imageId.lat}, <strong>Lng:</strong>{" "}
                  {tx.imageId.lng}
                </div>
                <div>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(tx.imageId.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className="text-green-600 font-semibold">
                    {tx.imageId.status}
                  </span>
                </div>
              </div>
              <motion.img
                src={`https://ipfs.io/ipfs/${tx.imageId.ipfsHash}`}
                alt="Blockchain Image"
                className="w-full h-52 object-cover rounded-md border-2 border-green-400 mt-2"
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              />
            </motion.div>
          )}

          {/* Project Info */}
          {tx.projectId && (
            <motion.div
              className="flex-1 bg-green-50 p-4 rounded-xl border-l-4 border-green-400 shadow-sm flex flex-col gap-2"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-2">
                Project Details
              </h2>
              <div className="text-sm text-gray-700 space-y-1">
                <div>
                  <strong>Title:</strong> {tx.projectId.title}
                </div>
                <div>
                  <strong>Description:</strong> {tx.projectId.description}
                </div>
                <div>
                  <strong>Location:</strong> {tx.projectId.location}
                </div>
                <div>
                  <strong>Ecosystem:</strong> {tx.projectId.ecosystem}
                </div>
                <div>
                  <strong>Trees Planted:</strong> {tx.projectId.treesPlanted}
                </div>
                <div>
                  <strong>Area Restored:</strong> {tx.projectId.areaRestored}
                </div>
                <div>
                  <strong>Carbon Stored:</strong>{" "}
                  {tx.projectId.carbonStored || 0}
                </div>
              </div>

              {tx.projectId.ipfsImages
                ?.filter((img) => img.status === "verified")
                .map((img, i) => (
                  <motion.img
                    key={i}
                    src={`https://ipfs.io/ipfs/${img}`}
                    alt="Project"
                    className="w-full h-44 object-cover rounded-md mt-2 border-2 border-green-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.2 }}
                  />
                ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TransactionDetails;
