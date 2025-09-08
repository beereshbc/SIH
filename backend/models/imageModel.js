import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  ipfsHash: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, required: true },

  // status of each image (not project-wide)
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },

  // carbon credits allocated per image
  carbonCredits: {
    type: Number,
    default: 0,
  },

  // store GPS errors if detected
  gpsError: {
    type: String,
    default: null,
  },
});

const Image = mongoose.model("Image", imageSchema);

export default Image;
