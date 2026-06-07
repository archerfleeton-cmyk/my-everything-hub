import QuickLinks from "@/components/QuickLinks";
import { EditModeProvider } from "@/components/EditModeContext";

const Index = () => {
  return (
    <EditModeProvider>
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 py-5">
            <h1 className="text-2xl font-serif text-foreground tracking-tight">E Link</h1>
          </div>
        </header>
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
