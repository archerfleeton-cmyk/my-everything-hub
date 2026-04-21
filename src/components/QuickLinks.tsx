import { useState } from "react";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { useEditMode } from "@/components/EditModeContext";
import { useQuickLinks, QuickLink } from "@/hooks/useQuickLinks";

const QuickLinks = () => {
  const { links, setLinks } = useQuickLinks();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newIcon, setNewIcon] = useState("🔗");
  const { editMode } = useEditMode();

  const addLink = () => {
    if (!newTitle.trim() || !newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    setLinks([...links, { id: Date.now().toString(), title: newTitle, description: "", url, icon: newIcon, bgColor: "bg-primary/10" }]);
    setNewTitle("");
    setNewUrl("");
    setNewIcon("🔗");
    setShowAdd(false);
  };

  const updateLink = (id: string, field: keyof QuickLink, value: string) => {
    setLinks(links.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const deleteLink = (id: string) => {
    setLinks(links.filter((l) => l.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Quick Links</h2>
          <p className="text-muted-foreground text-sm mt-1">Jump to your favorite sites and apps</p>
        </div>
        {editMode && (
          <button onClick={() => setShowAdd(!showAdd)} className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Plus size={18} />
          </button>
        )}
      </div>

      {showAdd && editMode && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <div className="flex gap-2">
            <input type="text" placeholder="Icon emoji" value={newIcon} onChange={(e) => setNewIcon(e.target.value)} className="w-16 px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm text-center" />
            <input type="text" placeholder="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm" />
          </div>
          <div className="flex gap-2">
            <input type="url" placeholder="URL" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} className="flex-1 px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm" />
            <button onClick={addLink} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Add</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <div key={link.id} className="group relative">
            {editMode ? (
              <div className="flex flex-col gap-2 p-4 rounded-xl bg-card border border-dashed border-primary/40">
                <div className="flex items-center gap-2">
                  <input value={link.icon} onChange={(e) => updateLink(link.id, "icon", e.target.value)} className="w-10 text-center text-xl bg-transparent" />
                  <input value={link.title} onChange={(e) => updateLink(link.id, "title", e.target.value)} className="flex-1 text-sm font-semibold text-foreground bg-transparent border-b border-dashed border-primary/40 focus:outline-none" />
                  <button onClick={() => deleteLink(link.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 size={14} /></button>
                </div>
                <input value={link.description} onChange={(e) => updateLink(link.id, "description", e.target.value)} placeholder="Description" className="text-xs text-muted-foreground bg-transparent border-b border-dashed border-border focus:outline-none" />
                <input value={link.url} onChange={(e) => updateLink(link.id, "url", e.target.value)} placeholder="URL" className="text-xs text-muted-foreground bg-transparent border-b border-dashed border-border focus:outline-none" />
              </div>
            ) : (
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 rounded-xl ${link.bgColor} flex items-center justify-center text-2xl shrink-0`}>
                  {link.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-semibold text-foreground">{link.title}</h3>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                </div>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
