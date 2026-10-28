
import { network } from "hardhat";

const CONTRACT_ADDRESS = "0xBcB907E19DD840D1f31908c20094b0BA90Db128B";

async function main() {
  const { ethers } = await network.connect({
    network: "sepolia",
  });

  const [signer] = await ethers.getSigners();

  const contract = await ethers.getContractAt(
    "CertificateVerification",
    CONTRACT_ADDRESS,
    signer
  );

  const certificateHash = ethers.keccak256(
    ethers.toUtf8Bytes("CERTIFICATE-001")
  );

  console.log("Wallet:", await signer.getAddress());
  console.log("Certificate hash:", certificateHash);

  const alreadyRegistered =
    await contract.verifyCertificate(certificateHash);

  if (!alreadyRegistered) {
    const tx = await contract.registerCertificate(certificateHash);
    console.log("Transaction submitted:", tx.hash);

    await tx.wait();
    console.log("Certificate registered successfully!");
  } else {
    console.log("Certificate is already registered.");
  }

  const verified = await contract.verifyCertificate(certificateHash);
  console.log("Certificate verified:", verified);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
