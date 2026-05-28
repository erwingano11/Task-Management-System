const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

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
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO users (id, name, email, password, createdAt) VALUES (?, ?, ?, ?, NOW())",
      [id, name, email, password],
    );
    connection.release();
    res.status(201).json({ id, name, email });
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
};
