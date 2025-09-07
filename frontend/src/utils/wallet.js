// utils/wallet.js
import { ethers } from "ethers";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("No Ethereum wallet found. Install MetaMask.");
  }

  // Request accounts
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet connected");
  }

  const provider = new ethers.BrowserProvider(window.ethereum); // ethers v6
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  return { provider, signer, address };
}
