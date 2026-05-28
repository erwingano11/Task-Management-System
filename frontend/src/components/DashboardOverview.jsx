import "./DashboardOverview.css";

function StatCard({ label, value, color, icon }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

function DashboardOverview({ tasks, onNavigate }) {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const completed = tasks.filter((t) => t.status === "completed").length;

  const recent = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const statusBadge = (status) => {
    const map = {
      pending: { label: "Pending", cls: "badge--pending" },
      "in-progress": { label: "In Progress", cls: "badge--progress" },
      completed: { label: "Completed", cls: "badge--done" },
    };
    const s = map[status] || { label: status, cls: "" };
    return <span className={`badge ${s.cls}`}>{s.label}</span>;
  };

  return (
    <div className="dashboard-overview">
      <h2 className="section-title">Overview</h2>

      <div className="stats-grid">
        <StatCard label="Total Tasks" value={total} color="purple" icon="⊞" />
        <StatCard label="Pending" value={pending} color="orange" icon="◷" />
        <StatCard
          label="In Progress"
          value={inProgress}
          color="blue"
          icon="↻"
        />
        <StatCard label="Completed" value={completed} color="green" icon="✓" />
      </div>

      <div className="recent-section">
        <div className="recent-header">
          <h3>Recent Tasks</h3>
          <button className="view-all-btn" onClick={() => onNavigate("tasks")}>
            View all →
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="no-tasks">
            No tasks yet.{" "}
            <button className="link-btn" onClick={() => onNavigate("new-task")}>
              Create one
            </button>
          </div>
        ) : (
          <table className="recent-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((task) => (
                <tr key={task.id}>
                  <td className="task-title-cell">{task.title}</td>
                  <td>{statusBadge(task.status)}</td>
                  <td className="date-cell">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default DashboardOverview;
