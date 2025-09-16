// utils/wallet.js
import { ethers } from "ethers";
import toast from "react-hot-toast";

let isConnecting = false;

export async function connectWallet() {
  if (isConnecting) {
    toast("⏳ Wallet connection already in progress...");
    return;
  }
  isConnecting = true;

  try {
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

    toast.success("✅ Wallet connected");
    return { provider, signer, address };
  } catch (error) {
    if (error.code === -32002) {
      toast.error("⚠️ MetaMask request already pending. Check the popup.");
    } else {
      toast.error(error.message || "Wallet connection failed");
      console.error(error);
    }
  } finally {
    isConnecting = false;
  }
}
