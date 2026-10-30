
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "certichain.db"));

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS certificates (
    document_hash TEXT PRIMARY KEY,
    ipfs_cid TEXT NOT NULL,
    file_name TEXT NOT NULL,
    issuer TEXT,
    transaction_hash TEXT,
    registered_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`);

module.exports = db;
