import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load BlueCarbon ABI + address
const blueCarbonPath = path.resolve(__dirname, "../abi/BlueCarbon.json");
if (!fs.existsSync(blueCarbonPath))
  throw new Error(`❌ BlueCarbon.json not found at ${blueCarbonPath}`);
const blueCarbonJson = JSON.parse(fs.readFileSync(blueCarbonPath, "utf-8"));

// ✅ Load ERC20 (BCT) ABI + address
const bctPath = path.resolve(__dirname, "../abi/BCT.json");
if (!fs.existsSync(bctPath))
  throw new Error(`❌ BCT.json not found at ${bctPath}`);
const bctJson = JSON.parse(fs.readFileSync(bctPath, "utf-8"));

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

// ✅ BlueCarbon contract instance
const blueCarbonContract = new ethers.Contract(
  blueCarbonJson.address,
  blueCarbonJson.abi,
  wallet
);

// ✅ ERC20 token contract instance
const tokenContract = new ethers.Contract(bctJson.address, bctJson.abi, wallet);

// ---------------- Helper Functions ----------------

// Approve image on-chain
const approveImageOnChain = async (
  contract,
  signer,
  submissionId,
  imageIndex,
  credits
) => {
  try {
    const tx = await contract.approveImage(submissionId, imageIndex, credits);
    await tx.wait(); // Wait for confirmation
    console.log(`✅ Image approved on-chain. TxHash: ${tx.hash}`);
    return tx;
  } catch (error) {
    console.error("❌ approveImageOnChain failed:", error);
    throw error;
  }
};

// Send ERC20 tokens to recipient
const sendTokens = async (
  tokenContract,
  senderWallet,
  recipientAddress,
  amount
) => {
  try {
    const decimals = await tokenContract.decimals();
    const tx = await tokenContract.transfer(
      recipientAddress,
      ethers.parseUnits(amount.toString(), decimals)
    );
    await tx.wait();
    console.log(
      `✅ Sent ${amount} tokens to ${recipientAddress}. TxHash: ${tx.hash}`
    );
    return tx;
  } catch (error) {
    console.error("❌ sendTokens failed:", error);
    throw error;
  }
};

console.log("✅ BlueCarbon contract ready:", blueCarbonJson.address);
console.log("✅ ERC20 (BCT) contract ready:", bctJson.address);

export {
  provider,
  wallet,
  blueCarbonContract,
  tokenContract,
  approveImageOnChain,
  sendTokens,
};
