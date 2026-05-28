const pool = require("../db");
const { v4: uuidv4 } = require("uuid");

// Helper function to format task with hours instead of minutes
const formatTask = (task) => {
  if (!task) return null;
  return {
    ...task,
    timeSpentHours: task.timeSpent ? (task.timeSpent / 60).toFixed(1) : "0",
    timeSpentFormatted: task.timeSpent
      ? `${(task.timeSpent / 60).toFixed(1)} hours`
      : "0 hours",
  };
};

const formatTasks = (tasks) => {
  return tasks.map(formatTask);
};

const getAllTasks = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [tasks] = await connection.query("SELECT * FROM tasks");
    connection.release();
    res.json(formatTasks(tasks));
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({
      error: error.message,
      details: "Failed to fetch tasks from database",
    });
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
    res.json(formatTask(task[0]));
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

    // Fetch the created task to get timestamps
    const [createdTask] = await connection.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );
    connection.release();

    res.status(201).json(formatTask(createdTask[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, assignedTo } = req.body;
    const connection = await pool.getConnection();

    // Build dynamic update query based on provided fields
    const updates = [];
    const params = [];

    if (title !== undefined) {
      updates.push("title = ?");
      params.push(title);
    }
    if (description !== undefined) {
      updates.push("description = ?");
      params.push(description);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      params.push(status);
      // Set completedAt when status changes to 'completed'
      if (status === "completed") {
        updates.push("completedAt = NOW()");
      }
    }
    if (assignedTo !== undefined) {
      updates.push("assignedTo = ?");
      params.push(assignedTo || null);
    }

    if (updates.length === 0) {
      connection.release();
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);

    const updateQuery = `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`;
    await connection.query(updateQuery, params);

    // Fetch the updated task to return complete data with timestamps
    const [updatedTask] = await connection.query(
      "SELECT * FROM tasks WHERE id = ?",
      [id],
    );
    connection.release();

    res.json(formatTask(updatedTask[0]));
  } catch (error) {
    console.error("Error updating task:", error);
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
