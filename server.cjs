
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { PinataSDK } = require("pinata");
const Database = require("better-sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(cors({
  origin: [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "https://certichain-jade.vercel.app"
  ]
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
  ON CONFLICT(document_hash) DO UPDATE SET
    ipfs_cid = excluded.ipfs_cid,
    file_name = excluded.file_name,
    issuer = excluded.issuer,
    transaction_hash = excluded.transaction_hash,
    registered_at = excluded.registered_at
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

// --------------------------------------------------
// PINATA CONFIGURATION
// --------------------------------------------------

if (!process.env.PINATA_JWT) {
  throw new Error("PINATA_JWT is missing from your .env file.");
}

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.PINATA_GATEWAY
});

// --------------------------------------------------
// FILE UPLOAD CONFIGURATION
// --------------------------------------------------

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 10 * 1024 * 1024
  },

  fileFilter: (req, file, callback) => {
    const allowed = [
      "application/pdf",
      "image/png",
      "image/jpeg"
    ];

    if (allowed.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error("Only PDF, PNG and JPEG files are allowed.")
      );
    }
  }
});

// --------------------------------------------------
// SERVER HEALTH CHECK
// --------------------------------------------------

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CertiChain server is running.",
    database: "connected",
    upload: "available"
  });
});

// --------------------------------------------------
// UPLOAD DOCUMENT TO PINATA
// --------------------------------------------------

app.post(
  "/api/upload",
  upload.single("certificate"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No certificate file was provided."
        });
      }

      console.log("Received file:", req.file.originalname);

      const file = new File(
        [req.file.buffer],
        req.file.originalname,
        { type: req.file.mimetype }
      );

      console.log("Uploading to Pinata...");

      const result = await pinata.upload.public.file(file);

      console.log("Pinata upload successful:", result.cid);

      return res.status(201).json({
        success: true,
        message: "Certificate uploaded successfully.",
        cid: result.cid,
        name: result.name
      });

    } catch (error) {
      console.error("Upload error:", error);

      return res.status(500).json({
        success: false,
        error: "Certificate upload failed."
      });
    }
  }
);

// --------------------------------------------------
// SAVE CERTIFICATE METADATA TO SQLITE
// --------------------------------------------------

app.post("/api/metadata", (req, res) => {
  try {
    const {
      documentHash,
      ipfsCid,
      fileName,
      issuer,
      transactionHash,
      registeredAt
    } = req.body || {};

    if (
      !documentHash ||
      !/^0x[a-fA-F0-9]{64}$/.test(documentHash) ||
      !ipfsCid ||
      !fileName ||
      !issuer ||
      !transactionHash ||
      !registeredAt
    ) {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid certificate metadata."
      });
    }

    if (
      !/^0x[a-fA-F0-9]{40}$/.test(issuer) ||
      !/^0x[a-fA-F0-9]{64}$/.test(transactionHash) ||
      Number.isNaN(Date.parse(registeredAt))
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid issuer, transaction hash or registration date."
      });
    }

    saveMetadata.run({
      documentHash: documentHash.toLowerCase(),
      ipfsCid,
      fileName,
      issuer,
      transactionHash,
      registeredAt
    });

    console.log("Metadata saved:", documentHash);

    return res.status(201).json({
      success: true,
      message: "Certificate metadata saved successfully.",
      documentHash: documentHash.toLowerCase(),
      ipfsCid
    });

  } catch (error) {
    console.error("Metadata save error:", error);

    return res.status(500).json({
      success: false,
      error: "Could not save certificate metadata."
    });
  }
});

// --------------------------------------------------
// RETRIEVE CERTIFICATE METADATA
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
    console.error("Metadata retrieval error:", error);

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

  const status = error instanceof multer.MulterError
    ? 413
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
  console.log(`CertiChain server running on http://localhost:${PORT}`);
  console.log("SQLite database connected.");
});
