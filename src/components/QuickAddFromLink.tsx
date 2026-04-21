import { useState } from "react";
import { Link2, Plus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useQuickLinks } from "@/hooks/useQuickLinks";

function detectService(url: string): { source: string; icon: string } | null {
  // Check for Google services first
  if (url.includes("classroom.google.com")) return { source: "Google Classroom", icon: "📚" };
  if (url.includes("mail.google.com")) return { source: "Gmail", icon: "📧" };
  if (url.includes("drive.google.com")) return { source: "Google Drive", icon: "📁" };
  if (url.includes("docs.google.com/document")) return { source: "Google Docs", icon: "📝" };
  if (url.includes("docs.google.com/presentation")) return { source: "Google Slides", icon: "📊" };
  if (url.includes("docs.google.com/spreadsheets")) return { source: "Google Sheets", icon: "📈" };
  if (url.includes("sites.google.com")) return { source: "Google Sites", icon: "🌐" };
  if (url.includes("calendar.google.com")) return { source: "Google Calendar", icon: "📅" };
  
  // Generic URL detection for any other website
  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www\./, "");
    const icon = "🔗";
    
    // Try to extract a friendly name from the domain
    const name = domain
      .split(".")[0]
      .replace(/-/g, " ")
      .replace(/^./, (c) => c.toUpperCase());
    
    return { source: name || domain, icon };
  } catch {
    return { source: "Website", icon: "🔗" };
  }
}

function extractTitleFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const pathParts = u.pathname.split("/").filter(Boolean);
    // Try to get a readable name from the path
    const last = pathParts[pathParts.length - 1];
    if (last && last !== "d" && last !== "edit" && last.length > 3) {
      return decodeURIComponent(last).replace(/[-_]/g, " ");
    }
    return "Untitled item";
  } catch {
    return "Untitled item";
  }
}

const QuickAddFromLink = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const { links, addLink } = useQuickLinks();

  // Show only the most recently added 5 links here for reference
  const recentLinks = links.slice(-5).reverse();

  const handleAdd = () => {
    if (!url.trim()) {
      toast.error("Please paste a URL");
      return;
    }

    // Basic URL validation
    let validatedUrl = url.trim();
    if (!validatedUrl.startsWith("http://") && !validatedUrl.startsWith("https://")) {
      validatedUrl = "https://" + validatedUrl;
    }

    const service = detectService(validatedUrl);
    if (!service) {
      toast.error("Please enter a valid URL");
      return;
    }

    const itemTitle = title.trim() || extractTitleFromUrl(validatedUrl);
    addLink({
      title: itemTitle,
      description: service.source,
      url: validatedUrl,
      icon: service.icon,
      bgColor: "bg-primary/10",
    });

    setUrl("");
    setTitle("");
    toast.success(`Saved to Quick Links`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Quick Add</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Paste Google links to save assignments, docs, and resources
        </p>
      </div>

      {/* Add form */}
      <div className="p-4 rounded-xl bg-card border border-border space-y-3">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-muted-foreground shrink-0" />
          <Input
            placeholder="Paste any URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Title (optional — auto-detected from link)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />
          <Button onClick={handleAdd} size="sm" className="shrink-0">
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Supports any website URL — Google Classroom, Gmail, Drive, Docs, YouTube, and more
        </p>
      </div>

      {/* Saved links */}
      {savedLinks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Saved Links</h3>
          {savedLinks.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors group"
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.source}</p>
              </div>
              <ExternalLink size={14} className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
            </a>
          ))}
        </div>
      )}

      {savedLinks.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Link2 size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">No links saved yet</p>
          <p className="text-xs mt-1">Paste a Google link above to get started</p>
        </div>
      )}
    </div>
  );
};

export default QuickAddFromLink;
