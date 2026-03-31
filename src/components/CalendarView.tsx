import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  category: string;
  color: string;
}

const sampleEvents: CalendarEvent[] = [
  { id: "1", title: "Soccer Practice", date: getDateStr(1), time: "4:00 PM", category: "Sports", color: "bg-sport" },
  { id: "2", title: "Gym Session", date: getDateStr(0), time: "7:00 AM", category: "Fitness", color: "bg-fitness" },
  { id: "3", title: "Budget Review", date: getDateStr(2), time: "6:00 PM", category: "Finance", color: "bg-finance" },
  { id: "4", title: "Doctor Appointment", date: getDateStr(3), time: "10:00 AM", category: "Health", color: "bg-health" },
  { id: "5", title: "Study Group", date: getDateStr(0), time: "2:00 PM", category: "School", color: "bg-info" },
  { id: "6", title: "Basketball Game", date: getDateStr(5), time: "5:00 PM", category: "Sports", color: "bg-sport" },
];

function getDateStr(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CalendarView = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return sampleEvents.filter((e) => e.date === dateStr);
  };

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const todayEvents = sampleEvents.filter((e) => e.date === today.toISOString().split("T")[0]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-serif text-foreground">Calendar</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""} today
        </p>
      </div>

      {/* Today's events */}
      {todayEvents.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground">Today</h3>
          {todayEvents.map((ev) => (
            <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border">
              <div className={`w-2 h-8 rounded-full ${ev.color}`} />
              <div>
                <p className="text-sm font-medium text-foreground">{ev.title}</p>
                <p className="text-xs text-muted-foreground">{ev.time} · {ev.category}</p>
              </div>
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
            const events = day ? getEventsForDay(day) : [];
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
                    {events.map((ev) => (
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
