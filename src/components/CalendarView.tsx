import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useEditMode } from "@/components/EditModeContext";
import { useWeeklySchedule, colorToCalendarCategory } from "@/hooks/useWeeklySchedule";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time?: string;
  category: string;
  color: string;
}

const colorOptions = [
  { label: "Sports", value: "bg-sport" },
  { label: "Fitness", value: "bg-fitness" },
  { label: "Finance", value: "bg-finance" },
  { label: "Health", value: "bg-health" },
  { label: "School", value: "bg-info" },
  { label: "Personal", value: "bg-primary" },
];

function getDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

const defaultEvents: CalendarEvent[] = [
  { id: "1", title: "Soccer Practice", date: getDateStr(1), time: "4:00 PM", category: "Sports", color: "bg-sport" },
  { id: "2", title: "Gym Session", date: getDateStr(0), time: "7:00 AM", category: "Fitness", color: "bg-fitness" },
  { id: "3", title: "Budget Review", date: getDateStr(2), time: "6:00 PM", category: "Finance", color: "bg-finance" },
  { id: "4", title: "Doctor Appointment", date: getDateStr(3), time: "10:00 AM", category: "Health", color: "bg-health" },
  { id: "5", title: "Study Group", date: getDateStr(0), time: "2:00 PM", category: "School", color: "bg-info" },
  { id: "6", title: "Basketball Game", date: getDateStr(5), time: "5:00 PM", category: "Sports", color: "bg-sport" },
];

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(defaultEvents);
  const { week } = useWeeklySchedule();
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(getDateStr(0));
  const [newTime, setNewTime] = useState("");
  const [newCategory, setNewCategory] = useState("Personal");
  const [newColor, setNewColor] = useState("bg-primary");
  const { editMode } = useEditMode();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const scheduleEvents: CalendarEvent[] = useMemo(() => {
    const out: CalendarEvent[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dow = dateObj.getDay();
      const entries = week[dow] || [];
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      entries.forEach((e) => {
        out.push({
          id: `sched-${dateStr}-${e.id}`,
          title: e.title,
          date: dateStr,
          time: e.time,
          category: colorToCalendarCategory(e.color),
          color: e.color,
        });
      });
    }
    return out;
  }, [week, year, month, daysInMonth]);

  const allEvents = useMemo(() => [...scheduleEvents, ...events], [scheduleEvents, events]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allEvents.filter((e) => e.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayDateStr = today.toISOString().split("T")[0];
  const todayEvents = allEvents.filter((e) => e.date === todayDateStr);

  const addEvent = () => {
    if (!newTitle.trim()) return;
    setEvents([...events, {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      time: newTime || undefined,
      category: newCategory,
      color: newColor,
    }]);
    setNewTitle("");
    setNewTime("");
    setShowAdd(false);
  };

  const updateEvent = (id: string, field: keyof CalendarEvent, value: string) => {
    setEvents(events.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-serif text-foreground">Calendar</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today
          </p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="p-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          <Plus size={18} />
        </button>
      </div>

      {showAdd && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <input
            type="text"
            placeholder="Event title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-2 flex-wrap">
            <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
            <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm" />
            <select value={newColor} onChange={(e) => { const opt = colorOptions.find(o => o.value === e.target.value); setNewColor(e.target.value); setNewCategory(opt?.label || "Personal"); }} className="px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm">
              {colorOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button onClick={addEvent} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium">Add</button>
          </div>
        </div>
      )}

      {/* Today's events */}
      {todayEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Today</h3>
          {todayEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <div className={`w-2 h-8 rounded-full ${ev.color}`} />
              <div className="flex-1">
                {editMode ? (
                  <input value={ev.title} onChange={(e) => updateEvent(ev.id, "title", e.target.value)} className="text-sm font-medium text-foreground bg-transparent border-b border-dashed border-primary/40 focus:outline-none w-full" />
                ) : (
                  <p className="text-sm font-medium text-foreground">{ev.title}</p>
                )}
                {editMode ? (
                  <div className="flex gap-2 mt-1">
                    <input type="time" value={ev.time?.replace(/ (AM|PM)/, '') || ''} onChange={(e) => { const v = e.target.value; if (v) { const [h, m] = v.split(':').map(Number); const ampm = h >= 12 ? 'PM' : 'AM'; const hour = h % 12 || 12; updateEvent(ev.id, 'time', `${hour}:${String(m).padStart(2,'0')} ${ampm}`); }}} className="bg-background border border-border rounded text-xs px-1 py-0.5 text-foreground" />
                    <input type="date" value={ev.date} onChange={(e) => updateEvent(ev.id, "date", e.target.value)} className="bg-background border border-border rounded text-xs px-1 py-0.5 text-foreground" />
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">{ev.time} · {ev.category}</p>
                )}
              </div>
              {editMode && (
                <button onClick={() => deleteEvent(ev.id)} className="p-1 text-muted-foreground hover:text-destructive">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Calendar grid */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="flex items-center justify-between p-4">
          <button onClick={prevMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h3 className="font-serif text-lg text-foreground">
            {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
          </h3>
          <button onClick={nextMonth} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="grid grid-cols-7">
          {daysOfWeek.map((d) => (
            <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground border-t border-border">
              {d}
            </div>
          ))}
          {cells.map((day, i) => {
            const dayEvents = day ? getEventsForDay(day) : [];
            return (
              <div
                key={i}
                className={`min-h-[72px] p-1.5 border-t border-border text-sm ${
                  day && isToday(day) ? "bg-primary/5" : ""
                }`}
              >
                {day && (
                  <>
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                        isToday(day) ? "bg-primary text-primary-foreground font-bold" : "text-foreground"
                      }`}
                    >
                      {day}
                    </span>
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium text-primary-foreground truncate ${ev.color}`}
                      >
                        {ev.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
