import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT === "true",
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool = null;

/**
 * Get or create the database connection pool
 * @returns {Promise<sql.ConnectionPool>}
 */
export async function getPool() {
  if (!pool) {
    try {
      pool = await sql.connect(config);
      console.log("✓ Connected to SQL Server database");

      // Handle pool errors
      pool.on("error", (err) => {
        console.error("Database pool error:", err);
        pool = null;
      });
    } catch (err) {
      console.error("Failed to connect to database:", err);
      throw err;
    }
  }
  return pool;
}

/**
 * Close the database connection pool
 */
export async function closePool() {
  if (pool) {
    try {
      await pool.close();
      pool = null;
      console.log("✓ Database connection closed");
    } catch (err) {
      console.error("Error closing database connection:", err);
    }
  }
}

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const testPool = await getPool();
    const result = await testPool.request().query("SELECT 1 as test");
    console.log("✓ Database connection test successful");
    return true;
  } catch (err) {
    console.error("✗ Database connection test failed:", err.message);
    return false;
  }
}

// Export sql object for types
export { sql };
