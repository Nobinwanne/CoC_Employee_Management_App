const sql = require('mssql');
require('dotenv').config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: true, // Use encryption for Azure
    trustServerCertificate: true, // Trust self-signed certificates (for local development)
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let pool = null;

async function getPool() {
  if (!pool) {
    pool = await sql.connect(config);
    console.log('✓ Connected to SQL Server database');
  }
  return pool;
}

async function closePool() {
  if (pool) {
    await pool.close();
    pool = null;
    console.log('✓ Database connection closed');
  }
}

module.exports = {
  getPool,
  closePool,
  sql
};