import express from "express";
import {
  getNgoDashboardData,
  getUserProfile,
  loginUser,
  registerUser,
  submitProject,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/projects", submitProject);
userRouter.post("/dashData", userAuth, getNgoDashboardData);
userRouter.get("/profile", userAuth, getUserProfile);

export default userRouter;
