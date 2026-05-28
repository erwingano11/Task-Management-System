const pool = require("./db");

async function run() {
  const conn = await pool.getConnection();
  try {
    // Add accountId column to users if not exists
    try {
      await conn.query(
        "ALTER TABLE users ADD COLUMN accountId VARCHAR(36) NULL",
      );
      console.log("Added accountId column to users");
    } catch (e) {
      if (e.code === "ER_DUP_FIELDNAME") {
        console.log("accountId column already exists");
      } else {
        throw e;
      }
    }

    // Populate accountId from account_members (first workspace joined per user)
    const [result] = await conn.query(`
      UPDATE users u
      INNER JOIN (
        SELECT userId, MIN(accountId) as accountId
        FROM account_members
        GROUP BY userId
      ) am ON am.userId = u.id
      SET u.accountId = am.accountId
      WHERE u.accountId IS NULL
    `);
    console.log("Populated accountId for", result.affectedRows, "users");

    // Verify
    const [rows] = await conn.query("DESCRIBE users");
    console.log("\nusers columns:", rows.map((r) => r.Field).join(", "));
  } finally {
    conn.release();
    process.exit(0);
  }
}

run().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
