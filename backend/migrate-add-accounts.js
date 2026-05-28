const pool = require("./db");
const { v4: uuidv4 } = require("uuid");

async function migrate() {
  const connection = await pool.getConnection();
  try {
    console.log("Running migration: add shared account structure...");

    // 1. Create accounts table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✓ Created accounts table");

    // 2. Add accountId to users
    await connection.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS accountId VARCHAR(36) NULL
    `);
    console.log("✓ Added accountId to users");

    // 3. Add accountId to tasks
    await connection.query(`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS accountId VARCHAR(36) NULL
    `);
    console.log("✓ Added accountId to tasks");

    // 4. Add accountId to invitations
    await connection.query(`
      ALTER TABLE invitations
      ADD COLUMN IF NOT EXISTS accountId VARCHAR(36) NULL
    `);
    console.log("✓ Added accountId to invitations");

    // 5. Create one default account for all existing users and tasks
    const [existingUsers] = await connection.query(
      "SELECT id FROM users WHERE accountId IS NULL LIMIT 1",
    );

    if (existingUsers.length > 0) {
      const accountId = uuidv4();
      await connection.query(
        "INSERT INTO accounts (id, name, createdAt) VALUES (?, 'My Workspace', NOW())",
        [accountId],
      );
      await connection.query(
        "UPDATE users SET accountId = ? WHERE accountId IS NULL",
        [accountId],
      );
      await connection.query(
        "UPDATE tasks SET accountId = ? WHERE accountId IS NULL",
        [accountId],
      );
      await connection.query(
        "UPDATE invitations SET accountId = ? WHERE accountId IS NULL",
        [accountId],
      );
      console.log(
        `✓ Created default account and migrated existing data (accountId: ${accountId})`,
      );
    } else {
      console.log("✓ No existing data to migrate");
    }

    // 6. Add foreign key indexes (not enforced FK to avoid cascade complexity)
    await connection.query(
      "CREATE INDEX IF NOT EXISTS idx_users_accountId ON users(accountId)",
    );
    await connection.query(
      "CREATE INDEX IF NOT EXISTS idx_tasks_accountId ON tasks(accountId)",
    );
    console.log("✓ Added indexes");

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
