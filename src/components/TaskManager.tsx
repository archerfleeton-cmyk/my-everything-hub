import { useMemo, useState } from "react";
import { Plus, Check, Trash2, Clock, Calendar, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWeeklySchedule, parseTime12h, colorToCategory } from "@/hooks/useWeeklySchedule";

type Category = "chore" | "sport" | "fitness" | "finance" | "health" | "personal";

interface Task {
  id: string;
  title: string;
  category: Category;
  completed: boolean;
  time?: string; // HH:MM format
  date?: string; // YYYY-MM-DD
}

const categoryConfig: Record<Category, { label: string; color: string }> = {
  chore: { label: "Chore", color: "bg-chore/15 text-chore" },
  sport: { label: "Sports", color: "bg-sport/15 text-sport" },
  fitness: { label: "Fitness", color: "bg-fitness/15 text-fitness" },
  finance: { label: "Finance", color: "bg-finance/15 text-finance" },
  health: { label: "Health", color: "bg-health/15 text-health" },
  personal: { label: "Personal", color: "bg-primary/15 text-primary" },
};

const todayStr = () => new Date().toISOString().split("T")[0];

const defaultTasks: Task[] = [
  { id: "1", title: "Make the bed", category: "chore", completed: false, time: "07:00", date: todayStr() },
  { id: "2", title: "Walk the dog", category: "chore", completed: false, time: "08:00", date: todayStr() },
  { id: "3", title: "Pick up dog poop", category: "chore", completed: true, time: "08:30", date: todayStr() },
  { id: "4", title: "30 min run", category: "fitness", completed: false, time: "06:00", date: todayStr() },
  { id: "5", title: "Review budget spreadsheet", category: "finance", completed: false, time: "18:00", date: todayStr() },
  { id: "6", title: "Drink 8 glasses of water", category: "health", completed: false, date: todayStr() },
  { id: "7", title: "Soccer practice at 4pm", category: "sport", completed: false, time: "16:00", date: todayStr() },
];

function formatTime(time?: string): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function formatDate(date?: string): string {
  if (!date) return "";
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [completedSchedule, setCompletedSchedule] = useState<Record<string, boolean>>({});
  const { week } = useWeeklySchedule();
  const [newTask, setNewTask] = useState("");
  const [newCategory, setNewCategory] = useState<Category>("chore");
  const [newTime, setNewTime] = useState("");
  const [newDate, setNewDate] = useState(todayStr());
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all");

  // Edit dialog state
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState<Category>("chore");

  // Schedule entries for today, mapped to Task shape (edit via Dashboard)
  const scheduleTasks: Task[] = useMemo(() => {
    const dow = new Date().getDay();
    const entries = week[dow] || [];
    return entries.map((e) => ({
      id: `sched-${e.id}`,
      title: e.title,
      category: colorToCategory(e.color) as Category,
      completed: !!completedSchedule[e.id],
      time: parseTime12h(e.time),
      date: todayStr(),
    }));
  }, [week, completedSchedule]);

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        title: newTask,
        category: newCategory,
        completed: false,
        time: newTime || undefined,
        date: newDate || todayStr(),
      },
    ]);
    setNewTask("");
    setNewTime("");
  };

  const toggleTask = (id: string) => {
    if (id.startsWith("sched-")) {
      const realId = id.slice(6);
      setCompletedSchedule((prev) => ({ ...prev, [realId]: !prev[realId] }));
      return;
    }
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: string) => {
    if (id.startsWith("sched-")) return;
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const openEdit = (task: Task) => {
    if (task.id.startsWith("sched-")) return;
    setEditingTask(task);
    setEditTitle(task.title);
    setEditTime(task.time || "");
    setEditDate(task.date || "");
    setEditCategory(task.category);
  };

  const saveEdit = () => {
    if (!editingTask) return;
    setTasks(tasks.map((t) =>
      t.id === editingTask.id
        ? { ...t, title: editTitle, time: editTime || undefined, date: editDate || undefined, category: editCategory }
        : t
    ));
    setEditingTask(null);
  };

  const allTasks = useMemo(() => [...scheduleTasks, ...tasks], [scheduleTasks, tasks]);
  const filtered = filterCategory === "all" ? allTasks : allTasks.filter((t) => t.category === filterCategory);
  const completedCount = allTasks.filter((t) => t.completed).length;

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
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add a new task..."
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-card border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            onClick={addTask}
            className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Plus size={18} />
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value as Category)}
            className="px-3 py-1.5 rounded-lg bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {Object.entries(categoryConfig).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-card border border-border">
            <Clock size={12} className="text-muted-foreground" />
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="bg-transparent text-foreground text-xs focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-card border border-border">
            <Calendar size={12} className="text-muted-foreground" />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="bg-transparent text-foreground text-xs focus:outline-none"
            />
          </div>
        </div>
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
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors shrink-0 ${
                task.completed
                  ? "bg-primary border-primary text-primary-foreground"
                  : "border-border hover:border-primary"
              }`}
            >
              {task.completed && <Check size={12} />}
            </button>
            <div className="flex-1 min-w-0">
              <span
                className={`text-sm block ${
                  task.completed ? "line-through text-muted-foreground" : "text-foreground"
                }`}
              >
                {task.title}
              </span>
              {(task.time || task.date) && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  {task.time && <><Clock size={10} /> {formatTime(task.time)}</>}
                  {task.time && task.date && <span className="mx-1">·</span>}
                  {task.date && formatDate(task.date)}
                </span>
              )}
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${categoryConfig[task.category].color}`}>
              {categoryConfig[task.category].label}
            </span>
            <button
              onClick={() => openEdit(task)}
              className="p-1 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil size={14} />
            </button>
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

      {/* Edit Dialog */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Time</Label>
                <Input type="time" value={editTime} onChange={(e) => setEditTime(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={editDate} onChange={(e) => setEditDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value as Category)}
                className="w-full px-3 py-2 rounded-lg bg-card border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {Object.entries(categoryConfig).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={saveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManager;
