import mongoose from "mongoose";

const imageSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  dataUrl: { type: String, required: true }, // can replace with IPFS hash later
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, required: true },
});

const imageModel = mongoose.model("Image", imageSchema);
export default imageModel;
