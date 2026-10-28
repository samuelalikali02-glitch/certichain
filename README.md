<<<<<<< HEAD
# Sample Hardhat 3 Project (`mocha` and `ethers`)

This project showcases a Hardhat 3 project using `mocha` for tests and the `ethers` library for Ethereum interactions.

To learn more about Hardhat 3, please visit the [Getting Started guide](https://hardhat.org/docs/getting-started#getting-started-with-hardhat-3). To share your feedback, join our [Hardhat 3](https://hardhat.org/hardhat3-telegram-group) Telegram group or [open an issue](https://github.com/NomicFoundation/hardhat/issues/new) in our GitHub issue tracker.

## Project Overview

This example project includes:

- A simple Hardhat configuration file.
- Foundry-compatible Solidity unit tests.
- TypeScript integration tests using `mocha` and ethers.js
- Examples demonstrating how to connect to different types of networks, including locally simulating OP mainnet.

## Usage

### Running Tests

To run all the tests in the project, execute the following command:

```shell
npx hardhat test
```

You can also selectively run the Solidity or `mocha` tests:

```shell
npx hardhat test solidity
npx hardhat test mocha
```

### Make a deployment to Sepolia

This project includes an example Ignition module to deploy the contract. You can deploy this module to a locally simulated chain or to Sepolia.

To run the deployment to a local chain:

```shell
npx hardhat ignition deploy ignition/modules/Counter.ts
```

To run the deployment to Sepolia, you need an account with funds to send the transaction. The provided Hardhat configuration includes a Configuration Variable called `SEPOLIA_PRIVATE_KEY`, which you can use to set the private key of the account you want to use.

You can set the `SEPOLIA_PRIVATE_KEY` variable using the `hardhat-keystore` plugin or by setting it as an environment variable.

To set the `SEPOLIA_PRIVATE_KEY` config variable using `hardhat-keystore`:

```shell
npx hardhat keystore set SEPOLIA_PRIVATE_KEY
```

After setting the variable, you can run the deployment with the Sepolia network:

```shell
npx hardhat ignition deploy --network sepolia ignition/modules/Counter.ts
```
=======
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
>>>>>>> 44bc52d29937ff944dde80ca819b2291d3d83d94
