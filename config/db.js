const { Pool } = require("pg");

let pool;

async function connectDB() {
  try {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    await pool.connect();

    console.log("✅ Connected to the databases");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

function getPool() {
  if (!pool) {
    throw new Error("Database not initialized");
  }
  return pool;
}

module.exports = { connectDB, getPool };
