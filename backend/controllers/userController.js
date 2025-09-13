// controllers/userController.js
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import ngoProjectModel from "../models/ngoProjectModel.js";
import projectModel from "../models/projectModel.js";
import imageModel from "../models/imageModel.js";
import { blueCarbonContract } from "../config/blockchain.js";
import SubmissionModel from "../models/submissionModel.js";

// Register User
const registerUser = async (req, res) => {
  try {
    const { name, email, password, walletAddress, ngoLocation } = req.body;

    if (!name || !email || !password || !walletAddress || !ngoLocation) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Details" });
    }

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Enter Valid Email" });
    }

    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return res.status(400).json({
        success: false,
        message: "Email already exists. Please login.",
      });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Enter a strong password" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      walletAddress,
      ngoLocation,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({
        success: false,
        message: "User does not exist. Kindly register",
      });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid Credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get User Profile
const getuserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    if (!userData)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.json({ success: true, userData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Project
const submitProject = async (req, res) => {
  try {
    const { ngoId, ngoName, email, projectData, images } = req.body;

    if (
      !ngoId ||
      !ngoName ||
      !email ||
      !projectData ||
      !images ||
      images.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Incomplete submission data" });
    }

    // 1️⃣ Save Project
    let projectDoc = await projectModel.findOne({
      projectId: projectData.projectId,
    });
    if (!projectDoc) {
      projectDoc = await projectModel.create({
        projectId: projectData.projectId,
        title: projectData.title,
        description: projectData.description,
        location: projectData.location,
        ecosystem: projectData.ecosystem,
        treesPlanted: projectData.treesPlanted,
        areaRestored: projectData.areaRestored,
        carbonStored: projectData.carbonStored,
        ipfsImages: projectData.ipfsImages,
      });
    }

    // 2️⃣ Save Images
    const imageDocs = [];
    for (const img of images) {
      const imageDoc = await imageModel.create({
        projectId: projectDoc._id,
        ipfsHash: img.ipfsHash,
        lat: img.lat,
        lng: img.lng,
        timestamp: img.timestamp,
        onChainIndex: img.onChainIndex,
      });
      imageDocs.push(imageDoc._id);
    }

    // 3️⃣ Save NgoProject
    const ngoProject = await ngoProjectModel.create({
      ngoId,
      ngoName,
      email,
      ngoLocation: projectData.location,
      ngoWallet: projectData.ngoWallet,
      project: projectDoc._id,
      images: imageDocs,
    });

    // ✅ Update user's projects array
    const user = await userModel.findOne({ email: email }); // ngoId = wallet from frontend
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    user.projects.push(ngoProject._id);
    await user.save();

    // 4️⃣ Push to blockchain
    const ipfsHashes = images.map((i) => i.ipfsHash);
    const latitudes = images.map((i) => String(i.lat ?? 0));
    const longitudes = images.map((i) => String(i.lng ?? 0));

    const tx = await blueCarbonContract.submitProject(
      ngoProject.ngoName,
      ngoProject.email,
      projectData.title,
      ipfsHashes,
      latitudes,
      longitudes
    );
    const receipt = await tx.wait();

    // 5️⃣ Capture submissionId from blockchain event
    const event = receipt.logs
      .map((log) => {
        try {
          return blueCarbonContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((e) => e && e.name === "ProjectSubmitted");

    if (event) {
      ngoProject.submissionIdOnChain = Number(event.args.submissionId);
      await ngoProject.save();

      // 6️⃣ Save submission in SubmissionModel
      await SubmissionModel.create({
        submissionIdOnChain: ngoProject.submissionIdOnChain,
        ngoId: ngoProject.ngoId,
        ngoName: ngoProject.ngoName,
        ngoWallet: ngoProject.ngoWallet,
        projectRef: projectDoc._id,
        title: projectData.title,
        description: projectData.description,
        images: imageDocs,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      submissionIdOnChain: ngoProject.submissionIdOnChain,
      txHash: tx.hash,
    });
  } catch (error) {
    console.error("submitProject error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard
const getNgoDashboardData = async (req, res) => {
  try {
    // ✅ extract NGO userId from body (set by userAuth)
    const userId = req.body.userId; // <-- FIXED LINE

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID missing" });
    }

    // ✅ Find user and populate projects → project + images
    const user = await userModel
      .findById(userId)
      .select("-password")
      .populate({
        path: "projects",
        populate: [
          { path: "project" }, // linked project details
          { path: "images" }, // linked images
        ],
      });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const projects = user.projects || [];
    let totalCredits = 0;
    let verified = 0;
    let rejected = 0;
    let pending = 0;

    projects.forEach((proj) => {
      proj.images.forEach((img) => {
        if (img.status === "verified") {
          verified++;
          totalCredits += img.carbonCredits || 0;
        } else if (img.status === "rejected") {
          rejected++;
        } else {
          pending++;
        }
      });
    });

    const stats = {
      totalProjects: projects.length,
      totalImages: verified + rejected + pending,
      verified,
      rejected,
      pending,
      totalCredits,
    };

    return res.json({
      success: true,
      dashboardData: {
        ngoId: user._id,
        ngoName: user.name,
        ngoWallet: user.walletAddress,
        ngoLocation: user.location,
        email: user.email,
        projects,
        stats,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getuserData,
  submitProject,
  getNgoDashboardData,
};
