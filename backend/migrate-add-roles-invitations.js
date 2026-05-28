const pool = require("./db");

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log("Running migration: add roles and invitations...");

    // Add role column to users if it doesn't exist
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role ENUM('admin', 'manager', 'member') NOT NULL DEFAULT 'member'
    `);
    console.log("✓ Added role column to users");

    // Set the first registered user as admin
    await connection.query(`
      UPDATE users SET role = 'admin'
      WHERE id = (SELECT id FROM (SELECT id FROM users ORDER BY createdAt ASC LIMIT 1) AS t)
      AND role = 'member'
    `);
    console.log("✓ Promoted earliest user to admin");

    // Create invitations table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS invitations (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        role ENUM('admin', 'manager', 'member') NOT NULL DEFAULT 'member',
        token VARCHAR(255) UNIQUE NOT NULL,
        invitedBy VARCHAR(36),
        status ENUM('pending', 'accepted', 'expired') NOT NULL DEFAULT 'pending',
        expiresAt TIMESTAMP NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (invitedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("✓ Created invitations table");

    console.log("Migration complete.");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

migrate();
