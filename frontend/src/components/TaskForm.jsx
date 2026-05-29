import { useState, useEffect } from "react";
import "./TaskForm.css";

function TaskForm({ onAddTask, token }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    assignedTo: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/account/members", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token || localStorage.getItem("token")}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear the error for this field as the user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Task title is required.";
    } else if (formData.title.trim().length > 200) {
      newErrors.title = "Title must be 200 characters or fewer.";
    }
    if (formData.description.length > 1000) {
      newErrors.description = "Description must be 1000 characters or fewer.";
    }
    if (!formData.assignedTo) {
      newErrors.assignedTo = "Please assign this task to a member.";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    onAddTask(formData);
    setErrors({});
    setFormData({
      title: "",
      description: "",
      status: "pending",
      assignedTo: "",
    });
    setSuccess(true);
    setTimeout(() => setSuccess(false), 4000);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>Create New Task</h2>

      {success && (
        <div className="form-success">Task created successfully!</div>
      )}

      <div className="form-group">
        <label htmlFor="title">Task Title *</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          placeholder="Enter task title"
          className={errors.title ? "input-error" : ""}
        />
        {errors.title && <span className="field-error">{errors.title}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Enter task description"
          rows="4"
          className={errors.description ? "input-error" : ""}
        />
        {errors.description && (
          <span className="field-error">{errors.description}</span>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="assignedTo">Assigned To *</label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            className={errors.assignedTo ? "input-error" : ""}
          >
            <option value="">-- Select a member --</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <span className="field-error">{errors.assignedTo}</span>
          )}
        </div>
      </div>

      <button type="submit" className="submit-btn">
        Create Task
      </button>
    </form>
  );
}

export default TaskForm;
