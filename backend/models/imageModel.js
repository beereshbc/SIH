import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    ipfsHash: { type: String, required: true, index: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, required: true },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    reason: { type: String, default: "" },
    carbonCredits: { type: Number, default: 0 },
    gpsError: { type: String, default: null },

    // ✅ Approval tracking
    approvedAt: { type: Date },
    approvedByAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    approvedByAdminWallet: { type: String },
    txHash: { type: String }, // on-chain tx hash for the approval

    // ✅ Blockchain mapping
    onChainIndex: {
      type: Number, // index of this image in contract submission.images[]
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

const Image = mongoose.model("Image", imageSchema);
export default Image;
