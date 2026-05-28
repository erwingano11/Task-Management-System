const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function setupDatabase() {
  console.log("========================================");
  console.log("Work Management System - Database Setup");
  console.log("========================================\n");

  try {
    // Connect to MySQL without selecting database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD || undefined,
    });

    console.log("✓ Connected to MySQL");

    // Create database
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``,
    );
    console.log(`✓ Database '${process.env.DB_NAME}' created/exists`);

    // Use database
    await connection.query(`USE \`${process.env.DB_NAME}\``);
    console.log(`✓ Using database '${process.env.DB_NAME}'`);

    // Read and execute schema
    const schemaFile = path.join(__dirname, "database.sql");
    const schema = fs.readFileSync(schemaFile, "utf8");

    // Split SQL statements and execute them
    const statements = schema.split(";").filter((stmt) => stmt.trim());
    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("✓ Database schema imported");
    console.log("✓ Tables created: users, tasks");

    await connection.end();

    console.log("\n✅ Database setup completed successfully!");
    console.log("\nYou can now start the backend server with: npm start\n");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error setting up database:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Make sure MySQL is running");
    console.error("2. Verify credentials in .env file");
    console.error(
      "3. Check that MySQL root user has no password (or update .env)",
    );
    process.exit(1);
  }
}

setupDatabase();
