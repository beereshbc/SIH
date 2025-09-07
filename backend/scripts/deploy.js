// scripts/deploy.js
import fs from "fs";
import path from "path";
import hardhat from "hardhat";

const { ethers, run } = hardhat;

async function main() {
  await run("compile");

  console.log("🚀 Deploying BlueCarbon contract...");
  const Contract = await ethers.getContractFactory("BlueCarbon");
  const contract = await Contract.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log(`✅ BlueCarbon deployed to: ${address}`);

  // Prepare data for frontend
  const data = {
    address,
    abi: JSON.parse(contract.interface.formatJson()),
  };

  // Correct Windows path (forward slashes work cross-platform)
  const frontendDir = path.resolve(
    "C:/Users/User/OneDrive/Desktop/Beeresh/SIH/SIH25038/frontend/src/abi"
  );

  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  fs.writeFileSync(
    path.join(frontendDir, "BlueCarbon.json"),
    JSON.stringify(data, null, 2),
    "utf-8"
  );

  console.log(`📂 ABI + address exported to frontend/src/abi/BlueCarbon.json`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
