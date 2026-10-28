# CertiChain — Blockchain Certificate Verification

CertiChain is a blockchain-powered certificate registration and verification platform built on Ethereum. It explores how smart contracts and Web3 technologies can help verify the authenticity of digital certificates and improve trust in digital credentials.

**Live Demo:** https://certichain-jade.vercel.app

## Overview

Traditional certificate verification can involve manual checks, delays, and difficulties confirming whether a credential is authentic. CertiChain demonstrates a blockchain-based approach in which certificate hashes are registered and verified using an Ethereum smart contract.

The project is designed to explore transparent, tamper-resistant verification without storing the original certificate document directly on the blockchain.

## Features

- **Certificate verification:** Check whether a certificate hash has been registered on the blockchain.
- **Wallet connectivity:** Connect using a compatible browser wallet or a mobile wallet through QR-based connectivity.
- **Authorized registration:** Restrict certificate registration to the smart contract owner.
- **Blockchain integration:** Interact with a deployed smart contract on the Ethereum Sepolia testnet.
- **Certificate hashing:** Generate a hash from a certificate identifier for blockchain verification.
- **Web-based interface:** Access the application through a browser.

## Technology Stack

- HTML
- CSS
- JavaScript
- Ethereum
- Smart contracts
- Ethers.js
- Ethereum Sepolia testnet
- Wallet connectivity
- Vercel

## Network and Contract

- **Network:** Ethereum Sepolia testnet
- **Contract address:** `0xBcB907E19DD840D1f31908c20094b0BA90Db128B`
- **Chain ID:** `11155111`

The application uses the deployed smart contract to register and verify certificate hashes. Registration requires the connected wallet to match the contract owner's address.

## How to Use

1. Open the [CertiChain live application](https://certichain-jade.vercel.app).
2. Connect a compatible browser wallet or choose the mobile wallet connection option.
3. Switch to the Ethereum Sepolia testnet if prompted.
4. Enter the certificate identifier you want to verify.
5. Submit the verification request and review the result.
6. To register a certificate, connect the authorized contract owner's wallet and follow the registration process.

Registration requires the owner's wallet and may require Sepolia test ETH for transaction fees.

## Running Locally

1. Clone this repository:

   ```bash
   git clone YOUR_GITHUB_REPOSITORY_URL
   ```

2. Open the project folder in VS Code.
3. Open `index.html` in your browser or use the VS Code Live Server extension.
4. Connect a compatible wallet and select Ethereum Sepolia.

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual GitHub repository URL after publishing the project.

## Security Notes

- Never share or commit wallet seed phrases or private keys.
- Do not upload `.env` files containing secrets.
- Certificate hashes can help detect changes, but a hash alone does not establish that a certificate was issued by a legitimate institution.
- This project currently uses a test network and is intended for demonstration and learning, not as a production credential system.

## Future Improvements

- Issuer management and institutional authorization.
- Certificate metadata and issuer details.
- QR-code-based certificate verification.
- Improved transaction feedback and error handling.
- Deployment to a production blockchain network after security review.

## Author

**Samuel Alikali**  
Mechatronics Engineering Student | Web3 Developer in Training

## Disclaimer

CertiChain is an educational project demonstrating blockchain-based certificate registration and verification. It is not an official certification authority.
