// scripts/syncOnChain.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ethers } from "ethers";

import ngoProjectModel from "../models/ngoProjectModel.js";
import imageModel from "../models/imageModel.js";
import blueCarbonAbi from "../artifacts/contracts/BlueCarbon.sol/BlueCarbon.json" assert { type: "json" };

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const wallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);
const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  blueCarbonAbi.abi,
  wallet
);

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to DB");

  const projectCount = await contract.submissionCount();
  console.log(`📦 On-chain submissions: ${projectCount.toString()}`);

  for (let id = 1; id <= projectCount; id++) {
    try {
      const sub = await contract.submissions(id);
      if (!sub.active) continue;

      console.log(`🔎 Syncing submission ${id}...`);

      // find project in DB
      const project = await ngoProjectModel.findOne({
        submissionIdOnChain: id,
      });
      if (!project) {
        console.warn(`⚠️ No DB project for submission ${id}`);
        continue;
      }

      // update project fields if needed
      project.submissionIdOnChain = id;
      await project.save();

      // now sync images
      const imageCount = await contract.getSubmissionImageCount(id);
      console.log(`   → ${imageCount.toString()} images on-chain`);

      for (let imgIndex = 0; imgIndex < imageCount; imgIndex++) {
        const imgOnChain = await contract.getSubmissionImage(id, imgIndex);

        // find in DB by ipfsHash
        const img = await imageModel.findOne({
          ipfsHash: imgOnChain.ipfsHash,
          projectId: project._id,
        });

        if (img) {
          img.onChainIndex = imgIndex;
          await img.save();
          console.log(`      ✅ Synced image ${img._id} → index ${imgIndex}`);
        } else {
          console.warn(`      ⚠️ No DB record for image index ${imgIndex}`);
        }
      }
    } catch (err) {
      console.error(`❌ Error syncing submission ${id}:`, err.message);
    }
  }

  console.log("✨ Sync complete");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal sync error:", err);
  process.exit(1);
});
