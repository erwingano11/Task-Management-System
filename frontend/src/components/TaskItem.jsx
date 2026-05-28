import { useState } from "react";
import "./TaskItem.css";

function TaskItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    status: task.status,
  });

  const handleStatusChange = (newStatus) => {
    setEditData((prev) => ({ ...prev, status: newStatus }));
    onUpdate(task.id, { ...editData, status: newStatus });
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
          <p className="task-date">
            {new Date(task.createdAt).toLocaleDateString()}
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
    </div>
  );
}

export default TaskItem;
