import React, { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Hash, MapPin, Copy, Layers } from "lucide-react"; // ✅ added Layers icon
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const InspectImages = ({ ngo, fetchImages }) => {
  const [inputs, setInputs] = useState({});
  const [activeAction, setActiveAction] = useState({});
  const [loading, setLoading] = useState(false);
  const { atoken } = useAppContext();

  // Copy Hash
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Approve Single
  const handleApproveSingle = async (img) => {
    const credits = inputs[img._id];
    if (!credits || isNaN(credits)) return toast.error("Enter valid credits");

    try {
      const { data } = await axios.post(
        "/api/admin/images/approve",
        { imageId: img._id, credits },
        { headers: { atoken } }
      );
      if (data.success) toast.success(`Approved with ${credits} credits!`);
      else toast.error(data.msg || "Approval failed");
      fetchImages?.();
      setActiveAction({ ...activeAction, [img._id]: null });
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Approval failed");
    }
  };

  // Reject Single
  const handleRejectSingle = async (img) => {
    const reason = inputs[`reason-${img._id}`];
    if (!reason) return toast.error("Enter reason");

    try {
      const { data } = await axios.post(
        "/api/admin/images/reject",
        { imageId: img._id, reason },
        { headers: { atoken } }
      );
      if (data.success) toast.success("Image rejected!");
      else toast.error(data.msg || "Rejection failed");
      fetchImages?.();
      setActiveAction({ ...activeAction, [img._id]: null });
    } catch (err) {
      toast.error(err.response?.data?.msg || err.message || "Rejection failed");
    }
  };

  // ✅ Bulk Approve NGO Project
  // ✅ Bulk Approve NGO Project with credits for each image
  const handleApproveProject = async () => {
    if (!ngo?._id) return toast.error("Invalid NGO project");

    // Collect credits from inputs
    const creditsPerImage = ngo.images.map((img) =>
      Number(inputs[img._id] || 0)
    );

    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/projects/approve-onchain",
        { projectId: ngo._id, creditsPerImage },
        { headers: { atoken } }
      );

      if (data.success) {
        toast.success(data.msg || "Project approved!");
        fetchImages?.(); // refresh UI
      } else {
        toast.error(data.msg || "Bulk approval failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.msg || err.message || "Bulk approval failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* ✅ Project Bulk Approval Button */}
      {ngo?.images?.length > 0 && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleApproveProject}
          disabled={loading}
          className={`flex items-center gap-2 self-start border border-blue-600 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Layers size={18} />
          {loading ? "Approving..." : "Approve Entire Project On-Chain"}
        </motion.button>
      )}

      {/* Individual Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ngo?.images?.map((img) => (
          <motion.div
            key={img._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl flex flex-col gap-4"
          >
            {/* Image */}
            <motion.img
              src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${img.ipfsHash}`}
              alt="submitted"
              className="rounded-xl object-cover h-60 w-full"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            />

            {/* Metadata */}
            <div className="flex flex-col gap-3 text-gray-800 text-sm">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-500" />
                <span className="truncate w-48">{img.ipfsHash}</span>
                <button
                  onClick={() => handleCopy(img.ipfsHash)}
                  className="ml-auto text-gray-500 hover:text-blue-600"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <span className="font-medium">
                  {img.lat}, {img.lng}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    img.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : img.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Status: {img.status}
                </span>

                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  Credits: {img.carbonCredits ?? 0}
                </span>

                {img.reason && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    Reason: {img.reason}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            {img.status === "pending" && (
              <div className="flex flex-col gap-3 mt-2">
                {/* Approve Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setActiveAction({ ...activeAction, [img._id]: "approve" })
                  }
                  className="flex items-center gap-2 w-full justify-center border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white"
                >
                  <CheckCircle size={18} /> Approve
                </motion.button>

                {/* Approve Input */}
                {activeAction[img._id] === "approve" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 w-full"
                  >
                    <input
                      type="number"
                      placeholder="Credits"
                      value={inputs[img._id] || ""}
                      onChange={(e) =>
                        setInputs({ ...inputs, [img._id]: e.target.value })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleApproveSingle(img)}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Confirm Approve
                    </button>
                  </motion.div>
                )}

                {/* Reject Button */}
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setActiveAction({ ...activeAction, [img._id]: "reject" })
                  }
                  className="flex items-center gap-2 w-full justify-center border border-red-600 text-red-700 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white"
                >
                  <XCircle size={18} /> Reject
                </motion.button>

                {/* Reject Input */}
                {activeAction[img._id] === "reject" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-2 w-full"
                  >
                    <input
                      type="text"
                      placeholder="Reason"
                      value={inputs[`reason-${img._id}`] || ""}
                      onChange={(e) =>
                        setInputs({
                          ...inputs,
                          [`reason-${img._id}`]: e.target.value,
                        })
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    />
                    <button
                      onClick={() => handleRejectSingle(img)}
                      className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    >
                      Confirm Reject
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InspectImages;
