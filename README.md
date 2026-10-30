# CertiChain — Blockchain-Based Certificate Verification

CertiChain is an Ethereum-based certificate registration and verification platform designed to improve the authenticity, integrity, and transparency of digital credentials.

The project has evolved from its initial blockchain certificate registration system (V1) into CertiChain V2, which introduces document uploads, institutional authorization, backend authentication, IPFS storage, and certificate metadata management.

**Project Status:** Working prototype on the Ethereum Sepolia testnet.

## Project Overview

Traditional certificate verification can involve manual processes, delays, and difficulties confirming document authenticity.

CertiChain addresses this challenge by combining cryptographic hashing, Ethereum smart contracts, and decentralized file storage.

The system calculates a SHA-256 hash of a certificate and records that hash on the Ethereum blockchain. A document can later be checked against its registered hash to determine whether it matches the original record.

The original certificate document is not stored directly on the blockchain.

## Project Versions

### V1 — Core Blockchain Verification

- Certificate hash registration.
- Blockchain-based certificate verification.
- Ethereum wallet connectivity.
- Owner-authorized certificate registration.
- QR-based mobile wallet connectivity.
- Ethereum Sepolia testnet integration.

### V2 — Enhanced Document Verification

- Certificate document uploads.
- SHA-256 document hashing.
- IPFS storage through Pinata.
- On-chain certificate hash registration.
- Wallet authentication using signed challenges.
- Administrator and authorized institution access.
- Certificate metadata management.
- Certificate verification and revocation.
- Public certificate verification.
- Protected backend operations.

## How CertiChain V2 Works

1. An authorized institution uploads a certificate.
2. The application calculates its SHA-256 hash.
3. The document is uploaded to IPFS through Pinata.
4. The certificate hash is registered on Ethereum.
5. Supporting certificate information is saved in the backend database.
6. Anyone can verify a document by uploading it and comparing its hash against the blockchain record.

## Technology Stack

- Solidity and Ethereum
- Hardhat
- JavaScript
- Ethers.js
- Node.js and Express.js
- HTML and CSS
- SQLite and better-sqlite3
- Pinata and IPFS
- Ethereum Sepolia
- Vercel

## Blockchain Network

**Network:** Ethereum Sepolia  
**Chain ID:** `11155111`

### V1 Smart Contract

`0xBcB907E19DD840D1f31908c20094b0BA90Db128B`

### V2 Smart Contract

`0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f`

[View V2 Smart Contract on Etherscan](https://sepolia.etherscan.io/address/0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f)

## Architecture

The application consists of three main components:

1. **Frontend:** Provides wallet connectivity, certificate registration, and verification.
2. **Smart contract:** Handles certificate hashes, issuer permissions, and revocation on Ethereum.
3. **Backend:** Handles document uploads to IPFS, authentication, and certificate metadata storage.

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
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and configure the required credentials:

```env
PINATA_JWT=your_pinata_jwt
PINATA_GATEWAY=your_pinata_gateway
AUTH_TOKEN_SECRET=your_long_random_secret
PORT=3000
```

Use your own credentials and a strong authentication secret. Never commit your `.env` file or share private credentials.

### 4. Start the backend

```bash
node server.cjs
```

The backend runs at:

`http://localhost:3000`

### 5. Start the frontend

Serve the `public` folder locally, for example:

```bash
npx.cmd http-server public -p 8080
```

Open:

`http://127.0.0.1:8080`

Ensure the frontend API URLs point to the backend you are running.

### 6. Connect your wallet

- Select Ethereum Sepolia.
- Connect your wallet.
- Use the contract owner or an authorized institution for certificate registration.
- Use a separate wallet to test unauthorized registration restrictions.

## Testing

The V2 smart contract test suite previously completed with 11 passing tests.

Test coverage includes:

- Certificate registration.
- Certificate verification.
- Duplicate registration restrictions.
- Institution authorization and removal.
- Access control.
- Certificate revocation.

## Security and Privacy

- Wallet authentication uses cryptographic message signatures.
- Protected backend operations require authorization.
- Certificate hashes are recorded on the blockchain.
- Document integrity can be checked by comparing hashes.
- Never publish private keys, seed phrases, or API credentials.
- Keep `.env` and local database files out of Git.
- IPFS documents may be publicly accessible. Do not upload real certificates containing personal information without appropriate privacy protections.
- A document hash confirms whether a document matches a registered record; it does not independently prove that the issuing institution is legitimate.

## Future Development

- Production-ready institutional onboarding.
- Encrypted document storage and access control.
- Improved authentication and session management.
- Migration to a managed production database.
- QR-code certificate verification.
- Enhanced user interface and accessibility.
- Independent smart contract and backend security reviews.
- Mainnet deployment after security testing.

## Author

**Samuel Alikali Ojima-Ojo**  
Final-Year Mechatronics Engineering Student  
Web3 and Blockchain Development

GitHub: [https://github.com/samuelalikali02-glitch](https://github.com/samuelalikali02-glitch)

Portfolio: [https://samuelalikali02-glitch.github.io/#projects](https://samuelalikali02-glitch.github.io/#projects)

## Disclaimer

CertiChain is an educational and experimental project demonstrating blockchain-based certificate registration and verification. It is currently operating on the Ethereum Sepolia test network and is not an official certification authority.
