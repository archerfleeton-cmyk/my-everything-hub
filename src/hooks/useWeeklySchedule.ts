import { useEffect, useState } from "react";

export interface ScheduleEntry {
  id: string;
  time: string; // "7:00 AM"
  title: string;
  color: string; // bg-fitness | bg-info | bg-sport | bg-chore | bg-health | bg-finance | bg-primary
}

export type WeekSchedule = Record<number, ScheduleEntry[]>;

export const STORAGE_KEY = "weekly-schedule-v1";

export const defaultWeek: WeekSchedule = {
  0: [
    { id: "s1", time: "9:00 AM", title: "Leg Day Workout", color: "bg-fitness" },
    { id: "s2", time: "12:00 PM", title: "Meal Prep", color: "bg-chore" },
    { id: "s3", time: "6:00 PM", title: "Walk the dog", color: "bg-chore" },
  ],
  1: [
    { id: "m1", time: "7:00 AM", title: "Light stretching", color: "bg-fitness" },
    { id: "m2", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
    { id: "m3", time: "6:00 PM", title: "Walk the dog", color: "bg-chore" },
  ],
  2: [
    { id: "t1", time: "7:00 AM", title: "Upper Body Workout", color: "bg-fitness" },
    { id: "t2", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
    { id: "t3", time: "2:00 PM", title: "Study Group", color: "bg-info" },
    { id: "t4", time: "6:00 PM", title: "Walk the dog", color: "bg-chore" },
  ],
  3: [
    { id: "w1", time: "7:00 AM", title: "Lower Body Workout", color: "bg-fitness" },
    { id: "w2", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
    { id: "w3", time: "4:00 PM", title: "Soccer Practice", color: "bg-sport" },
  ],
  4: [
    { id: "th1", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
    { id: "th2", time: "2:00 PM", title: "Study Group", color: "bg-info" },
    { id: "th3", time: "6:00 PM", title: "Walk the dog", color: "bg-chore" },
  ],
  5: [
    { id: "f1", time: "7:00 AM", title: "Push Day Workout", color: "bg-fitness" },
    { id: "f2", time: "9:00 AM", title: "Classes begin", color: "bg-info" },
    { id: "f3", time: "5:00 PM", title: "Game Night", color: "bg-sport" },
  ],
  6: [
    { id: "sa1", time: "9:00 AM", title: "Pull Day Workout", color: "bg-fitness" },
    { id: "sa2", time: "12:00 PM", title: "Errands", color: "bg-chore" },
    { id: "sa3", time: "5:00 PM", title: "Soccer Game", color: "bg-sport" },
  ],
};

const EVENT = "weekly-schedule-changed";

function load(): WeekSchedule {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultWeek;
}

export function useWeeklySchedule() {
  const [week, setWeekState] = useState<WeekSchedule>(load);

  useEffect(() => {
    const handler = () => setWeekState(load());
    window.addEventListener(EVENT, handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener(EVENT, handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const setWeek = (next: WeekSchedule | ((w: WeekSchedule) => WeekSchedule)) => {
    setWeekState((prev) => {
      const value = typeof next === "function" ? (next as any)(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
        window.dispatchEvent(new Event(EVENT));
      } catch {}
      return value;
    });
  };

  return { week, setWeek };
}

// ---- Helpers for cross-feature sync ----

export function parseTime12h(t: string): string | undefined {
  // "7:00 AM" -> "07:00"
  const m = t.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!m) return undefined;
  let h = parseInt(m[1], 10);
  const min = m[2];
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${min}`;
}

export function colorToCategory(color: string): "chore" | "sport" | "fitness" | "finance" | "health" | "personal" {
  switch (color) {
    case "bg-fitness": return "fitness";
    case "bg-sport": return "sport";
    case "bg-chore": return "chore";
    case "bg-health": return "health";
    case "bg-finance": return "finance";
    case "bg-info": return "personal";
    default: return "personal";
  }
}

export function colorToCalendarCategory(color: string): string {
  switch (color) {
    case "bg-fitness": return "Fitness";
    case "bg-sport": return "Sports";
    case "bg-chore": return "Chore";
    case "bg-health": return "Health";
    case "bg-finance": return "Finance";
    case "bg-info": return "School";
    default: return "Personal";
  }
}

export function dateStrForDayOfWeek(targetDow: number): string {
  // Returns YYYY-MM-DD for the next occurrence of targetDow within current week (this week's date).
  const now = new Date();
  const diff = targetDow - now.getDay();
  const d = new Date(now);
  d.setDate(now.getDate() + diff);
  return d.toISOString().split("T")[0];
}
