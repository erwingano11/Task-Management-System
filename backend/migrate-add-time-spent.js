const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrateDatabase() {
  console.log("========================================");
  console.log("Database Migration - Add timeSpent");
  console.log("========================================\n");

  try {
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    const connection = await pool.getConnection();
    console.log("✓ Connected to database");

    // Check if timeSpent column already exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
       WHERE TABLE_NAME = 'tasks' AND TABLE_SCHEMA = ? AND COLUMN_NAME = 'timeSpent'`,
      [process.env.DB_NAME],
    );

    if (columns.length > 0) {
      console.log("✓ timeSpent column already exists");
      connection.release();
      pool.end();
      process.exit(0);
    }

    // Add timeSpent column
    console.log("Adding timeSpent column to tasks table...");
    await connection.query(
      `ALTER TABLE tasks ADD COLUMN timeSpent INT DEFAULT 0 COMMENT 'Time spent in minutes'`,
    );
    console.log("✓ timeSpent column added successfully");

    connection.release();
    pool.end();

    console.log("\n✅ Migration completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during migration:", error.message);
    process.exit(1);
  }
}

migrateDatabase();
