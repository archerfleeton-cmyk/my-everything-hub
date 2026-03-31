import { ExternalLink } from "lucide-react";

interface QuickLink {
  title: string;
  description: string;
  url: string;
  icon: string;
  bgColor: string;
}

const links: QuickLink[] = [
  {
    title: "Google Classroom",
    description: "View assignments & classes",
    url: "https://classroom.google.com",
    icon: "📚",
    bgColor: "bg-sport/10",
  },
  {
    title: "Gmail",
    description: "Check your inbox",
    url: "https://mail.google.com",
    icon: "✉️",
    bgColor: "bg-destructive/10",
  },
  {
    title: "Google Drive",
    description: "Access your files",
    url: "https://drive.google.com",
    icon: "📁",
    bgColor: "bg-warning/10",
  },
  {
    title: "Google Docs",
    description: "Create & edit documents",
    url: "https://docs.google.com",
    icon: "📝",
    bgColor: "bg-info/10",
  },
  {
    title: "Google Slides",
    description: "Presentations & slide decks",
    url: "https://slides.google.com",
    icon: "📊",
    bgColor: "bg-accent/10",
  },
  {
    title: "Google Calendar",
    description: "Manage your schedule",
    url: "https://calendar.google.com",
    icon: "📅",
    bgColor: "bg-primary/10",
  },
];

const QuickLinks = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Quick Links</h2>
        <p className="text-muted-foreground text-sm mt-1">Jump to your favorite Google apps</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/40 hover:shadow-md transition-all"
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
        ))}
      </div>
    </div>
  );
};

export default QuickLinks;
