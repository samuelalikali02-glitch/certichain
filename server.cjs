
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PinataSDK } = require("pinata");
const Database = require("better-sqlite3");
const { ethers } = require("ethers");
const crypto = require("crypto");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// CONFIGURATION
// --------------------------------------------------

const CONTRACT_ADDRESS =
  "0xb5d3027B91c48f2073e83367ADF6eB7cDfb50c8f";

const SEPOLIA_CHAIN_ID = 11155111n;

const PUBLIC_RPC =
  "https://ethereum-sepolia-rpc.publicnode.com";

const AUTH_TOKEN_SECRET = process.env.AUTH_TOKEN_SECRET;

if (!AUTH_TOKEN_SECRET || AUTH_TOKEN_SECRET.length < 32) {
  throw new Error("AUTH_TOKEN_SECRET is missing or too short.");
}

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT is missing from .env.");
}

if (!process.env.PINATA_GATEWAY) {
  throw new Error("PINATA_GATEWAY is missing from .env.");
}

const ABI = [
  "function owner() view returns (address)",
  "function authorizedInstitutions(address) view returns (bool)",
  "function verifyCertificate(bytes32) view returns (bool exists, bool revoked, address issuer, uint256 registeredAt)",
  "event CertificateRegistered(bytes32 indexed documentHash, address indexed issuer, uint256 registeredAt)"
];

const provider = new ethers.JsonRpcProvider(PUBLIC_RPC);

const contract = new ethers.Contract(
  CONTRACT_ADDRESS,
  ABI,
  provider
);

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY
});

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

const allowedOrigins = new Set([
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "https://certichain-jade.vercel.app"
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Origin not allowed by CORS."));
  }
}));

app.use(express.json({ limit: "1mb" }));

// --------------------------------------------------
// SQLITE DATABASE
// --------------------------------------------------

const db = new Database(
  path.join(__dirname, "certichain.db")
);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    document_hash TEXT PRIMARY KEY,
    ipfs_cid TEXT NOT NULL,
    file_name TEXT NOT NULL,
    issuer TEXT NOT NULL,
    transaction_hash TEXT NOT NULL,
    registered_at TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

const saveMetadata = db.prepare(`
  INSERT INTO certificates (
    document_hash,
    ipfs_cid,
    file_name,
    issuer,
    transaction_hash,
    registered_at
  )
  VALUES (
    @documentHash,
    @ipfsCid,
    @fileName,
    @issuer,
    @transactionHash,
    @registeredAt
  )
`);

const getMetadata = db.prepare(`
  SELECT
    document_hash AS documentHash,
    ipfs_cid AS ipfsCid,
    file_name AS fileName,
    issuer,
    transaction_hash AS transactionHash,
    registered_at AS registeredAt
  FROM certificates
  WHERE lower(document_hash) = lower(?)
`);

const findMetadata = db.prepare(`
  SELECT document_hash
  FROM certificates
  WHERE lower(document_hash) = lower(?)
`);

// --------------------------------------------------
// TEMPORARY AUTHENTICATION STORAGE
// --------------------------------------------------

const challenges = new Map();
const sessions = new Map();

const CHALLENGE_LIFETIME = 5 * 60 * 1000;
const SESSION_LIFETIME = 15 * 60 * 1000;

function cleanExpiredRecords() {
  const now = Date.now();

  for (const [id, challenge] of challenges) {
    if (challenge.expiresAt < now) {
      challenges.delete(id);
    }
  }

  for (const [token, session] of sessions) {
    if (session.expiresAt < now) {
      sessions.delete(token);
    }
  }
}

setInterval(cleanExpiredRecords, 60 * 1000).unref();

// --------------------------------------------------
// BASIC RATE LIMITING
// --------------------------------------------------

const rateLimits = new Map();

function rateLimit({ windowMs, maxRequests }) {
  return (req, res, next) => {
    const key = req.ip || req.socket.remoteAddress;
    const now = Date.now();

    let entry = rateLimits.get(key);

    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + windowMs
      };

      rateLimits.set(key, entry);
    }

    entry.count++;

    if (entry.count > maxRequests) {
      return res.status(429).json({
        success: false,
        error: "Too many requests. Please try again later."
      });
    }

    next();
  };
}

const authRateLimit = rateLimit({
  windowMs: 60 * 1000,
  maxRequests: 30
});

const uploadRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000,
  maxRequests: 10
});

// --------------------------------------------------
// WALLET AUTHENTICATION
// --------------------------------------------------

app.post(
  "/api/auth/challenge",
  authRateLimit,
  async (req, res) => {
    try {
      const { address } = req.body || {};

      if (!address || !ethers.isAddress(address)) {
        return res.status(400).json({
          success: false,
          error: "A valid wallet address is required."
        });
      }

      const normalizedAddress = ethers.getAddress(address);

      const challengeId = crypto.randomUUID();
      const nonce = crypto.randomBytes(32).toString("hex");

      const message = [
        "CertiChain Wallet Authentication",
        "",
        "Sign this message to authenticate with CertiChain.",
        "This signature does not authorize a blockchain transaction.",
        "",
        `Wallet: ${normalizedAddress}`,
        `Chain ID: ${SEPOLIA_CHAIN_ID}`,
        `Nonce: ${nonce}`,
        `Challenge: ${challengeId}`,
        `Issued At: ${new Date().toISOString()}`
      ].join("\n");

      challenges.set(challengeId, {
        address: normalizedAddress,
        message,
        expiresAt: Date.now() + CHALLENGE_LIFETIME
      });

      return res.json({
        success: true,
        challengeId,
        message,
        expiresIn: CHALLENGE_LIFETIME / 1000
      });

    } catch (error) {
      console.error("Challenge error:", error.message);

      return res.status(500).json({
        success: false,
        error: "Could not create authentication challenge."
      });
    }
  }
);

// --------------------------------------------------
// VERIFY SIGNATURE AND ISSUE SESSION
// --------------------------------------------------

app.post(
  "/api/auth/verify",
  authRateLimit,
  async (req, res) => {
    try {
      const { challengeId, signature } = req.body || {};

      if (
        typeof challengeId !== "string" ||
        typeof signature !== "string" ||
        !/^0x[a-fA-F0-9]{130}$/.test(signature)
      ) {
        return res.status(400).json({
          success: false,
          error: "Invalid authentication request."
        });
      }

      const challenge = challenges.get(challengeId);

      if (!challenge || challenge.expiresAt < Date.now()) {
        challenges.delete(challengeId);

        return res.status(401).json({
          success: false,
          error: "Challenge expired or already used. Reconnect your wallet."
        });
      }

      // Consume the challenge before further verification.
      challenges.delete(challengeId);

      const recoveredAddress = ethers.verifyMessage(
        challenge.message,
        signature
      );

      if (
        recoveredAddress.toLowerCase() !==
        challenge.address.toLowerCase()
      ) {
        return res.status(401).json({
          success: false,
          error: "Wallet signature verification failed."
        });
      }

      const network = await provider.getNetwork();

      if (network.chainId !== SEPOLIA_CHAIN_ID) {
        throw new Error("Backend is connected to the wrong network.");
      }

      const ownerAddress = await contract.owner();

      const isOwner =
        recoveredAddress.toLowerCase() ===
        ownerAddress.toLowerCase();

      const isInstitution = await contract.authorizedInstitutions(
        recoveredAddress
      );

      if (!isOwner && !isInstitution) {
        return res.status(403).json({
          success: false,
          error: "This wallet is not authorized to register certificates."
        });
      }

      const token = crypto.randomBytes(48).toString("hex");

      sessions.set(token, {
        address: ethers.getAddress(recoveredAddress),
        isOwner,
        expiresAt: Date.now() + SESSION_LIFETIME
      });

      return res.json({
        success: true,
        token,
        address: ethers.getAddress(recoveredAddress),
        role: isOwner ? "administrator" : "institution",
        expiresIn: SESSION_LIFETIME / 1000
      });

    } catch (error) {
      console.error("Authentication error:", error.message);

      return res.status(401).json({
        success: false,
        error: "Wallet authentication could not be completed."
      });
    }
  }
);

// --------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// --------------------------------------------------

function requireAuthorization(req, res, next) {
  const authorization = req.headers.authorization || "";

  if (!authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Wallet authentication required."
    });
  }

  const token = authorization.slice(7);
  const session = sessions.get(token);

  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);

    return res.status(401).json({
      success: false,
      error: "Session expired. Reconnect your wallet."
    });
  }

  req.wallet = session;
  next();
}

// --------------------------------------------------
// FILE UPLOAD CONFIGURATION
// --------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },

  fileFilter(req, file, callback) {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg"
    ];

    if (!allowed.includes(file.mimetype)) {
      return callback(
        new Error("Only PDF, PNG and JPEG files are allowed.")
      );
    }

    callback(null, true);
  }
});

function validateFileContent(buffer, mimetype) {
  if (mimetype === "application/pdf") {
    return buffer.subarray(0, 5).toString() === "%PDF-";
  }

  if (mimetype === "image/png") {
    return buffer.subarray(0, 8).equals(
      Buffer.from([
        0x89, 0x50, 0x4e, 0x47,
        0x0d, 0x0a, 0x1a, 0x0a
      ])
    );
  }

  if (mimetype === "image/jpeg") {
    return (
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    );
  }

  return false;
}

function sanitizeFilename(name) {
  const base = path.basename(name || "certificate");

  return base
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120) || "certificate";
}

// --------------------------------------------------
// SERVER HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CertiChain secured server is running.",
    network: "Ethereum Sepolia",
    database: "connected",
    publicVerification: true
  });
});

// --------------------------------------------------
// PROTECTED PINATA UPLOAD
// --------------------------------------------------

app.post(
  "/api/upload",
  requireAuthorization,
  uploadRateLimit,
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No certificate file was provided."
        });
      }

      if (
        !validateFileContent(
          req.file.buffer,
          req.file.mimetype
        )
      ) {
        return res.status(400).json({
          success: false,
          error: "File content does not match its declared type."
        });
      }

      const safeName = sanitizeFilename(
        req.file.originalname
      );

      const file = new File(
        [req.file.buffer],
        safeName,
        { type: req.file.mimetype }
      );

      const result = await pinata.upload.public.file(file);

      return res.status(201).json({
        success: true,
        message: "Certificate uploaded successfully.",
        cid: result.cid,
        name: safeName
      });

    } catch (error) {
      console.error("Upload error:", error.message);

      return res.status(500).json({
        success: false,
        error: "Certificate upload failed."
      });
    }
  }
);

// --------------------------------------------------
// VERIFY REGISTRATION ON ETHEREUM
// --------------------------------------------------

async function verifyRegistrationTransaction({
  documentHash,
  issuer,
  transactionHash
}) {
  const receipt = await provider.getTransactionReceipt(
    transactionHash
  );

  if (!receipt || receipt.status !== 1) {
    throw new Error("Registration transaction is not confirmed.");
  }

  if (
    receipt.to?.toLowerCase() !==
    CONTRACT_ADDRESS.toLowerCase()
  ) {
    throw new Error("Transaction does not target the CertiChain contract.");
  }

  if (
    receipt.from.toLowerCase() !== issuer.toLowerCase()
  ) {
    throw new Error("Transaction issuer does not match the metadata issuer.");
  }

  const transaction = await provider.getTransaction(
    transactionHash
  );

  if (!transaction || transaction.chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error("Transaction is not on Ethereum Sepolia.");
  }

  const iface = new ethers.Interface(ABI);

  let matchingEvent = null;

  for (const log of receipt.logs) {
    if (
      log.address.toLowerCase() !==
      CONTRACT_ADDRESS.toLowerCase()
    ) {
      continue;
    }

    try {
      const parsed = iface.parseLog(log);

      if (
        parsed &&
        parsed.name === "CertificateRegistered" &&
        parsed.args.documentHash.toLowerCase() ===
          documentHash.toLowerCase() &&
        parsed.args.issuer.toLowerCase() ===
          issuer.toLowerCase()
      ) {
        matchingEvent = parsed;
        break;
      }
    } catch {
      // Ignore unrelated contract events.
    }
  }

  if (!matchingEvent) {
    throw new Error(
      "The transaction does not contain the required certificate registration event."
    );
  }

  const record = await contract.verifyCertificate(documentHash);

  if (
    !record.exists ||
    record.issuer.toLowerCase() !== issuer.toLowerCase()
  ) {
    throw new Error(
      "The certificate is not registered under the supplied issuer."
    );
  }

  const block = await provider.getBlock(receipt.blockNumber);

  if (!block) {
    throw new Error("Could not retrieve the registration block.");
  }

  return new Date(Number(block.timestamp) * 1000).toISOString();
}

// --------------------------------------------------
// PROTECTED METADATA SAVE
// --------------------------------------------------

app.post(
  "/api/metadata",
  requireAuthorization,
  async (req, res) => {
    try {
      const {
        documentHash,
        ipfsCid,
        fileName,
        issuer,
        transactionHash
      } = req.body || {};

      if (
        typeof documentHash !== "string" ||
        !/^0x[a-fA-F0-9]{64}$/.test(documentHash) ||
        typeof ipfsCid !== "string" ||
        !/^[a-zA-Z0-9]{20,100}$/.test(ipfsCid) ||
        typeof fileName !== "string" ||
        !fileName.trim() ||
        typeof issuer !== "string" ||
        !ethers.isAddress(issuer) ||
        typeof transactionHash !== "string" ||
        !/^0x[a-fA-F0-9]{64}$/.test(transactionHash)
      ) {
        return res.status(400).json({
          success: false,
          error: "Missing or invalid certificate metadata."
        });
      }

      const normalizedIssuer = ethers.getAddress(issuer);

      if (
        normalizedIssuer.toLowerCase() !==
        req.wallet.address.toLowerCase()
      ) {
        return res.status(403).json({
          success: false,
          error: "Issuer does not match the authenticated wallet."
        });
      }

      const existing = findMetadata.get(documentHash);

      if (existing) {
        return res.status(409).json({
          success: false,
          error: "Metadata already exists for this certificate."
        });
      }

      const registeredAt = await verifyRegistrationTransaction({
        documentHash,
        issuer: normalizedIssuer,
        transactionHash
      });

      saveMetadata.run({
        documentHash: documentHash.toLowerCase(),
        ipfsCid,
        fileName: sanitizeFilename(fileName),
        issuer: normalizedIssuer,
        transactionHash: transactionHash.toLowerCase(),
        registeredAt
      });

      return res.status(201).json({
        success: true,
        message: "Verified certificate metadata saved successfully.",
        documentHash: documentHash.toLowerCase(),
        ipfsCid,
        registeredAt
      });

    } catch (error) {
      console.error("Metadata save error:", error.message);

      return res.status(400).json({
        success: false,
        error: error.message || "Could not save certificate metadata."
      });
    }
  }
);

// --------------------------------------------------
// PUBLIC METADATA RETRIEVAL
// --------------------------------------------------

app.get("/api/metadata/:hash", (req, res) => {
  try {
    const hash = req.params.hash;

    if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) {
      return res.status(400).json({
        success: false,
        error: "Invalid SHA-256 document hash."
      });
    }

    const metadata = getMetadata.get(hash);

    if (!metadata) {
      return res.status(404).json({
        success: false,
        message: "No saved metadata found for this certificate."
      });
    }

    return res.json({
      success: true,
      metadata
    });

  } catch (error) {
    console.error("Metadata retrieval error:", error.message);

    return res.status(500).json({
      success: false,
      error: "Could not retrieve certificate metadata."
    });
  }
});

// --------------------------------------------------
// ERROR HANDLING
// --------------------------------------------------

app.use((error, req, res, next) => {
  console.error("Request error:", error.message);

  const status =
    error instanceof multer.MulterError
      ? 413
      : error.message.includes("CORS")
        ? 403
        : 400;

  return res.status(status).json({
    success: false,
    error: error.message || "Request failed."
  });
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(PORT, () => {
  console.log(
    `CertiChain secured server running on http://localhost:${PORT}`
  );

  console.log("Ethereum network: Sepolia");
  console.log("SQLite database connected.");
  console.log("Public certificate verification enabled.");
});


