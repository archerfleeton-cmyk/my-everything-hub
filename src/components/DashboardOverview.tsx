import { useState } from "react";
import { CheckSquare, Calendar, Target, Link2, Zap, Trash2, Plus } from "lucide-react";
import { useEditMode } from "@/components/EditModeContext";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
};

const today = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  month: "long",
  day: "numeric",
});

interface ScheduleEntry {
  id: string;
  time: string;
  title: string;
  color: string;
}

interface DashboardOverviewProps {
  onNavigate: (view: "tasks" | "calendar" | "goals" | "links" | "study") => void;
}

const defaultSchedule: ScheduleEntry[] = [
  { id: "1", time: "7:00 AM", title: "Gym Session", color: "bg-fitness" },
  { id: "2", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
  { id: "3", time: "2:00 PM", title: "Study Group", color: "bg-info" },
  { id: "4", time: "4:00 PM", title: "Soccer Practice", color: "bg-sport" },
  { id: "5", time: "6:00 PM", title: "Walk the dog", color: "bg-chore" },
];

const colorOptions = [
  { label: "Fitness", value: "bg-fitness" },
  { label: "School", value: "bg-info" },
  { label: "Sports", value: "bg-sport" },
  { label: "Chore", value: "bg-chore" },
  { label: "Health", value: "bg-health" },
  { label: "Finance", value: "bg-finance" },
];

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  const [schedule, setSchedule] = useState<ScheduleEntry[]>(defaultSchedule);
  const [showAdd, setShowAdd] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("bg-primary");
  const { editMode } = useEditMode();

  const updateEntry = (id: string, field: keyof ScheduleEntry, value: string) => {
    setSchedule(schedule.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const deleteEntry = (id: string) => {
    setSchedule(schedule.filter((s) => s.id !== id));
  };

  const addEntry = () => {
    if (!newTitle.trim() || !newTime.trim()) return;
    setSchedule([...schedule, { id: Date.now().toString(), time: newTime, title: newTitle, color: newColor }]);
    setNewTime("");
    setNewTitle("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-3xl font-serif text-foreground">{greeting()} ☀️</h2>
          <p className="text-muted-foreground text-sm mt-1">{today}</p>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Zap size={14} className="text-accent" />
          <span>Stay on track</span>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat icon={CheckSquare} label="Tasks Today" value="4 remaining" accent="bg-primary/10 text-primary" onClick={() => onNavigate("tasks")} />
        <QuickStat icon={Calendar} label="Events" value="2 upcoming" accent="bg-sport/10 text-sport" onClick={() => onNavigate("calendar")} />
        <QuickStat icon={Target} label="Goals" value="64% avg" accent="bg-fitness/10 text-fitness" onClick={() => onNavigate("goals")} />
        <QuickStat icon={Link2} label="Quick Links" value="6 apps" accent="bg-accent/10 text-accent" onClick={() => onNavigate("links")} />
      </div>

      {/* Today's Schedule */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-foreground">Today's Schedule</h3>
          {editMode && (
            <button onClick={() => setShowAdd(!showAdd)} className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90">
              <Plus size={16} />
            </button>
          )}
        </div>

        {showAdd && editMode && (
          <div className="flex gap-2 mb-4 flex-wrap">
            <input type="text" placeholder="Time (e.g. 3:00 PM)" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm" />
            <input type="text" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1 px-3 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm" />
            <select value={newColor} onChange={(e) => setNewColor(e.target.value)} className="px-3 py-1.5 rounded-lg bg-background border border-border text-foreground text-sm">
              {colorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={addEntry} className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Add</button>
          </div>
        )}

        <div className="space-y-3">
          {schedule.map((entry) => (
            <div key={entry.id} className="flex items-center gap-3">
              {editMode ? (
                <>
                  <input value={entry.time} onChange={(e) => updateEntry(entry.id, "time", e.target.value)} className="text-xs text-muted-foreground w-20 bg-transparent border-b border-dashed border-primary/40 focus:outline-none" />
                  <div className={`w-2 h-2 rounded-full ${entry.color}`} />
                  <input value={entry.title} onChange={(e) => updateEntry(entry.id, "title", e.target.value)} className="flex-1 text-sm text-foreground bg-transparent border-b border-dashed border-primary/40 focus:outline-none" />
                  <button onClick={() => deleteEntry(entry.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </>
              ) : (
                <>
                  <span className="text-xs text-muted-foreground w-16 shrink-0">{entry.time}</span>
                  <div className={`w-2 h-2 rounded-full ${entry.color}`} />
                  <span className="text-sm text-foreground">{entry.title}</span>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <QuickAction emoji="📚" label="Google Classroom" href="https://classroom.google.com" />
        <QuickAction emoji="✉️" label="Gmail" href="https://mail.google.com" />
        <QuickAction emoji="📁" label="Google Drive" href="https://drive.google.com" />
      </div>
    </div>
  );
};

function QuickStat({ icon: Icon, label, value, accent, onClick }: { icon: React.ElementType; label: string; value: string; accent: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left">
      <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center shrink-0`}><Icon size={16} /></div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </button>
  );
}

function QuickAction({ emoji, label, href }: { emoji: string; label: string; href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all">
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </a>
  );
}

export default DashboardOverview;
