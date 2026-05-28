const pool = require("./db");

async function migrate() {
  console.log("Running migration: add account_members table...");
  const connection = await pool.getConnection();
  try {
    await connection.query(`
      CREATE TABLE IF NOT EXISTS account_members (
        userId VARCHAR(36) NOT NULL,
        accountId VARCHAR(36) NOT NULL,
        role ENUM('admin','manager','member') NOT NULL DEFAULT 'member',
        joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (userId, accountId),
        INDEX idx_am_accountId (accountId),
        INDEX idx_am_userId (userId)
      )
    `);
    console.log("✓ Created account_members table");

    // Migrate existing users into account_members
    const [result] = await connection.query(`
      INSERT IGNORE INTO account_members (userId, accountId, role, joinedAt)
      SELECT id, accountId, role, createdAt FROM users WHERE accountId IS NOT NULL
    `);
    console.log(
      `✓ Migrated ${result.affectedRows} existing user(s) into account_members`,
    );

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
