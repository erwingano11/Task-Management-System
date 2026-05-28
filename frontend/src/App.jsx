import { useState, useEffect } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import { testApiConnection } from "./config/apiConfig";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiReady, setApiReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      const isApiReady = await testApiConnection();
      setApiReady(isApiReady);
      if (isApiReady) {
        fetchTasks();
      } else {
        setError(
          "Cannot connect to backend. Make sure the server is running on http://localhost:5000",
        );
      }
    };
    initializeApp();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tasks");
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        setTasks([]);
        setError("Invalid response format from server");
      }
    } catch (err) {
      setError(`Failed to fetch tasks: ${err.message}`);
      setTasks([]);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (newTask) => {
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTask),
      });
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
      setError(null);
    } catch (err) {
      setError(`Failed to add task: ${err.message}`);
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      setTasks(tasks.filter((task) => task.id !== taskId));
      setError(null);
    } catch (err) {
      setError(`Failed to delete task: ${err.message}`);
      console.error(err);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
      const updatedTask = await response.json();
      setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)));
      setError(null);
    } catch (err) {
      setError(`Failed to update task: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Work Management System</h1>
      </header>

      <main className="app-main">
        <TaskForm onAddTask={handleAddTask} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading tasks...</div>
        ) : (
          <TaskList
            tasks={tasks}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
          />
        )}
      </main>
    </div>
  );
}

export default App;
