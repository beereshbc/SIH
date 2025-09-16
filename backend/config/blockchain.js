// backend/config/blockchain.js
import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// ✅ ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load ABI
const blueCarbonPath = path.resolve(__dirname, "../abi/BlueCarbon.json");
if (!fs.existsSync(blueCarbonPath))
  throw new Error(`❌ BlueCarbon.json not found at ${blueCarbonPath}`);

const blueCarbonJson = JSON.parse(fs.readFileSync(blueCarbonPath, "utf-8"));
if (!blueCarbonJson?.address || !Array.isArray(blueCarbonJson?.abi))
  throw new Error("❌ BlueCarbon.json missing address or ABI");

// ✅ Provider
if (!process.env.SEPOLIA_URL && !process.env.RPC_URL)
  throw new Error("❌ RPC URL missing in .env (SEPOLIA_URL or RPC_URL)");
const provider = new ethers.JsonRpcProvider(
  process.env.SEPOLIA_URL || process.env.RPC_URL
);

// ✅ Wallet / Signer
if (!process.env.PRIVATE_KEY)
  throw new Error(
    "❌ PRIVATE_KEY missing in .env. Cannot send transactions without it."
  );
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

// ✅ Contract instance
const blueCarbonContract = new ethers.Contract(
  blueCarbonJson.address,
  blueCarbonJson.abi,
  wallet
);

// ✅ Debug check
if (!blueCarbonContract.approveImage) {
  throw new Error("❌ approveImage function not found in contract ABI!");
}
console.log("✅ BlueCarbon contract ready:", blueCarbonJson.address);

export { provider, wallet, blueCarbonContract };
