import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    submissionIdOnChain: { type: Number }, // if you want to store chain id
    ngoId: { type: String },
    ngoName: { type: String },
    ngoWallet: { type: String },
    projectRef: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    title: String,
    description: String,
    images: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }],

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const SubmissionModel = mongoose.model("Submission", submissionSchema);
export default SubmissionModel;
