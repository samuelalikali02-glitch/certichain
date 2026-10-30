<<<<<<< HEAD
# CertiChain — Blockchain Certificate Verification

CertiChain is an Ethereum-based certificate registration and verification platform. It demonstrates how blockchain technology and smart contracts can help verify digital certificate authenticity.

**Live Demo:** https://certichain-jade.vercel.app
=======
# CertiChain V2 — Blockchain-Based Certificate Verification

CertiChain is a Web3 certificate registration and verification platform built on Ethereum. It uses smart contracts, SHA-256 document hashing, and IPFS to support transparent and tamper-evident certificate verification.

**Project Status:** Working prototype on Ethereum Sepolia testnet.
>>>>>>> feature/document-verification

## Problem
Traditional certificate verification can involve manual checks, delays and difficulties confirming whether a credential is authentic.

<<<<<<< HEAD
## Solution
CertiChain uses certificate hashing and Ethereum smart contracts to provide a transparent, tamper-resistant method of checking registered certificate records.

## Features
- Certificate hash registration.
- Blockchain-based certificate verification.
- Ethereum wallet connectivity.
- Owner-authorised certificate registration.
- QR-based mobile wallet connectivity.
- Sepolia testnet integration.

## Technology Stack
- Solidity and Ethereum
- Hardhat
- JavaScript
- Ethers.js
- HTML and CSS
- Ethereum Sepolia
- Vercel

## Network Details
- Network: Ethereum Sepolia
- Chain ID: 11155111
- Contract: `0xBcB907E19DD840D1f31908c20094b0BA90Db128B`

## Future Improvements
- Institutional issuer registration and authorisation.
- QR-code certificate verification.
- Certificate revocation.
- Non-transferable digital credentials.
- Improved security and user experience.

## Security
Never share wallet private keys or seed phrases. This project is currently an educational demonstration on a test network, not an official certification authority.

## Author
Samuel Alikali Ojima-Ojo  
Mechatronics Engineering Student | Web3 Developer in Training

GitHub: https://github.com/samuelalikali02-glitch
=======
Traditional certificate verification can involve manual processes, delays, and difficulties confirming document authenticity.

CertiChain V2 provides a blockchain-based approach:

1. An authorized institution uploads a certificate.
2. The application calculates its SHA-256 hash.
3. The original document is uploaded to IPFS through Pinata.
4. The certificate hash and issuer information are registered on Ethereum.
5. Anyone can verify a document by uploading it and comparing its hash against the blockchain record.

The original certificate document is not stored directly on the blockchain.

## Key Features

- **Document verification:** Verify PDF, PNG, and JPEG certificates using SHA-256 hashing.
- **IPFS storage:** Store original certificate documents using Pinata.
- **Blockchain registration:** Record certificate hashes on Ethereum.
- **Institution authorization:** Allow the contract administrator to authorize or remove institutions.
- **Access control:** Restrict registration to the contract owner and authorized institutions.
- **Certificate revocation:** Allow the owner or original issuer to revoke a certificate.
- **Metadata storage:** Store supporting certificate information in a local SQLite database.
- **Wallet connectivity:** Connect using compatible Web3 wallets.

## Technology Stack

- Solidity
- Ethereum Sepolia testnet
- Hardhat 3
- Ethers.js 6
- JavaScript, HTML and CSS
- Node.js and Express.js
- Pinata and IPFS
- SQLite and better-sqlite3
- MetaMask / WalletConnect
- Vercel

## Smart Contract Deployment

**Network:** Ethereum Sepolia  
**Chain ID:** `11155111`

**V2 Contract Address:**

`0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f`

[View V2 Contract on Etherscan](https://sepolia.etherscan.io/address/0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f)

## Architecture

The application consists of three main components:

1. **Frontend:** Provides wallet connectivity, certificate registration, and verification.
2. **Smart contract:** Handles certificate hashes, issuer permissions, and revocation on Ethereum.
3. **Backend:** Handles document uploads to IPFS and certificate metadata storage in SQLite.

## Running Locally

### Requirements

- Node.js and npm
- Git
- A compatible Ethereum wallet
- Sepolia test ETH
- A Pinata account

### 1. Clone the repository

```bash
git clone https://github.com/samuelalikali02-glitch/certichain.git
cd certichain
git checkout feature/document-verification
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=your_pinata_gateway
PORT=3000
```

Keep your actual credentials private. Never commit your `.env` file.

### 4. Start the backend

```bash
node server.cjs
```

The backend runs at:

`http://localhost:3000`

### 5. Start the frontend

Open `public/index.html` using VS Code Live Server.

Ensure the frontend API URLs point to your running backend.

### 6. Connect your wallet

- Select Ethereum Sepolia.
- Connect your wallet.
- Use the contract owner or an authorized institution for certificate registration.
- Use a separate wallet to test unauthorized registration restrictions.

## Testing

The V2 smart contract test suite includes checks for:

- Certificate registration.
- Certificate verification.
- Duplicate registration restrictions.
- Institution authorization and removal.
- Access control.
- Certificate revocation.

The V2 test suite previously completed with 11 passing tests.

## Security and Privacy

- Never publish private keys, seed phrases, or API credentials.
- Keep `.env` and local database files out of Git.
- IPFS documents may be publicly accessible. Do not upload real certificates containing personal information without an appropriate privacy and access-control model.
- A document hash confirms whether a document matches a registered record; it does not independently prove that the issuing institution is legitimate.
- This project is a testnet prototype and has not been presented as a production-ready credential system.

## Future Development

- Deploy the backend to a secure hosting provider.
- Implement wallet-signature-based backend authentication.
- Improve document privacy and access controls.
- Add QR-code certificate verification.
- Expand institutional onboarding.
- Conduct independent smart contract and backend security reviews.

## Author

**Samuel Alikali**  
Final-Year Mechatronics Engineering Student  
Web3 and Blockchain Development

GitHub: https://github.com/samuelalikali02-glitch

Portfolio: https://samuelalikali02-glitch.github.io/#projects

## Disclaimer

CertiChain is an educational and experimental project demonstrating blockchain-based certificate registration and verification. It is not an official certification authority.
>>>>>>> feature/document-verification
