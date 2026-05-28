const pool = require("../db");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../middleware/auth");

const getAllUsers = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [users] = await connection.query(
      "SELECT id, name, email, createdAt FROM users",
    );
    connection.release();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [user] = await connection.query(
      "SELECT id, name, email, createdAt FROM users WHERE id = ?",
      [id],
    );
    connection.release();
    if (user.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }
    const id = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await pool.getConnection();
    const [existing] = await connection.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );
    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({ error: "Email already in use." });
    }
    // Self-registration always creates a new account and the user becomes its admin
    const accountId = require("uuid").v4();
    const accountName = `${name}'s Workspace`;
    await connection.query(
      "INSERT INTO accounts (id, name, createdAt) VALUES (?, ?, NOW())",
      [accountId, accountName],
    );
    await connection.query(
      "INSERT INTO users (id, name, email, password, accountId, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, name, email, hashedPassword, accountId],
    );
    await connection.query(
      "INSERT IGNORE INTO account_members (userId, accountId, role, joinedAt) VALUES (?, ?, 'admin', NOW())",
      [id, accountId],
    );
    connection.release();
    const token = jwt.sign(
      { id, name, email, role: "admin", accountId },
      JWT_SECRET,
      {
        expiresIn: "8h",
      },
    );
    res.status(201).json({ id, name, email, role: "admin", accountId, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      "SELECT id, name, email, password, accountId FROM users WHERE email = ?",
      [email],
    );
    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({ error: "Invalid email or password." });
    }
    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      connection.release();
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Get authoritative role from account_members for the user's active workspace
    const [memberRows] = await connection.query(
      "SELECT role FROM account_members WHERE userId = ? AND accountId = ?",
      [user.id, user.accountId],
    );
    connection.release();

    const role = memberRows.length > 0 ? memberRows[0].role : "member";

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role,
        accountId: user.accountId,
      },
      JWT_SECRET,
      { expiresIn: "8h" },
    );
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role,
      accountId: user.accountId,
      token,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id],
    );
    connection.release();
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query("DELETE FROM users WHERE id = ?", [id]);
    connection.release();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
};
