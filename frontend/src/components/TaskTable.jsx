import { useState } from "react";
import "./TaskTable.css";

function TaskTable({ tasks, onDeleteTask, onUpdateTask }) {
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [pendingUpdate, setPendingUpdate] = useState(null);
  const [timeInput, setTimeInput] = useState("");

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task above!</p>
      </div>
    );
  }

  const toDatetimeLocal = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toISOString().slice(0, 16);
  };

  const startEdit = (task) => {
    setEditingId(task.id);
    setEditData({
      title: task.title,
      description: task.description || "",
      status: task.status,
      timeSpent: task.timeSpent || 0,
      completedAt: toDatetimeLocal(task.completedAt),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
  };

  const nowLocal = () => new Date().toISOString().slice(0, 16);

  const saveEdit = (task) => {
    if (editData.status === "completed" && task.status !== "completed") {
      const dataWithDate = {
        ...editData,
        completedAt: editData.completedAt || nowLocal(),
      };
      setPendingUpdate({ id: task.id, data: dataWithDate });
      setTimeInput("");
      setShowTimeModal(true);
    } else {
      onUpdateTask(task.id, editData);
      setEditingId(null);
    }
  };

  const handleStatusChange = (task, newStatus) => {
    if (editingId === task.id) {
      if (newStatus === "completed" && task.status !== "completed") {
        const updated = {
          ...editData,
          status: newStatus,
          completedAt: editData.completedAt || nowLocal(),
        };
        setEditData(updated);
        setPendingUpdate({ id: task.id, data: updated });
        setTimeInput("");
        setShowTimeModal(true);
      } else {
        setEditData((prev) => ({ ...prev, status: newStatus }));
      }
    } else {
      if (newStatus === "completed" && task.status !== "completed") {
        setPendingUpdate({
          id: task.id,
          data: {
            title: task.title,
            description: task.description,
            status: newStatus,
            timeSpent: task.timeSpent || 0,
            completedAt: nowLocal(),
          },
        });
        setTimeInput("");
        setShowTimeModal(true);
      } else {
        onUpdateTask(task.id, { ...task, status: newStatus });
      }
    }
  };

  const handleTimeSubmit = () => {
    const input = parseFloat(timeInput) || 0;
    if (input < 0) {
      alert("Please enter a valid time");
      return;
    }
    const minutes = input < 24 ? Math.round(input * 60) : input;
    onUpdateTask(pendingUpdate.id, {
      ...pendingUpdate.data,
      timeSpent: minutes,
    });
    setShowTimeModal(false);
    setTimeInput("");
    setPendingUpdate(null);
    setEditingId(null);
  };

  const handleTimeCancel = () => {
    setShowTimeModal(false);
    setTimeInput("");
    setPendingUpdate(null);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "completed":
        return "badge badge-completed";
      case "in-progress":
        return "badge badge-inprogress";
      case "pending":
        return "badge badge-pending";
      default:
        return "badge";
    }
  };

  const formatDate = (dateStr) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "—";

  const formatTime = (minutes) =>
    minutes ? `${(minutes / 60).toFixed(1)} hrs` : "—";

  return (
    <div className="task-table-wrapper">
      <h2 className="task-table-title">Tasks ({tasks.length})</h2>
      <div className="task-table-scroll">
        <table className="task-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Description</th>
              <th>Status</th>
              <th>Assigned To</th>
              <th>Time Spent</th>
              <th>Created</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => {
              const isEditing = editingId === task.id;
              return (
                <tr
                  key={task.id || `task-${index}`}
                  className={isEditing ? "row-editing" : ""}
                >
                  <td className="col-index">{index + 1}</td>

                  {/* Title */}
                  <td className="col-title">
                    {isEditing ? (
                      <input
                        className="table-input"
                        value={editData.title}
                        onChange={(e) =>
                          setEditData((p) => ({ ...p, title: e.target.value }))
                        }
                      />
                    ) : (
                      <span className="task-title-text">{task.title}</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="col-desc">
                    {isEditing ? (
                      <textarea
                        className="table-textarea"
                        value={editData.description}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            description: e.target.value,
                          }))
                        }
                        rows={2}
                      />
                    ) : (
                      <span className="desc-text">
                        {task.description || "—"}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="col-status">
                    <select
                      className={`table-status-select ${getStatusBadgeClass(isEditing ? editData.status : task.status)}`}
                      value={isEditing ? editData.status : task.status}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>

                  {/* Assigned To */}
                  <td className="col-assigned">{task.assignedTo || "—"}</td>

                  {/* Time Spent */}
                  <td className="col-time">{formatTime(task.timeSpent)}</td>

                  {/* Created */}
                  <td className="col-date">{formatDate(task.createdAt)}</td>

                  {/* Completed */}
                  <td className="col-date">
                    {isEditing ? (
                      <input
                        type="datetime-local"
                        className="table-input"
                        value={editData.completedAt}
                        onChange={(e) =>
                          setEditData((p) => ({
                            ...p,
                            completedAt: e.target.value,
                          }))
                        }
                      />
                    ) : (
                      formatDate(task.completedAt)
                    )}
                  </td>

                  {/* Actions */}
                  <td className="col-actions">
                    {isEditing ? (
                      <>
                        <button
                          className="btn-save"
                          onClick={() => saveEdit(task)}
                        >
                          Save
                        </button>
                        <button className="btn-cancel" onClick={cancelEdit}>
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="btn-edit"
                          onClick={() => startEdit(task)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => onDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

export default TaskTable;
