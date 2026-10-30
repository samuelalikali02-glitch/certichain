
import "dotenv/config";
import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();

  const [wallet] = await ethers.getSigners();

  const address = wallet.address;
  const balance = await ethers.provider.getBalance(address);

  console.log("\n===== SEPOLIA WALLET DETAILS =====");
  console.log("Wallet Address:", address);
  console.log("Sepolia ETH Balance:", ethers.formatEther(balance), "ETH");
  console.log("==================================\n");
}

main().catch((error) => {
  console.error("Error checking wallet balance:", error);
  process.exitCode = 1;
});
