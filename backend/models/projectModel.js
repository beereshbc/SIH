import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: { type: String, required: true },
  ecosystem: { type: String, required: true },
  treesPlanted: { type: Number, required: true },
  areaRestored: { type: Number, required: true },
  carbonStored: { type: Number, required: true }, // still optional summary
  ipfsImages: [
    {
      type: String, // IPFS hashes of image JSONs
    },
  ],
});

const projectModel = mongoose.model("Project", projectSchema);
export default projectModel;
