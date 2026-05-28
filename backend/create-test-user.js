const pool = require("./db");
require("dotenv").config();

async function createTestUser() {
  console.log("========================================");
  console.log("Creating Test User");
  console.log("========================================\n");

  try {
    const connection = await pool.getConnection();

    // Test user data
    const testUsers = [
      {
        id: "550e8400-e29b-41d4-a716-446655440001",
        name: "John Doe",
        email: "john@example.com",
        password: "password123",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        name: "Jane Smith",
        email: "jane@example.com",
        password: "password123",
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        name: "Mike Johnson",
        email: "mike@example.com",
        password: "password123",
      },
    ];

    for (const user of testUsers) {
      try {
        await connection.query(
          "INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, NOW())",
          [user.id, user.name, user.email, user.password],
        );
        console.log(`✓ Created user: ${user.name} (${user.email})`);
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          console.log(`⚠ User already exists: ${user.email}`);
        } else {
          throw error;
        }
      }
    }

    connection.release();

    console.log("\n✅ Test users created/verified successfully!");
    console.log("\nTest User Credentials:");
    console.log("─────────────────────────────────────");
    testUsers.forEach((user) => {
      console.log(`Name: ${user.name}`);
      console.log(`Email: ${user.email}`);
      console.log(`Password: ${user.password}`);
      console.log(`ID: ${user.id}`);
      console.log("─────────────────────────────────────");
    });

    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error creating test users:", error.message);
    console.error("\nTroubleshooting:");
    console.error("1. Make sure MySQL is running");
    console.error("2. Verify database setup with: npm run setup");
    console.error("3. Check credentials in .env file");
    process.exit(1);
  }
}

createTestUser();
