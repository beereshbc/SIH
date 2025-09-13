// routes/adminRouter.js
import express from "express";
import {
  adminLogin,
  adminSignup,
  getImages,
  getNgoProjects,
  getProjects,
  approveImageController,
  getTransactionByImageId,
  getOnChainImage,
  approveNgoProjectOnChain,
  rejectImageController, // ✅ import new function
} from "../controllers/adminController.js";
import adminAuth from "../middlewares/adminAuth.js";

const adminRouter = express.Router();

// Auth routes
adminRouter.post("/login", adminLogin);
adminRouter.post("/signup", adminSignup);

// Protected routes
adminRouter.get("/ngo-projects", adminAuth, getNgoProjects);
adminRouter.post("/projects", adminAuth, getProjects);
adminRouter.post("/images", adminAuth, getImages);
adminRouter.post("/images/reject", adminAuth, rejectImageController);
adminRouter.post("/images/approve", adminAuth, approveImageController);

// ✅ Bulk approve NGO project (off-chain → on-chain)
adminRouter.post(
  "/projects/approve-onchain",
  adminAuth,
  approveNgoProjectOnChain
);

// Transaction & on-chain getters
adminRouter.get(
  "/transaction/image/:imageId",
  adminAuth,
  getTransactionByImageId
);
adminRouter.get("/onchain/image", adminAuth, getOnChainImage);

export default adminRouter;
