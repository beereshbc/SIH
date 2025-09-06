import hre from "hardhat";

async function main() {
  // Get the contract factory
  const IPFShashStorage = await hre.ethers.getContractFactory(
    "IPFShashStorage"
  );

  // Deploy the contract (ethers v6 returns deployed contract immediately)
  const ipfsStorage = await IPFShashStorage.deploy();

  // No need to call deployed() in ethers v6
  console.log("Contract deployed to:", ipfsStorage.target); // .target contains the address in v6
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
