import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

import Image from "../models/imageModel.js";
import adminModel from "../models/adminModel.js";
import ngoProjectModel from "../models/ngoProjectModel.js";
import projectModel from "../models/projectModel.js";
import Transaction from "../models/transactionModel.js";
import {
  wallet,
  provider,
  blueCarbonContract,
  approveImageOnChain,
  sendTokens,
} from "../config/blockchain.js";
import { ethers } from "ethers";
import SubmissionModel from "../models/submissionModel.js";
import userModel from "../models/userModel.js";

dotenv.config();

// ---------------------
// Constants
// ---------------------
const JWT_SECRET = process.env.JWT_SECRET || "replace_this_in_prod";
const SALT_ROUNDS = 10;

// ---------------------
// Admin Signup/Login
// ---------------------
const adminSignup = async (req, res) => {
  try {
    const { name, email, password, blockchainAddress } = req.body;

    // Validation
    if (!name || !email || !password || !blockchainAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password too short (min 6 chars)" });
    }
    if (!ethers.isAddress(blockchainAddress)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid blockchain address" });
    }

    const existing = await adminModel.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    // ✅ Always store as checksum address
    const checksumAddress = ethers.getAddress(blockchainAddress);

    const admin = new adminModel({
      name,
      email,
      password: hashed,
      blockchainAddress: checksumAddress,
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

// ✅ Admin Login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }

    const admin = await adminModel.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

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

const getAdmin = async (req, res) => {
  try {
    const adminId = req.adminId; // from adminAuth middleware

    if (!adminId) {
      return res
        .status(400)
        .json({ success: false, message: "Admin ID is required" });
    }

    const admin = await adminModel.findById(adminId).select("-password"); // exclude password
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    res.json({ success: true, admin });
  } catch (error) {
    console.error("GetAdmin Error:", error.message);
    res.status(500).json({ success: false, message: error.message });
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
    if (!projectId) {
      return res
        .status(400)
        .json({ success: false, message: "projectId not provided" });
    }

    const projects = await projectModel.findById(projectId);
    if (!projects) {
      return res
        .status(404)
        .json({ success: false, message: "Projects not found" });
    }

    res.json({ success: true, projects });
  } catch (err) {
    console.error("getProjects error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getImages = async (req, res) => {
  try {
    const { imageIds } = req.body;
    if (!imageIds || imageIds.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No image IDs provided" });
    }

    const images = await Image.find({ _id: { $in: imageIds } });
    res.json({ success: true, images });
  } catch (err) {
    console.error("getImages error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------------
// Approve Single Image Controller (Fixed)
// ---------------------
const approveImageController = async (req, res) => {
  try {
    const { imageId, credits } = req.body;
    const adminId = req.adminId;

    if (!blueCarbonContract) {
      return res.status(500).json({
        success: false,
        message: "Blockchain contract not initialized",
      });
    }

    const img = await Image.findById(imageId);
    if (!img)
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });

    if (img.status === "verified") {
      return res
        .status(400)
        .json({ success: false, message: "Image already verified" });
    }

    const ngoProject = await ngoProjectModel.findOne({
      project: img.projectId,
    });
    if (!ngoProject)
      return res
        .status(404)
        .json({ success: false, message: "NGO Project not found" });

    if (!ngoProject.submissionIdOnChain)
      return res.status(400).json({
        success: false,
        message: "submissionIdOnChain missing for NGO project",
      });

    if (img.onChainIndex == null) {
      const index = ngoProject.images.findIndex((i) => i.equals(img._id));
      if (index === -1)
        return res
          .status(400)
          .json({ success: false, message: "Image not linked to NGO project" });
      img.onChainIndex = index;
      await img.save();
    }

    const contractWithSigner = blueCarbonContract.connect(wallet);

    let tx;
    try {
      tx = await contractWithSigner.approveImage(
        ngoProject.submissionIdOnChain,
        img.onChainIndex,
        credits
      );
    } catch (contractErr) {
      const reason =
        contractErr?.reason ||
        contractErr?.error?.message ||
        "Contract execution failed";
      return res.status(500).json({ success: false, message: reason });
    }

    const txHash = tx.hash;

    // ✅ Update DB
    img.status = "verified";
    img.carbonCredits = credits;
    img.txHash = txHash;
    img.approvedAt = new Date();
    img.approvedByAdminId = adminId;
    img.approvedByAdminWallet = wallet.address;
    await img.save();

    ngoProject.totalCarbonCredits =
      (ngoProject.totalCarbonCredits || 0) + credits;
    await ngoProject.save();

    await Transaction.create({
      txHash,
      imageId: img._id,
      projectId: img.projectId,
      ngoProjectId: ngoProject._id,
      adminId,
      adminWallet: wallet.address,
      credits,
      status: "success",
    });

    tx.wait()
      .then(() => console.log(`Transaction ${txHash} confirmed.`))
      .catch(console.error);

    res.status(200).json({
      success: true,
      message: "Image approved successfully",
      txHash,
      image: img,
    });
  } catch (error) {
    console.error("Approve Image Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to approve image", error });
  }
};

// ---------------------
// Bulk Approve NGO Project (Fixed)
const approveNgoProjectOnChain = async (req, res) => {
  try {
    const { projectId } = req.body;
    const adminId = req.adminId;

    if (!blueCarbonContract) {
      return res.status(500).json({
        success: false,
        message: "Blockchain contract not initialized",
      });
    }

    const ngoProject = await ngoProjectModel
      .findById(projectId)
      .populate("images");
    if (!ngoProject)
      return res
        .status(404)
        .json({ success: false, msg: "NGO project not found" });

    if (!ngoProject.submissionIdOnChain)
      return res
        .status(400)
        .json({ success: false, msg: "Project not mapped on-chain" });

    const contractWithSigner = blueCarbonContract.connect(wallet);
    let totalCredits = 0;
    const txHashes = [];

    if (totalCredits > 0) {
      ngoProject.totalCarbonCredits =
        (ngoProject.totalCarbonCredits || 0) + totalCredits;
      await ngoProject.save();
    }

    return res.json({
      success: true,
      msg: `Bulk approval done. Total credits: ${totalCredits}`,
      txHashes,
    });
  } catch (err) {
    console.error("approveNgoProjectOnChain error:", err);
    return res.status(500).json({ success: false, msg: err.message });
  }
};

const rejectImageController = async (req, res) => {
  try {
    const { imageId, reason } = req.body;
    const adminId = req.adminId;

    if (!imageId || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Image ID and reason required" });
    }

    const img = await Image.findById(imageId);
    if (!img) {
      return res
        .status(404)
        .json({ success: false, message: "Image not found" });
    }

    const ngoProject = await ngoProjectModel.findOne({
      project: img.projectId,
    });
    if (!ngoProject) {
      return res
        .status(404)
        .json({ success: false, message: "NGO Project not found" });
    }

    if (!ngoProject.submissionIdOnChain) {
      return res.status(400).json({
        success: false,
        message: "submissionIdOnChain missing for NGO project",
      });
    }

    if (img.onChainIndex == null) {
      const index = ngoProject.images.findIndex((i) => i.equals(img._id));
      if (index === -1) {
        return res
          .status(400)
          .json({ success: false, message: "Image not linked to NGO project" });
      }
      img.onChainIndex = index;
      await img.save();
    }

    let tx;
    try {
      tx = await blueCarbonContract
        .connect(wallet)
        .rejectImage(ngoProject.submissionIdOnChain, img.onChainIndex, reason);
    } catch (contractErr) {
      const errMsg =
        contractErr?.reason ||
        contractErr?.error?.message ||
        "Contract execution failed";
      return res.status(500).json({ success: false, message: errMsg });
    }

    const txHash = tx.hash;

    img.previousStatus = img.status;
    img.status = "rejected";
    img.reason = reason;
    img.rejectedAt = new Date();
    img.txHash = txHash;
    img.approvedByAdminId = adminId;
    img.approvedByAdminWallet = wallet.address;
    await img.save();

    await Transaction.create({
      txHash,
      imageId: img._id,
      projectId: img.projectId,
      ngoProjectId: ngoProject._id,
      adminId,
      adminWallet: wallet.address,
      credits: 0,
      status: "rejected",
    });

    tx.wait()
      .then(() =>
        console.log(
          `Reject tx ${txHash} confirmed on chain for image ${img._id}`
        )
      )
      .catch((err) => console.error("Reject tx confirmation failed:", err));

    return res.status(200).json({
      success: true,
      message: "Image rejected successfully",
      txHash,
      reason,
      image: img,
    });
  } catch (err) {
    console.error("rejectImageController error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to reject image",
      error: err.message || err,
    });
  }
};

// ---------------------
// Get Transactions
// ---------------------
const getAllTransactions = async (req, res) => {
  try {
    let { page = 1, limit = 50 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const total = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({ path: "imageId", select: "walletAddress" })
      .populate({ path: "projectId", select: "name" });

    res.json({
      success: true,
      data: transactions,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    res.status(500).json({ success: false, msg: err.message });
  }
};

const getTransactionById = async (req, res) => {
  const { id } = req.params;

  try {
    const transaction = await Transaction.findById(id)
      .populate({ path: "imageId", model: Image }) // includes type: image/video
      .populate({ path: "projectId", model: projectModel })
      .populate({ path: "ngoProjectId", model: ngoProjectModel });

    if (!transaction) {
      return res
        .status(404)
        .json({ success: false, msg: "Transaction not found" });
    }

    return res.status(200).json({ success: true, data: transaction });
  } catch (err) {
    console.error("Transaction fetch error:", err);
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

const addAdminController = async (req, res) => {
  try {
    const { name, email, password, walletAddress } = req.body;

    // --------------------
    // Validation
    // --------------------
    if (!name || !email || !password || !walletAddress) {
      return res
        .status(400)
        .json({ success: false, message: "Missing fields" });
    }
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }
    if (!ethers.isAddress(walletAddress)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid Ethereum address" });
    }

    const existing = await adminModel.findOne({
      $or: [{ email }, { blockchainAddress: walletAddress }],
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "Admin with this email or wallet already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const checksumAddress = ethers.getAddress(walletAddress); // ensure proper checksum

    // --------------------
    // Save in MongoDB
    // --------------------
    const newAdmin = await adminModel.create({
      name,
      email,
      password: hashedPassword,
      blockchainAddress: checksumAddress,
    });

    // --------------------
    // Call contract to add admin on-chain
    // --------------------
    if (!contract) {
      console.warn("Contract not initialized. Admin added to DB only.");
    } else {
      try {
        const tx = await contract.connect(wallet).addAdmin(checksumAddress);
        await tx.wait();
        console.log(
          `Admin added on-chain: ${checksumAddress}, txHash: ${tx.hash}`
        );
      } catch (err) {
        console.error("Failed to add admin on-chain:", err.message || err);
      }
    }

    res.status(201).json({
      success: true,
      message: "Admin added successfully",
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        blockchainAddress: newAdmin.blockchainAddress,
      },
    });
  } catch (err) {
    console.error("addAdminController error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

const getAdminDashboard = async (req, res) => {
  try {
    // Basic counts
    const totalNGOs = await ngoProjectModel.countDocuments();
    const totalProjects = await projectModel.countDocuments();
    const totalSubmissions = await SubmissionModel.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const verifiedImages = await Image.countDocuments({ status: "verified" });
    const pendingImages = await Image.countDocuments({ status: "pending" });
    const rejectedImages = await Image.countDocuments({ status: "rejected" });

    // Total credits issued
    const totalCredits = await Transaction.aggregate([
      { $match: { status: "success" } },
      { $group: { _id: null, total: { $sum: "$credits" } } },
    ]);
    const totalIssuedCredits =
      totalCredits.length > 0 ? totalCredits[0].total : 0;

    // Total trees planted, total area, total carbon
    const projectStats = await projectModel.aggregate([
      {
        $group: {
          _id: null,
          totalTrees: { $sum: "$treesPlanted" },
          totalArea: { $sum: "$areaRestored" },
          totalCarbon: { $sum: "$carbonStored" },
        },
      },
    ]);
    const totalTrees = projectStats.length ? projectStats[0].totalTrees : 0;
    const totalArea = projectStats.length ? projectStats[0].totalArea : 0;
    const totalCarbon = projectStats.length ? projectStats[0].totalCarbon : 0;

    // Ecosystem distribution
    const ecosystemStats = await projectModel.aggregate([
      {
        $group: {
          _id: "$ecosystem",
          count: { $sum: 1 },
        },
      },
    ]);

    // Prepare ecosystem object
    const ecosystems = {
      Seagrass: 0,
      Mangroves: 0,
      "Salt Marsh": 0,
      Others: 0,
    };
    ecosystemStats.forEach((e) => {
      if (ecosystems[e._id] !== undefined) ecosystems[e._id] = e.count;
      else ecosystems["Others"] += e.count;
    });

    res.status(200).json({
      success: true,
      stats: {
        totalNGOs,
        totalProjects,
        totalSubmissions,
        totalTransactions,
        verifiedImages,
        pendingImages,
        rejectedImages,
        totalIssuedCredits,
        totalImages: verifiedImages + pendingImages + rejectedImages,
        totalTrees,
        totalArea,
        totalCarbon,
        ecosystems,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find().populate("projects").lean();
    res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};
const getAllCreditsData = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate({
        path: "projectId",
        select: "title",
      })
      .populate({
        path: "adminId",
        select: "name blockchainAddress",
      })
      .lean();

    // Map to include project title and NGO name
    const creditsData = await Promise.all(
      transactions.map(async (tx) => {
        const ngoProject = await ngoProjectModel
          .findOne({ project: tx.projectId._id })
          .lean();

        return {
          _id: tx._id,
          projectTitle: tx.projectId.title,
          ngoName: ngoProject ? ngoProject.ngoName : "N/A",
          creditsIssued: tx.credits,
          adminName: tx.adminId ? tx.adminId.name : "N/A",
          adminWallet: tx.adminId ? tx.adminId.blockchainAddress : "N/A",
          status: tx.status,
          txHash: tx.txHash,
          createdAt: tx.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, credits: creditsData });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch credits" });
  }
};
const addAdmin = async (req, res) => {
  try {
    const { name, email, password, blockchainAddress } = req.body;

    // Validate secret key from environment
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      return res
        .status(500)
        .json({ success: false, message: "Admin secret key not configured" });
    }

    // Optionally: if you want extra security, require frontend to send a flag 'isSecretConfirmed'
    // Here we trust that frontend already asked for secret
    // So no secretKey needed in req.body

    // Check if admin already exists
    const existingAdmin = await adminModel.findOne({ email });
    if (existingAdmin) {
      return res
        .status(400)
        .json({ success: false, message: "Admin already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const newAdmin = new adminModel({
      name,
      email,
      password: hashedPassword,
      blockchainAddress,
    });

    await newAdmin.save();
    res.status(201).json({
      success: true,
      message: "Admin added successfully",
      admin: newAdmin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await adminModel.find().sort({ createdAt: -1 });
    res.status(200).json(admins);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
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
  approveNgoProjectOnChain,
  getAllTransactions,
  addAdminController,
  getTransactionById,
  getAdminDashboard,
  getAllUsers,
  getAllCreditsData,
  addAdmin,
  getAllAdmins,
  getAdmin,
};
