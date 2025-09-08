import mongoose from "mongoose";

const ngoProjectSchema = new mongoose.Schema(
  {
    ngoId: { type: String, required: true },
    ngoName: { type: String, required: true },
    ngoLocation: { type: String, required: true },
    email: { type: String, required: true },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],

    // Total credits will always be sum of verified images
    totalCarbonCredits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true } // ✅ auto adds createdAt & updatedAt
);

const ngoProjectModel = mongoose.model("NgoProject", ngoProjectSchema);
export default ngoProjectModel;
