import "./TaskList.css";
import TaskItem from "./TaskItem";

function TaskList({ tasks, onDeleteTask, onUpdateTask }) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return (
      <div className="empty-state">
        <p>No tasks yet. Create your first task above!</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      <h2>Tasks ({tasks.length})</h2>
      <div className="tasks-container">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
            onUpdate={onUpdateTask}
          />
        ))}
      </div>
    </div>
  );
}

export default TaskList;
