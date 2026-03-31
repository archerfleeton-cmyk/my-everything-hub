import { useState } from "react";
import { Plus, Check, Trash2 } from "lucide-react";

type Category = "chore" | "sport" | "fitness" | "finance" | "health" | "personal";

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
}

const categoryConfig: Record<Category, { label: string; color: string }> = {
  chore: { label: "Chore", color: "bg-chore/15 text-chore" },
  sport: { label: "Sports", color: "bg-sport/15 text-sport" },
  fitness: { label: "Fitness", color: "bg-fitness/15 text-fitness" },
  finance: { label: "Finance", color: "bg-finance/15 text-finance" },
  health: { label: "Health", color: "bg-health/15 text-health" },
  personal: { label: "Personal", color: "bg-primary/15 text-primary" },
};

const defaultTasks: Task[] = [
  { id: "1", title: "Make the bed", category: "chore", completed: false },
  { id: "2", title: "Walk the dog", category: "chore", completed: false },
  { id: "3", title: "Pick up dog poop", category: "chore", completed: true },
  { id: "4", title: "30 min run", category: "fitness", completed: false },
  { id: "5", title: "Review budget spreadsheet", category: "finance", completed: false },
  { id: "6", title: "Drink 8 glasses of water", category: "health", completed: false },
  { id: "7", title: "Soccer practice at 4pm", category: "sport", completed: false },
];

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("chore");
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      { id: Date.now().toString(), title: newTask, category: newCategory, completed: false },
    ]);
    setNewTask("");
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const filtered = filterCategory === "all" ? tasks : tasks.filter((t) => t.category === filterCategory);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Tasks</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {completedCount}/{tasks.length} completed today
        </p>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }}
        />
      </div>

      {/* Add task */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addTask()}
          className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <select
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value as Category)}
          className="px-3 py-2.5 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {Object.entries(categoryConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <button
          onClick={addTask}
          className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCategory("all")}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            filterCategory === "all" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          All
        </button>
        {Object.entries(categoryConfig).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setFilterCategory(key as Category)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              filterCategory === key ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {val.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map((task) => (
          <div
            key={task.id}
            className={`flex items-center gap-3 p-3 rounded-lg bg-card border border-border transition-all ${
              task.completed ? "opacity-60" : ""
            }`}
          >
            <button
              onClick={() => toggleTask(task.id)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {task.completed && <Check size={12} />}
            </button>
            <span
              className={`flex-1 text-sm ${
                task.completed ? "line-through text-muted-foreground" : "text-foreground"
              }`}
            >
              {task.title}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryConfig[task.category].color}`}>
              {categoryConfig[task.category].label}
            </span>
            <button
              onClick={() => deleteTask(task.id)}
              className="p-1 text-muted-foreground hover:text-destructive transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground text-sm py-8">No tasks in this category</p>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
