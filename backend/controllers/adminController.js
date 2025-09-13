// controllers/adminController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import dotenv from "dotenv";

import Image from "../models/imageModel.js";
import adminModel from "../models/adminModel.js";
import ngoProjectModel from "../models/ngoProjectModel.js";
import projectModel from "../models/projectModel.js";
import transactionModel from "../models/transactionModel.js";
import userModel from "../models/userModel.js";

dotenv.config();

// ---------------------
// Constants
// ---------------------
const JWT_SECRET = process.env.JWT_SECRET || "replace_this_in_prod";
const SALT_ROUNDS = 10;

// ---------------------
// File path helpers
// ---------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------
// Load Smart Contract ABI
// ---------------------
const contractData = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../abi/BlueCarbon.json"), "utf-8")
);
const contractAddress = contractData.address;
const contractABI = contractData.abi;

// ---------------------
// Provider + Wallet + Contract
// ---------------------
if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
  console.error("❌ RPC_URL or PRIVATE_KEY is missing in .env");
  throw new Error("RPC_URL or PRIVATE_KEY is missing in .env");
}

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY.trim(), provider);
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// ---------------------
// Admin Signup/Login
// ---------------------
const adminSignup = async (req, res) => {
  try {
    const { name, email, password, blockchainAddress } = req.body;
    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const existing = await adminModel.findOne({ email });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    const admin = new adminModel({
      name,
      email,
      password: hashed,
      blockchainAddress,
    });
    await admin.save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        blockchainAddress: admin.blockchainAddress,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });

    const admin = await adminModel.findOne({ email });
    if (!admin)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok)
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, role: admin.role }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        blockchainAddress: admin.blockchainAddress,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------------
// Data fetch endpoints
// ---------------------
const getNgoProjects = async (req, res) => {
  try {
    const ngoProjects = await ngoProjectModel
      .find({})
      .populate({ path: "images", match: { status: "pending" } })
      .lean();

    const pendingProjects = ngoProjects.filter(
      (project) => project.images && project.images.length > 0
    );

    res.json({ success: true, ngoProjects: pendingProjects });
  } catch (err) {
    console.error("getNgoProjects error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProjects = async (req, res) => {
  try {
    const { projectId } = req.body;
    if (!projectId)
      return res
        .status(400)
        .json({ success: false, message: "projectId not provided" });

    const projects = await projectModel.findById(projectId);
    if (!projects)
      return res
        .status(404)
        .json({ success: false, message: "Projects not found" });

    res.json({ success: true, projects });
  } catch (err) {
    console.error("getProjects error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const { imageIds } = req.body;
    if (!imageIds || imageIds.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "No image IDs provided" });

    const images = await Image.find({ _id: { $in: imageIds } });
    res.json({ success: true, images });
  } catch (err) {
    console.error("getImages error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------
// Approve Single Image Controller (with credits)
// ---------------------
const approveImageController = async (req, res) => {
  try {
    const { imageId, credits } = req.body;
    const adminId = req.admin?.id;
    const adminWallet = req.admin?.blockchainAddress || wallet.address;

    if (!imageId || credits == null)
      return res
        .status(400)
        .json({ success: false, msg: "Image ID and credits required" });

    const img = await Image.findById(imageId);
    if (!img)
      return res.status(404).json({ success: false, msg: "Image not found" });

    if (img.status === "verified")
      return res
        .status(400)
        .json({ success: false, msg: "Image already verified" });

    // compute onChainIndex if missing
    if (img.onChainIndex == null) {
      const images = await Image.find({ projectId: img.projectId }).sort({
        _id: 1,
      });
      img.onChainIndex = images.findIndex((i) => i._id.equals(img._id));
    }

    // ✅ Correct: find NgoProject by projectId
    const project = await ngoProjectModel.findOne({ project: img.projectId });
    if (!project)
      return res
        .status(404)
        .json({ success: false, msg: "NgoProject not found for this image" });
    console.log(project);

    const submissionId = project?.submissionIdOnChain;
    if (submissionId == null)
      return res
        .status(400)
        .json({ success: false, msg: "Missing blockchain mapping" });

    // Trigger on-chain approval
    const tx = await contract.approveImage(
      submissionId,
      img.onChainIndex,
      Number(credits)
    );
    const receipt = await tx.wait();

    // Update DB
    img.status = "verified";
    img.carbonCredits = Number(credits);
    img.approvedAt = new Date();
    img.approvedByAdminId = adminId;
    img.approvedByAdminWallet = adminWallet;
    img.txHash = receipt.transactionHash;
    await img.save();

    // Update total credits in project
    project.totalCarbonCredits =
      (project.totalCarbonCredits || 0) + Number(credits);
    await project.save();

    res.json({
      success: true,
      msg: `Image verified with ${credits} credits`,
      txHash: receipt.transactionHash,
    });
  } catch (err) {
    console.error("approveImageController error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ---------------------
// Reject Image Controller
// ---------------------
const rejectImageController = async (req, res) => {
  try {
    const { imageId, reason } = req.body;
    if (!imageId || !reason)
      return res
        .status(400)
        .json({ success: false, msg: "Image ID and reason required" });

    const img = await Image.findById(imageId);
    if (!img)
      return res.status(404).json({ success: false, msg: "Image not found" });

    img.status = "rejected";
    img.reason = reason;
    img.approvedAt = new Date();
    await img.save();

    res.json({ success: true, msg: "Image rejected", reason });
  } catch (err) {
    console.error("rejectImageController error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ---------------------
// Approve All Images in NGO Project (bulk, with credits)
// ---------------------
const approveNgoProjectOnChain = async (req, res) => {
  try {
    const { projectId, creditsPerImage } = req.body;
    const adminId = req.admin?.id;
    const adminWallet = req.admin?.blockchainAddress || wallet.address;

    // Fetch project + images
    const ngoProject = await ngoProjectModel
      .findById(projectId)
      .populate("images");

    if (!ngoProject)
      return res
        .status(404)
        .json({ success: false, msg: "NGO project not found" });

    const submissionId = ngoProject.submissionIdOnChain;
    if (submissionId == null)
      return res
        .status(400)
        .json({ success: false, msg: "NGO project not mapped to blockchain" });

    const images = ngoProject.images;
    if (!images || images.length === 0)
      return res.status(400).json({ success: false, msg: "No images found" });

    let totalAdded = 0;
    let lastReceipt;

    // Approve each image individually
    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (img.status === "pending") {
        const credits = Array.isArray(creditsPerImage)
          ? Number(creditsPerImage[i] || 0)
          : Number(creditsPerImage || 10); // fallback default

        if (credits <= 0) continue;

        const tx = await contract.approveImage(submissionId, i, credits);
        const receipt = await tx.wait();
        lastReceipt = receipt;

        // Update Image
        img.status = "verified";
        img.carbonCredits = credits;
        img.approvedAt = new Date();
        img.approvedByAdminId = adminId;
        img.approvedByAdminWallet = adminWallet;
        img.txHash = receipt.transactionHash;
        img.onChainIndex = i;
        await img.save();

        totalAdded += credits;
      }
    }

    // Finally approve the whole submission if at least one image was approved
    if (totalAdded > 0) {
      const tx2 = await contract.approveSubmission(submissionId);
      const receipt2 = await tx2.wait();
      lastReceipt = receipt2;

      ngoProject.totalCarbonCredits =
        (ngoProject.totalCarbonCredits || 0) + totalAdded;
      await ngoProject.save();
    }

    res.json({
      success: true,
      msg: `Project approved with ${totalAdded} total credits`,
      txHash: lastReceipt?.transactionHash,
    });
  } catch (err) {
    console.error("approveNgoProjectOnChain error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

// ---------------------
// Transaction retrieval + on-chain getters
// ---------------------
const getTransactionByImageId = async (req, res) => {
  try {
    const { imageId } = req.params;
    const tx = await transactionModel
      .findOne({ imageId })
      .sort({ createdAt: -1 });
    if (!tx)
      return res.status(404).json({ success: false, message: "Tx not found" });
    res.json({ success: true, tx });
  } catch (err) {
    console.error("getTransactionByImageId error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getOnChainImage = async (req, res) => {
  try {
    const { submissionIdOnChain, imageIndex } = req.query;
    if (submissionIdOnChain === undefined || imageIndex === undefined)
      return res
        .status(400)
        .json({ success: false, message: "Missing query params" });

    const img = await contract.getImage(
      Number(submissionIdOnChain),
      Number(imageIndex)
    );
    res.json({ success: true, onChainImage: img });
  } catch (err) {
    console.error("getOnChainImage error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export {
  adminSignup,
  adminLogin,
  getNgoProjects,
  getProjects,
  getImages,
  rejectImageController,
  approveImageController,
  getTransactionByImageId,
  getOnChainImage,
  approveNgoProjectOnChain,
};
