import { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import TaskTable from "./components/TaskTable";
import TaskForm from "./components/TaskForm";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import Reports from "./components/Reports";
import AccountManagement from "./components/AccountManagement";
import ProfileSettings from "./components/ProfileSettings";
import AcceptInvite from "./components/AcceptInvite";
import { testApiConnection } from "./config/apiConfig";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("table");
  const [section, setSection] = useState("dashboard");
  const [accountName, setAccountName] = useState("");
  const [workspaces, setWorkspaces] = useState([]);
  const [billingInfo, setBillingInfo] = useState({
    billingName: "",
    billingEmail: "",
    billingCompany: "",
  });

  const storedUser = localStorage.getItem("user");
  const [user, setUser] = useState(storedUser ? JSON.parse(storedUser) : null);

  const getAuthHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  });

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setTasks([]);
    setWorkspaces([]);
    setAccountName("");
    setBillingInfo({ billingName: "", billingEmail: "", billingCompany: "" });
    setError(null);
  };

  // Authenticated fetch that auto-logouts on 401/403 (expired/invalid token)
  const authFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...options.headers,
      },
    });
    if (response.status === 401 || response.status === 403) {
      handleLogout();
      throw new Error("Session expired. Please log in again.");
    }
    return response;
  };

  const handleSwitchWorkspace = async (accountId) => {
    try {
      const res = await fetch(`/api/account/switch/${accountId}`, {
        method: "POST",
        headers: getAuthHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setTasks([]);
      // Update workspace name and mark active
      setWorkspaces((prev) =>
        prev.map((w) => ({ ...w, isActive: w.id === accountId })),
      );
      const infoRes = await fetch("/api/account/info", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
      });
      if (infoRes.ok) {
        const info = await infoRes.json();
        setAccountName(info.name);
        setBillingInfo({
          billingName: info.billingName || "",
          billingEmail: info.billingEmail || "",
          billingCompany: info.billingCompany || "",
        });
      }
      // Re-fetch tasks in new workspace context
      setTimeout(() => fetchTasks(), 0);
    } catch (_) {}
  };

  const handleCreateWorkspace = async (name) => {
    try {
      const res = await fetch("/api/account/workspaces", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ name }),
      });
      if (!res.ok) return;
      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data));
      setUser(data);
      setTasks([]);
      setAccountName(data.name);
      // Refresh workspace list
      const wsRes = await fetch("/api/account/my-workspaces", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
      });
      if (wsRes.ok) setWorkspaces(await wsRes.json());
    } catch (_) {}
  };

  useEffect(() => {
    if (!user) return;
    const initializeApp = async () => {
      const isApiReady = await testApiConnection();
      if (isApiReady) {
        // Always refresh role from profile to catch stale localStorage
        try {
          const res = await authFetch("/api/account/profile");
          if (res.ok) {
            const profile = await res.json();
            const updated = {
              ...user,
              role: profile.role,
              accountId: profile.accountId ?? user.accountId,
            };
            localStorage.setItem("user", JSON.stringify(updated));
            setUser(updated);
          }
        } catch (_) {
          return;
        }
        // Fetch account/workspace name for sidebar
        try {
          const res = await authFetch("/api/account/info");
          if (res.ok) {
            const info = await res.json();
            setAccountName(info.name);
            setBillingInfo({
              billingName: info.billingName || "",
              billingEmail: info.billingEmail || "",
              billingCompany: info.billingCompany || "",
            });
          }
        } catch (_) {}
        // Fetch all workspaces for the switcher
        try {
          const res = await authFetch("/api/account/my-workspaces");
          if (res.ok) setWorkspaces(await res.json());
        } catch (_) {}
        fetchTasks();
      } else {
        setError(
          "Cannot connect to backend. Make sure the server is running on http://localhost:5000",
        );
      }
    };
    initializeApp();
  }, [user?.id]);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authFetch("/api/tasks");
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(newTask),
      });
      if (!response.ok)
        throw new Error(`Server responded with status ${response.status}`);
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setError(null);
    } catch (err) {
      setError(`Failed to add task: ${err.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error(`Server responded with status ${response.status}`);
      setTasks(tasks.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });
      if (!response.ok)
        throw new Error(`Server responded with status ${response.status}`);
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      setError(null);
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
    }
  };

  if (!user) {
    // Handle accept-invite route before showing login
    if (
      window.location.pathname === "/accept-invite" ||
      window.location.search.includes("token=")
    ) {
      return <AcceptInvite onLogin={handleLogin} />;
    }
    return <Login onLogin={handleLogin} />;
  }

  const sectionTitles = {
    dashboard: "Dashboard",
    tasks: "Task List",
    "new-task": "New Task",
    reports: "Reports",
    account: "Team & Access",
    profile: "Profile Settings",
  };

  return (
    <div className="dashboard-layout">
      <Sidebar
        activeSection={section}
        onNavigate={setSection}
        userRole={user?.role}
        accountName={accountName}
        workspaces={workspaces}
        onSwitchWorkspace={handleSwitchWorkspace}
        onCreateWorkspace={handleCreateWorkspace}
        activeAccountId={user?.accountId}
      />

      <div className="dashboard-body">
        <header className="dashboard-header">
          <h2 className="page-title">{sectionTitles[section]}</h2>
          <div className="header-user">
            <div className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <main className="dashboard-main">
          {error && <div className="error-message">{error}</div>}

          {section === "dashboard" && (
            <DashboardOverview tasks={tasks} onNavigate={setSection} />
          )}

          {section === "new-task" && (
            <TaskForm
              onAddTask={handleAddTask}
              token={localStorage.getItem("token")}
            />
          )}

          {section === "tasks" && (
            <>
              <div className="view-toggle">
                <button
                  className={`toggle-btn ${view === "table" ? "active" : ""}`}
                  onClick={() => setView("table")}
                >
                  Table View
                </button>
                <button
                  className={`toggle-btn ${view === "cards" ? "active" : ""}`}
                  onClick={() => setView("cards")}
                >
                  Card View
                </button>
              </div>

              {loading ? (
                <div className="loading">Loading tasks...</div>
              ) : view === "table" ? (
                <TaskTable
                  tasks={tasks}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                />
              ) : (
                <TaskList
                  tasks={tasks}
                  onDeleteTask={handleDeleteTask}
                  onUpdateTask={handleUpdateTask}
                />
              )}
            </>
          )}
          {section === "reports" &&
            (user?.role === "admin" || user?.role === "manager") && (
              <Reports tasks={tasks} user={user} billingInfo={billingInfo} />
            )}
          {section === "reports" && user?.role === "member" && (
            <div style={{ padding: "2rem" }}>
              <h2>Access Denied</h2>
              <p>You do not have permission to view Reports.</p>
            </div>
          )}
          {section === "account" && (
            <AccountManagement
              user={user}
              onUserUpdate={handleUserUpdate}
              onAccountNameChange={setAccountName}
              onWorkspaceJoined={async () => {
                try {
                  const res = await fetch("/api/account/my-workspaces", {
                    headers: getAuthHeaders(),
                  });
                  if (res.ok) setWorkspaces(await res.json());
                } catch (_) {}
              }}
            />
          )}
          {section === "profile" && (
            <ProfileSettings user={user} onUserUpdate={handleUserUpdate} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
