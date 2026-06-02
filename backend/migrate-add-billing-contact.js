const pool = require("./db");

async function migrate() {
  const connection = await pool.getConnection();
  try {
    await connection.query(
      "ALTER TABLE accounts ADD COLUMN billingName VARCHAR(150) NULL AFTER name",
    );
    console.log("Added billingName column to accounts.");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("billingName column already exists, skipping.");
    } else {
      throw e;
    }
  }

  try {
    await connection.query(
      "ALTER TABLE accounts ADD COLUMN billingEmail VARCHAR(150) NULL AFTER billingName",
    );
    console.log("Added billingEmail column to accounts.");
  } catch (e) {
    if (e.code === "ER_DUP_FIELDNAME") {
      console.log("billingEmail column already exists, skipping.");
    } else {
      throw e;
    }
  }

  connection.release();
  console.log("Migration complete.");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
