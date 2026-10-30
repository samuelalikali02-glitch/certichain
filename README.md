# CertiChain — Blockchain Certificate Verification Platform

CertiChain is an Ethereum-based certificate registration and verification platform designed to improve the authenticity, integrity and transparency of digital credentials.

The project has evolved from its initial blockchain certificate registration system (V1) into CertiChain V2, which introduces document uploads, institutional authorization, backend authentication and certificate metadata management.

## Project Overview

Traditional certificate verification often involves manual checks, delays and difficulties confirming whether a credential is authentic.

CertiChain addresses this challenge by combining cryptographic hashing, Ethereum smart contracts and decentralized file storage to provide a tamper-resistant certificate verification system.

## Features

### V1 — Core Blockchain Verification
- Certificate hash registration.
- Blockchain-based certificate verification.
- Ethereum wallet connectivity.
- Owner-authorized certificate registration.
- QR-based mobile wallet connectivity.
- Ethereum Sepolia testnet integration.

### V2 — Enhanced Document Verification
- Secure wallet-based authentication using signed challenges.
- Administrator and authorized institution access.
- Certificate document uploads.
- SHA-256 document hashing.
- IPFS storage through Pinata.
- On-chain certificate hash registration.
- Certificate metadata management.
- Certificate verification and revocation.
- Public certificate verification.
- Backend authorization for protected operations.

## Technology Stack

- Solidity and Ethereum
- Hardhat
- JavaScript
- Ethers.js
- Node.js and Express.js
- HTML and CSS
- SQLite (V2 development database)
- Pinata and IPFS
- Ethereum Sepolia
- Vercel

## Blockchain Network

Network: Ethereum Sepolia  
Chain ID: 11155111

### V1 Smart Contract
`0xBcB907E19DD840D1f31908c20094b0BA90Db128B`

### V2 Smart Contract
`0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f`

## Security

- Wallet authentication uses cryptographic message signatures.
- Protected backend operations require authorization.
- Certificate hashes are recorded on the blockchain.
- Document integrity can be checked by comparing hashes.
- Private keys and wallet recovery phrases must never be shared.

**Important:** CertiChain is currently an educational and development project operating on the Ethereum Sepolia test network. It is not an official certification authority. Documents uploaded to IPFS may be publicly accessible; sensitive documents should not be uploaded without appropriate privacy protections.

## Future Improvements

- Production-ready institutional onboarding.
- Encrypted document storage and access control.
- Improved authentication and session management.
- Migration to a managed production database.
- QR-code certificate verification.
- Enhanced user interface and accessibility.
- Mainnet deployment after security testing.

## Author

**Samuel Alikali Ojima-Ojo**  
Final-Year Mechatronics Engineering Student | Web3 Developer in Training

GitHub: https://github.com/samuelalikali02-glitch

GitHub Repository: https://github.com/samuelalikali02-glitch/certichain
