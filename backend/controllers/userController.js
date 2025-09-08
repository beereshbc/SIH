import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import ngoProjectModel from "../models/ngoProjectModel.js";
import projectModel from "../models/projectModel.js";
import imageModel from "../models/imageModel.js";

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    //check details are enterd or not
    if (!name || !password || !email) {
      return res.json({ success: false, message: "Missing Details" });
    }

    //validating email id
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter Valid Email" });
    }
    const isEmailExist = await userModel.findOne({ email });
    if (isEmailExist) {
      return res.json({
        success: false,
        message: "Email is Already existed please Login",
      });
    }

    // validating strong password
    if (password.length < 8) {
      return res.json({ success: false, message: "Enter A Strong Password" });
    }

    //hashing the user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email,
      password: hashedPassword,
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for user login

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({
        success: false,
        message: "User does not Exist kindly register",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid Credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get user profile data

const getuserData = async (req, res) => {
  try {
    const { userId } = req.body;
    const userData = await userModel.findById(userId).select("-password");

    res.json({ success: true, userData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const submitProject = async (req, res) => {
  try {
    const {
      ngoId,
      ngoName,
      ngoLocation,
      email,
      walletAddress,
      project,
      images,
    } = req.body;

    // 1️⃣ Validate required fields
    if (
      !ngoId ||
      !ngoName ||
      !ngoLocation ||
      !email ||
      !project ||
      !project.projectId ||
      !images ||
      !images.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields including ngoLocation, projectId or images",
      });
    }

    // 2️⃣ Prevent duplicate projectId for the same NGO
    const existing = await ngoProjectModel.findOne({
      ngoId,
      "project.projectId": project.projectId,
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "This NGO has already submitted this projectId",
      });
    }

    // 3️⃣ Normalize project numeric fields
    const safeProject = {
      ...project,
      treesPlanted: Number(project.treesPlanted) || 0,
      areaRestored: Number(project.areaRestored) || 0,
      carbonStored: Number(project.carbonStored) || 0,
      ipfsImages: [],
    };

    // 4️⃣ Save Project document
    const projectDoc = new projectModel(safeProject);
    const savedProject = await projectDoc.save();

    // 5️⃣ Save Image documents (link to projectId)
    const savedImages = [];
    const ipfsHashes = [];
    for (let img of images) {
      const imgDoc = new imageModel({
        projectId: savedProject._id,
        ipfsHash: img.ipfsHash,
        lat: Number(img.lat) || 0,
        lng: Number(img.lng) || 0,
        timestamp: img.timestamp ? new Date(img.timestamp) : new Date(),
        gpsError: img.gpsError || null,
        status: "pending", // default
      });
      const savedImg = await imgDoc.save();
      savedImages.push(savedImg);
      ipfsHashes.push(img.ipfsHash);
    }

    // 6️⃣ Update Project with IPFS image hashes
    savedProject.ipfsImages = ipfsHashes;
    await savedProject.save();

    // 7️⃣ Save NGOProject linking NGO ↔ Project ↔ Images
    const ngoProjectDoc = new ngoProjectModel({
      ngoId,
      ngoName,
      ngoLocation,
      email,
      walletAddress: walletAddress || null,
      project: savedProject._id,
      images: savedImages.map((img) => img._id),
      submittedAt: new Date(),
    });

    const ngoProject = await ngoProjectDoc.save();

    // 8️⃣ 🔗 Link NGOProject to User
    await userModel.findOneAndUpdate(
      { email }, // find user by email
      { $push: { projects: ngoProject._id } }, // add ngoProject ref
      { new: true }
    );

    // 9️⃣ Response
    res.status(201).json({
      success: true,
      message: "Project submitted successfully",
      data: {
        ngoProject,
        project: savedProject,
        images: savedImages,
      },
    });
  } catch (err) {
    console.error("Submit Project Error:", err);

    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Duplicate projectId detected. Each projectId must be unique.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal Server Error: " + err.message,
    });
  }
};

const getNgoDashboardData = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.json({ success: false, message: "NGO/User Not found" });
    }

    const user = await userModel
      .findById(userId)
      .select("-password")
      .populate({
        path: "projects",
        populate: { path: "images" },
      });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    res.json({ success: true, dashboardData: user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export {
  registerUser,
  loginUser,
  getuserData,
  submitProject,
  getNgoDashboardData,
};
