import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    txHash: { type: String, required: true, unique: true }, // Blockchain tx hash
    imageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    ngoProjectId: { type: mongoose.Schema.Types.ObjectId, ref: "NgoProject" },

    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    adminWallet: { type: String },

    credits: { type: Number, required: true },

    status: {
      type: String,
      enum: ["success", "failed", "rejected"],
      default: "",
    },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", transactionSchema);
export default Transaction;
