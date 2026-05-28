const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

const getAllTasks = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tasks] = await connection.query("SELECT * FROM tasks");
    connection.release();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [task] = await connection.query("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);
    connection.release();
    if (task.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, status, assignedTo } = req.body;
    const id = uuidv4();
    const connection = await pool.getConnection();
    await connection.query(
      "INSERT INTO tasks (id, title, description, status, assignedTo, createdAt) VALUES (?, ?, ?, ?, ?, NOW())",
      [id, title, description, status || "pending", assignedTo],
    );
    connection.release();
    res
      .status(201)
      .json({
        id,
        title,
        description,
        status: status || "pending",
        assignedTo,
      });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      "UPDATE tasks SET title = ?, description = ?, status = ?, assignedTo = ? WHERE id = ?",
      [title, description, status, assignedTo, id],
    );
    connection.release();
    res.json({ message: "Task updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    await connection.query("DELETE FROM tasks WHERE id = ?", [id]);
    connection.release();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
