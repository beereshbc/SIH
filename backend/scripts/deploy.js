import fs from "fs";
import path from "path";
import hardhat from "hardhat";

const { ethers, run } = hardhat;

async function main() {
  await run("compile");

  // ---------------- 1️⃣ Deploy ERC20 token (BCT) ----------------
  console.log("🚀 Deploying ERC20 token...");
  const Token = await ethers.getContractFactory("MyToken");
  const initialSupply = ethers.parseUnits("1000000", 18); // 1,000,000 BCT
  const token = await Token.deploy(initialSupply);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log(`✅ ERC20 token deployed to: ${tokenAddress}`);

  // ---------------- 2️⃣ Deploy BlueCarbon contract ----------------
  console.log("🚀 Deploying BlueCarbon contract...");
  const BlueCarbon = await ethers.getContractFactory("BlueCarbon");
  const blueCarbon = await BlueCarbon.deploy(tokenAddress);
  await blueCarbon.waitForDeployment();
  const blueCarbonAddress = await blueCarbon.getAddress();
  console.log(`✅ BlueCarbon deployed to: ${blueCarbonAddress}`);

  // ---------------- 3️⃣ Fund BlueCarbon with tokens ----------------
  console.log("💰 Funding BlueCarbon contract...");
  const fundTx = await token.transfer(
    blueCarbonAddress,
    ethers.parseUnits("500000", 18) // Fund with 500,000 BCT
  );
  await fundTx.wait();
  console.log("✅ Funded BlueCarbon with 500,000 BCT");

  // ---------------- 4️⃣ Export ABI + address JSON ----------------
  const contracts = [
    { name: "BlueCarbon", contract: blueCarbon, address: blueCarbonAddress },
    { name: "BCT", contract: token, address: tokenAddress },
  ];

  const basePaths = ["frontend/src/abi", "admin/src/abi", "backend/abi"];

  contracts.forEach(({ name, contract, address }) => {
    const data = {
      address,
      abi: JSON.parse(contract.interface.formatJson()),
    };

    basePaths.forEach((dirPath) => {
      const fullDir = path.resolve(
        `C:/Users/User/OneDrive/Desktop/Beeresh/SIH/SIH25038/${dirPath}`
      );
      if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

      fs.writeFileSync(
        path.join(fullDir, `${name}.json`),
        JSON.stringify(data, null, 2),
        "utf-8"
      );
      console.log(`📂 ${name}.json exported to ${dirPath}`);
    });
  });

  console.log("🎉 Deployment finished successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
