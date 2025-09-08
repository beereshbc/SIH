import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // 🔗 Link to NGO Projects
    projects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "NgoProject",
      },
    ],
  },
  { minimize: false, timestamps: true }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
