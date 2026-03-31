import { useState } from "react";
import { Plus, TrendingUp } from "lucide-react";

type GoalCategory = "fitness" | "finance" | "health" | "personal";

interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  progress: number; // 0-100
  target: string;
}

const categoryStyles: Record<GoalCategory, { label: string; color: string; bar: string }> = {
  fitness: { label: "Fitness", color: "bg-fitness/15 text-fitness", bar: "bg-fitness" },
  finance: { label: "Finance", color: "bg-finance/15 text-finance", bar: "bg-finance" },
  health: { label: "Health", color: "bg-health/15 text-health", bar: "bg-health" },
  personal: { label: "Personal", color: "bg-primary/15 text-primary", bar: "bg-primary" },
};

const defaultGoals: Goal[] = [
  { id: "1", title: "Run 50 miles this month", category: "fitness", progress: 64, target: "32/50 miles" },
  { id: "2", title: "Save $500", category: "finance", progress: 40, target: "$200/$500" },
  { id: "3", title: "Meditate daily", category: "health", progress: 80, target: "24/30 days" },
  { id: "4", title: "Read 4 books", category: "personal", progress: 50, target: "2/4 books" },
  { id: "5", title: "Drink 2L water daily", category: "health", progress: 90, target: "27/30 days" },
];

const GoalsTracker = () => {
  const [goals, setGoals] = useState<Goal[]>(defaultGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<GoalCategory>("personal");
  const [newTarget, setNewTarget] = useState("");

  const addGoal = () => {
    if (!newTitle.trim()) return;
    setGoals([
      ...goals,
      { id: Date.now().toString(), title: newTitle, category: newCategory, progress: 0, target: newTarget || "Not set" },
    ]);
    setNewTitle("");
    setNewTarget("");
    setShowAdd(false);
  };

  const avgProgress = goals.length > 0 ? Math.round(goals.reduce((s, g) => s + g.progress, 0) / goals.length) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Goals</h2>
          <p className="text-muted-foreground text-sm mt-1">
            <TrendingUp size={14} className="inline mr-1" />
            {avgProgress}% average progress
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <input
            type="text"
            placeholder="Goal title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
              className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {Object.entries(categoryStyles).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Target (e.g. 50 miles)"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={addGoal}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {goals.map((goal) => (
          <div key={goal.id} className="p-4 rounded-xl bg-card border border-border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">{goal.title}</h3>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryStyles[goal.category].color}`}>
                {categoryStyles[goal.category].label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${categoryStyles[goal.category].bar}`}
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">{goal.target}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GoalsTracker;
