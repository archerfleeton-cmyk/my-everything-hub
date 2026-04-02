import { useState } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  Link2,
  Target,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardPaste,
  Pencil,
} from "lucide-react";
import { useEditMode } from "@/components/EditModeContext";

type View = "dashboard" | "tasks" | "calendar" | "links" | "goals" | "study" | "quickadd";
interface AppSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
}

const navItems: { id: View; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "tasks", label: "Tasks", icon: CheckSquare },
  { id: "calendar", label: "Calendar", icon: Calendar },
  { id: "goals", label: "Goals", icon: Target },
  { id: "quickadd", label: "Quick Add", icon: ClipboardPaste },
  { id: "links", label: "Quick Links", icon: Link2 },
  { id: "study", label: "Study Tools", icon: BookOpen },
];

const AppSidebar = ({ activeView, onViewChange }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const { editMode, toggleEditMode } = useEditMode();

  return (
    <aside
      className={`flex flex-col bg-card border-r border-border transition-all duration-300 ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!collapsed && (
          <h1 className="text-xl font-serif text-foreground tracking-tight">
            MyHub
          </h1>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <button
          onClick={toggleEditMode}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            editMode
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Pencil size={18} />
          {!collapsed && <span>{editMode ? "Exit Edit Mode" : "Edit Mode"}</span>}
        </button>
      </div>

      <div className="p-4 border-t border-border">
        {!collapsed && (
          <p className="text-xs text-muted-foreground">
            {editMode ? "✏️ Editing — tap anything to change it" : "Your personal command center"}
          </p>
        )}
      </div>
    </aside>
  );
};

export default AppSidebar;
