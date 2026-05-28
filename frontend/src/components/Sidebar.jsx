import { useState, useRef, useEffect } from "react";
import "./Sidebar.css";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: "⊞" },
  { key: "tasks", label: "Task List", icon: "≡" },
  { key: "new-task", label: "New Task", icon: "+" },
  { key: "reports", label: "Reports", icon: "⬇" },
];

// Nav items visible only to admins and managers
const RESTRICTED_KEYS = ["reports"];

const ACCOUNT_ITEMS = [
  { key: "account", label: "Team & Access", icon: "👥" },
  { key: "profile", label: "Profile Settings", icon: "⚙" },
];

const ROLE_BADGE = { admin: "Admin", manager: "Mgr", member: "Member" };

function Sidebar({
  activeSection,
  onNavigate,
  userRole,
  accountName,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  activeAccountId,
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const pickerRef = useRef(null);

  // Close picker when clicking outside
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerOpen(false);
        setCreating(false);
        setNewName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [pickerOpen]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    onCreateWorkspace(newName.trim());
    setNewName("");
    setCreating(false);
    setPickerOpen(false);
  };

  return (
    <aside className="sidebar">
      {/* Workspace switcher */}
      <div className="sidebar-workspace-picker" ref={pickerRef}>
        <button
          className="sidebar-workspace-btn"
          onClick={() => setPickerOpen((o) => !o)}
          title="Switch workspace"
        >
          <span className="sidebar-logo-icon">⬡</span>
          <div className="sidebar-logo-text-wrap">
            <span className="sidebar-logo-text">WorkMS</span>
            {accountName && (
              <span className="sidebar-workspace-name">{accountName}</span>
            )}
          </div>
          <span className="sidebar-picker-chevron">
            {pickerOpen ? "▲" : "▼"}
          </span>
        </button>

        {pickerOpen && (
          <div className="sidebar-picker-dropdown">
            <div className="sidebar-picker-label">Your Workspaces</div>
            {workspaces &&
              workspaces.map((ws) => (
                <button
                  key={ws.id}
                  className={`sidebar-picker-item ${ws.id === activeAccountId ? "active" : ""}`}
                  onClick={() => {
                    if (ws.id !== activeAccountId) onSwitchWorkspace(ws.id);
                    setPickerOpen(false);
                  }}
                >
                  <span className="sidebar-picker-ws-name">{ws.name}</span>
                  <span className={`sidebar-picker-role role-${ws.role}`}>
                    {ROLE_BADGE[ws.role] || ws.role}
                  </span>
                </button>
              ))}

            <div className="sidebar-picker-divider" />

            {creating ? (
              <div className="sidebar-picker-create-form">
                <input
                  className="sidebar-picker-input"
                  placeholder="Workspace name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
                <div className="sidebar-picker-create-actions">
                  <button
                    className="sidebar-picker-create-btn"
                    onClick={handleCreate}
                  >
                    Create
                  </button>
                  <button
                    className="sidebar-picker-cancel-btn"
                    onClick={() => {
                      setCreating(false);
                      setNewName("");
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="sidebar-picker-new"
                onClick={() => setCreating(true)}
              >
                <span>＋</span> New Workspace
              </button>
            )}
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.filter(
          (item) =>
            !RESTRICTED_KEYS.includes(item.key) ||
            userRole === "admin" ||
            userRole === "manager",
        ).map((item) => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${activeSection === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}

        <div className="sidebar-section-divider" />

        {ACCOUNT_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`sidebar-nav-item ${activeSection === item.key ? "active" : ""}`}
            onClick={() => onNavigate(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
