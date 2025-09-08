import express from "express";
import {
  getNgoDashboardData,
  getuserData,
  loginUser,
  registerUser,
  submitProject,
} from "../controllers/userController.js";
import userAuth from "../middlewares/userAuth.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/user", getuserData);
userRouter.post("/projects", submitProject);
userRouter.post("/dashData", userAuth, getNgoDashboardData);

export default userRouter;
