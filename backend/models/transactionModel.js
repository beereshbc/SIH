import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    txHash: { type: String, required: true, index: true },
    chain: { type: String, default: "ethereum" },
    contractAddress: { type: String, required: true },
    submissionId: { type: mongoose.Schema.Types.ObjectId, ref: "NgoProject" }, // or submissionModel if you use that
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    imageId: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    ipfsHash: { type: String, required: true },
    lat: { type: Number },
    lng: { type: Number },
    credits: { type: Number, default: 0 },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // from adminAuth
    adminWallet: { type: String }, // admin blockchain address
    ngoWallet: { type: String },
    ngoName: { type: String },

    blockNumber: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const transactionModel = mongoose.model("Transaction", transactionSchema);
export default transactionModel;
