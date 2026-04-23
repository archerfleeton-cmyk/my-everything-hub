import { useEffect, useState } from "react";

export interface QuickLink {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  iconImage?: string; // data URL for custom uploaded image
  bgColor: string;
}

export const QUICK_LINKS_KEY = "quick-links-v1";
const EVENT = "quick-links-changed";

export const defaultQuickLinks: QuickLink[] = [
  { id: "1", title: "Google Classroom", description: "View assignments & classes", url: "https://classroom.google.com", icon: "📚", bgColor: "bg-sport/10" },
  { id: "2", title: "Gmail", description: "Check your inbox", url: "https://mail.google.com", icon: "✉️", bgColor: "bg-destructive/10" },
  { id: "3", title: "Google Drive", description: "Access your files", url: "https://drive.google.com", icon: "📁", bgColor: "bg-warning/10" },
  { id: "4", title: "Google Docs", description: "Create & edit documents", url: "https://docs.google.com", icon: "📝", bgColor: "bg-info/10" },
  { id: "5", title: "Google Slides", description: "Presentations & slide decks", url: "https://slides.google.com", icon: "📊", bgColor: "bg-accent/10" },
  { id: "6", title: "Google Calendar", description: "Manage your schedule", url: "https://calendar.google.com", icon: "📅", bgColor: "bg-primary/10" },
];

function load(): QuickLink[] {
  try {
    const raw = localStorage.getItem(QUICK_LINKS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultQuickLinks;
}

export function useQuickLinks() {
  const [links, setLinksState] = useState<QuickLink[]>(load);

  useEffect(() => {
    const handler = () => setLinksState(load());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const setLinks = (next: QuickLink[] | ((l: QuickLink[]) => QuickLink[])) => {
    setLinksState((prev) => {
      const value = typeof next === "function" ? (next as any)(prev) : next;
      try {
        localStorage.setItem(QUICK_LINKS_KEY, JSON.stringify(value));
        window.dispatchEvent(new Event(EVENT));
      } catch {}
      return value;
    });
  };

  const addLink = (link: Omit<QuickLink, "id">) => {
    setLinks((prev) => [...prev, { ...link, id: Date.now().toString() }]);
  };

  return { links, setLinks, addLink };
}
