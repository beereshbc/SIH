import mongoose from "mongoose";

const ngoProjectSchema = new mongoose.Schema({
  ngoId: { type: String, required: true }, // no unique
  ngoName: { type: String, required: true },
  ngoLocation: { type: String, required: true },
  email: { type: String, required: true },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },

  images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  submittedAt: { type: Date, default: Date.now },
});

const ngoProjectModel = mongoose.model("NgoProject", ngoProjectSchema);
export default ngoProjectModel;
