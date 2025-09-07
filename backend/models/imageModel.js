import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  }, // link to project
  ipfsHash: { type: String, required: true }, // IPFS CID for JSON containing image + GPS
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

const imageModel = mongoose.model("Image", imageSchema);
export default imageModel;
