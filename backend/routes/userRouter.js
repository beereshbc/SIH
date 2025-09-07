import express from "express";
import {
  getuserData,
  loginUser,
  registerUser,
  submitProject,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.get("/user", getuserData);
userRouter.post("/projects", submitProject);

export default userRouter;
