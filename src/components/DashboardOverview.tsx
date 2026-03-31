import { CheckSquare, Calendar, Target, Link2, Sun, Cloud, Zap } from "lucide-react";

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

interface DashboardOverviewProps {
  onNavigate: (view: "tasks" | "calendar" | "goals" | "links" | "study") => void;
}

const DashboardOverview = ({ onNavigate }: DashboardOverviewProps) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
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
        <QuickStat
          icon={CheckSquare}
          label="Tasks Today"
          value="4 remaining"
          accent="bg-primary/10 text-primary"
          onClick={() => onNavigate("tasks")}
        />
        <QuickStat
          icon={Calendar}
          label="Events"
          value="2 upcoming"
          accent="bg-sport/10 text-sport"
          onClick={() => onNavigate("calendar")}
        />
        <QuickStat
          icon={Target}
          label="Goals"
          value="64% avg"
          accent="bg-fitness/10 text-fitness"
          onClick={() => onNavigate("goals")}
        />
        <QuickStat
          icon={Link2}
          label="Quick Links"
          value="6 apps"
          accent="bg-accent/10 text-accent"
          onClick={() => onNavigate("links")}
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-serif text-lg text-foreground mb-4">Today's Schedule</h3>
        <div className="space-y-3">
          <ScheduleItem time="7:00 AM" title="Gym Session" color="bg-fitness" />
          <ScheduleItem time="9:00 AM" title="Classes begin" color="bg-info" />
          <ScheduleItem time="2:00 PM" title="Study Group" color="bg-info" />
          <ScheduleItem time="4:00 PM" title="Soccer Practice" color="bg-sport" />
          <ScheduleItem time="6:00 PM" title="Walk the dog" color="bg-chore" />
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

function QuickStat({
  icon: Icon,
  label,
  value,
  accent,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-start gap-3 p-4 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all text-left"
    >
      <div className={`w-9 h-9 rounded-lg ${accent} flex items-center justify-center shrink-0`}>
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground mt-0.5">{value}</p>
      </div>
    </button>
  );
}

function ScheduleItem({ time, title, color }: { time: string; title: string; color: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-muted-foreground w-16 shrink-0">{time}</span>
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-sm text-foreground">{title}</span>
    </div>
  );
}

function QuickAction({ emoji, label, href }: { emoji: string; label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-sm transition-all"
    >
      <span className="text-xl">{emoji}</span>
      <span className="text-sm font-medium text-foreground">{label}</span>
    </a>
  );
}

export default DashboardOverview;
