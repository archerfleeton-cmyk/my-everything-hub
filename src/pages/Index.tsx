import QuickLinks from "@/components/QuickLinks";
import { EditModeProvider, useEditMode } from "@/components/EditModeContext";
import { Pencil } from "lucide-react";

const Header = () => {
  const { editMode, toggleEditMode } = useEditMode();
  return (
    <header className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-5 flex items-center justify-between">
        <h1 className="text-2xl font-serif text-foreground tracking-tight">evlink</h1>
        <button
          onClick={toggleEditMode}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            editMode ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Pencil size={16} />
          <span>{editMode ? "Done" : "Edit"}</span>
        </button>
      </div>
    </header>
  );
};

const Index = () => {
  return (
    <EditModeProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <div className="max-w-4xl mx-auto p-6 lg:p-8">
            <QuickLinks />
          </div>
        </main>
      </div>
    </EditModeProvider>
  );
};

export default Index;
