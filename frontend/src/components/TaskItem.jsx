import { useState } from "react";
import "./TaskItem.css";

function TaskItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [timeInput, setTimeInput] = useState("");
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
    timeSpent: task.timeSpent || 0,
  });

  const handleStatusChange = (newStatus) => {
    if (newStatus === "completed" && editData.status !== "completed") {
      // Show time modal when completing task
      setShowTimeModal(true);
      setTimeInput("");
    } else {
      setEditData((prev) => ({ ...prev, status: newStatus }));
      onUpdate(task.id, { ...editData, status: newStatus });
    }
  };

  const handleTimeSubmit = () => {
    const input = parseFloat(timeInput) || 0;
    if (input < 0) {
      alert("Please enter a valid time");
      return;
    }

    // Convert to minutes - assume decimal hours if input is small
    let minutes = input;
    if (input < 24) {
      // If input is less than 24, assume it's hours and convert to minutes
      minutes = Math.round(input * 60);
    }

    const updatedData = {
      ...editData,
      status: "completed",
      timeSpent: minutes,
    };
    setEditData(updatedData);
    onUpdate(task.id, updatedData);
    setShowTimeModal(false);
    setTimeInput("");
  };

  const handleTimeCancel = () => {
    setShowTimeModal(false);
    setTimeInput("");
  };

  const handleSaveEdit = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#28a745";
      case "in-progress":
        return "#ffc107";
      case "pending":
        return "#6c757d";
      default:
        return "#666";
    }
  };

  return (
    <div className="task-item">
      <div className="task-header">
        <div
          className="task-status"
          style={{ backgroundColor: getStatusColor(editData.status) }}
        >
          {editData.status}
        </div>
        <button className="delete-btn" onClick={() => onDelete(task.id)}>
          ×
        </button>
      </div>

      {isEditing ? (
        <div className="task-edit">
          <input
            type="text"
            value={editData.title}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, title: e.target.value }))
            }
            className="edit-title"
          />
          <textarea
            value={editData.description}
            onChange={(e) =>
              setEditData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="edit-description"
          />
          <div className="edit-actions">
            <button className="save-btn" onClick={handleSaveEdit}>
              Save
            </button>
            <button className="cancel-btn" onClick={() => setIsEditing(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="task-content" onClick={() => setIsEditing(true)}>
          <h3 className="task-title">{editData.title}</h3>
          {editData.description && (
            <p className="task-description">{editData.description}</p>
          )}
          {task.assignedTo && (
            <p className="task-assigned">Assigned to: {task.assignedTo}</p>
          )}
          {editData.timeSpent > 0 && (
            <p className="task-time">
              ⏱️ Time spent: {(editData.timeSpent / 60).toFixed(1)} hours
            </p>
          )}
          {task.completedAt && (
            <p className="task-completed-date">
              ✅ Completed: {new Date(task.completedAt).toLocaleDateString()} at{" "}
              {new Date(task.completedAt).toLocaleTimeString()}
            </p>
          )}
          <p className="task-date">
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="task-footer">
        <select
          value={editData.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="status-select"
        >
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {showTimeModal && (
        <>
          <div className="modal-overlay-bg" onClick={handleTimeCancel} />
          <div className="modal-overlay">
            <div className="modal-content">
              <h3>Task Completed! ✅</h3>
              <p>How much time did you spend on this task?</p>
              <div className="time-input-group">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={timeInput}
                  onChange={(e) => setTimeInput(e.target.value)}
                  placeholder="Enter time in hours (e.g., 1.5)"
                  className="time-input"
                  autoFocus
                />
                <span className="time-unit">hours</span>
              </div>
              <div className="modal-actions">
                <button className="modal-save" onClick={handleTimeSubmit}>
                  Save Time
                </button>
                <button className="modal-cancel" onClick={handleTimeCancel}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskItem;
