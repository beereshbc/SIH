// routes/adminRouter.js
import express from "express";
import {
  adminLogin,
  adminSignup,
  getImages,
  getNgoProjects,
  getProjects,
  approveImageController,
  approveNgoProjectOnChain,
  rejectImageController,
  addAdminController,
  getAllTransactions,
  getTransactionById,
  getAdminDashboard,
  getAllUsers,
  getAllCreditsData,
  addAdmin,
  getAllAdmins,
  getAdmin,
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
adminRouter.post("/add-admin", adminAuth, addAdminController);
adminRouter.get("/transaction/:id", adminAuth, getTransactionById);
adminRouter.get("/dashboard", adminAuth, getAdminDashboard);
adminRouter.get("/users", adminAuth, getAllUsers);
adminRouter.get("/credits", adminAuth, getAllCreditsData);
adminRouter.post("/add-admin", adminAuth, addAdmin);
adminRouter.get("/admins", adminAuth, getAllAdmins);
adminRouter.get("/admin", adminAuth, getAdmin);
// ✅ Bulk approve NGO project (off-chain → on-chain)
adminRouter.post(
  "/projects/approve-onchain",
  adminAuth,
  approveNgoProjectOnChain
);
adminRouter.get("/transactions", getAllTransactions);
adminRouter.post("/approve-image", adminAuth, approveImageController);

export default adminRouter;
