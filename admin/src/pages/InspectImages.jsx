import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Hash, MapPin, Copy } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { useAppContext } from "../context/AppContext";

const InspectMedia = ({ ngo, fetchImages }) => {
  const [inputs, setInputs] = useState({});
  const [activeAction, setActiveAction] = useState({});
  const [loading, setLoading] = useState(false);
  const { atoken, adminWallet } = useAppContext();
  const [bulkApproved, setBulkApproved] = useState(false);

  // Copy IPFS hash
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  // Approve single image/video
  const handleApproveSingle = async (media) => {
    const credits = inputs[media._id];
    if (!credits || isNaN(credits)) return toast.error("Enter valid credits");

    try {
      const { data } = await axios.post(
        "/api/admin/images/approve",
        { imageId: media._id, credits },
        { headers: { atoken } }
      );

      if (data.success)
        toast.success(
          `Approved ${media.type} with ${credits} credits! Tx: ${data.txHash}`
        );
      else toast.error(data.message || "Approval failed");

      fetchImages?.();
      setActiveAction({ ...activeAction, [media._id]: null });
    } catch (err) {
      toast.error(
        err.response?.data?.message || err.message || "Approval failed"
      );
    }
  };

  // Reject single image/video
  // Reject single image/video
  const handleRejectSingle = async (media) => {
    const reason = inputs[`reason-${media._id}`];
    if (!reason) {
      toast.error("Enter reason before rejecting");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        "/api/admin/images/reject",
        { imageId: media._id, reason },
        { headers: { atoken } }
      );

      if (data.success) {
        toast.success(
          `${media.type} rejected! Reason: ${reason} | Tx: ${data.txHash}`
        );

        // Immediately refresh the list
        fetchImages?.();

        // Reset UI action for this media
        setActiveAction((prev) => ({ ...prev, [media._id]: null }));

        // Clear input field for reason
        setInputs((prev) => ({ ...prev, [`reason-${media._id}`]: "" }));
      } else {
        toast.error(data.msg || "Rejection failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          err.message ||
          "Rejection failed"
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto approve project on-chain
  useEffect(() => {
    const autoApproveProject = async () => {
      if (!ngo?._id || bulkApproved) return;

      const pendingMedia = ngo.images.filter((img) => img.status === "pending");
      if (pendingMedia.length === 0) return;

      setLoading(true);
      try {
        const creditsPerMedia = pendingMedia.map((img) =>
          Number(inputs[img._id] || 0)
        );

        const { data } = await axios.post(
          "/api/admin/projects/approve-onchain",
          { projectId: ngo._id, creditsPerMedia },
          { headers: { atoken } }
        );

        if (data.success) {
          toast.success("Project auto-approved on-chain! TxHashes saved.");
          fetchImages?.();
          setBulkApproved(true);
        } else toast.error(data.msg || "Auto bulk approval failed");
      } catch (err) {
        toast.error(
          err.response?.data?.msg || err.message || "Auto bulk approval failed"
        );
      } finally {
        setLoading(false);
      }
    };

    autoApproveProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ngo]);

  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ngo?.images?.map((media) => (
          <motion.div
            key={media._id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-2xl shadow-lg hover:shadow-xl flex flex-col gap-4"
          >
            {/* Display Image or Video */}
            {media.type === "image" ? (
              <motion.img
                src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${media.ipfsHash}`}
                alt="submitted"
                className="rounded-xl object-cover h-60 w-full"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              />
            ) : (
              <motion.video
                controls
                className="rounded-xl object-cover h-60 w-full"
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
              >
                <source
                  src={`https://aquamarine-electrical-lamprey-369.mypinata.cloud/ipfs/${media.ipfsHash}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </motion.video>
            )}

            {/* Metadata */}
            <div className="flex flex-col gap-3 text-gray-800 text-sm">
              <div className="flex items-center gap-2">
                <Hash size={16} className="text-gray-500" />
                <span className="truncate w-48">{media.ipfsHash}</span>
                <button
                  onClick={() => handleCopy(media.ipfsHash)}
                  className="ml-auto text-gray-500 hover:text-blue-600"
                >
                  <Copy size={16} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-red-500" />
                <span className="font-medium">
                  {media.lat}, {media.lng}
                </span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    media.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : media.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  Status: {media.status}
                </span>

                <span className="px-2 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                  Credits: {media.carbonCredits ?? 0}
                </span>

                {media.reason && (
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                    Reason: {media.reason}
                  </span>
                )}
              </div>

              {/* Individual Actions for Pending */}
              {media.status === "pending" && (
                <div className="flex flex-col gap-3 mt-2">
                  {/* Approve */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setActiveAction({
                        ...activeAction,
                        [media._id]: "approve",
                      })
                    }
                    className="flex items-center gap-2 w-full justify-center border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white"
                  >
                    <CheckCircle size={18} /> Approve
                  </motion.button>

                  {activeAction[media._id] === "approve" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 w-full"
                    >
                      <input
                        type="number"
                        placeholder="Credits"
                        value={inputs[media._id] || ""}
                        onChange={(e) =>
                          setInputs({ ...inputs, [media._id]: e.target.value })
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleApproveSingle(media)}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Confirm Approve
                      </button>
                    </motion.div>
                  )}

                  {/* Reject */}
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setActiveAction({
                        ...activeAction,
                        [media._id]: "reject",
                      })
                    }
                    className="flex items-center gap-2 w-full justify-center border border-red-600 text-red-700 px-4 py-2 rounded-lg hover:bg-red-600 hover:text-white"
                  >
                    <XCircle size={18} /> Reject
                  </motion.button>

                  {activeAction[media._id] === "reject" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 w-full"
                    >
                      <input
                        type="text"
                        placeholder="Reason"
                        value={inputs[`reason-${media._id}`] || ""}
                        onChange={(e) =>
                          setInputs({
                            ...inputs,
                            [`reason-${media._id}`]: e.target.value,
                          })
                        }
                        className="w-full border rounded-md px-3 py-2 text-sm"
                      />
                      <button
                        onClick={() => handleRejectSingle(media)}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                      >
                        Confirm Reject
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default InspectMedia;
