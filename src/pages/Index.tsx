import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import DashboardOverview from "@/components/DashboardOverview";
import TaskManager from "@/components/TaskManager";
import CalendarView from "@/components/CalendarView";
import QuickLinks from "@/components/QuickLinks";
import GoalsTracker from "@/components/GoalsTracker";

type View = "dashboard" | "tasks" | "calendar" | "links" | "goals";

const Index = () => {
  const [activeView, setActiveView] = useState<View>("dashboard");

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar activeView={activeView} onViewChange={setActiveView} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 lg:p-8">
          {activeView === "dashboard" && <DashboardOverview onNavigate={setActiveView} />}
          {activeView === "tasks" && <TaskManager />}
          {activeView === "calendar" && <CalendarView />}
          {activeView === "links" && <QuickLinks />}
          {activeView === "goals" && <GoalsTracker />}
        </div>
      </main>
    </div>
  );
};

export default Index;
