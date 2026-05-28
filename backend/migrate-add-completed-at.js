const mysql = require("mysql2/promise");
require("dotenv").config();

async function migrateDatabase() {
  console.log("========================================");
  console.log("Database Migration - Add completedAt");
  console.log("========================================\n");

  try {
    // Create connection pool
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

    // Check if completedAt column exists
    const [columns] = await connection.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_NAME = 'tasks' AND TABLE_SCHEMA = ? AND COLUMN_NAME = 'completedAt'`,
      [process.env.DB_NAME],
    );

    if (columns.length > 0) {
      console.log("✓ completedAt column already exists");
      connection.release();
      pool.end();
      process.exit(0);
    }

    // Add completedAt column
    console.log("Adding completedAt column to tasks table...");
    await connection.query(
      `ALTER TABLE tasks ADD COLUMN completedAt TIMESTAMP NULL COMMENT 'Timestamp when task was completed'`,
    );
    console.log("✓ completedAt column added successfully");

    // Update existing completed tasks with completedAt = updatedAt
    const [result] = await connection.query(
      `UPDATE tasks SET completedAt = updatedAt WHERE status = 'completed' AND completedAt IS NULL`,
    );
    console.log(`✓ Updated ${result.affectedRows} existing completed tasks`);

    connection.release();
    pool.end();

    console.log("\n✅ Migration completed successfully!\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error during migration:", error.message);
    console.error(error);
    process.exit(1);
  }
}

migrateDatabase();
