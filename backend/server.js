import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./config/mongodb.js";
import userRouter from "./routes/userRouter.js";
const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.get("/", (req, res) => {
  res.send("SIH25038 API is working....");
});
app.use("/api/user", userRouter);

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port ${PORT}`);
});
