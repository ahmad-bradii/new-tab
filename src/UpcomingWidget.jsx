import { useEffect, useState } from "react";

const sameDay = (a, b) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const clock = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

export function dayLabel(date, now = new Date()) {
  if (sameDay(date, now)) return "Today";
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  if (sameDay(date, tomorrow)) return "Tomorrow";
  return date.toLocaleDateString([], { weekday: "long", day: "numeric", month: "short" });
}

// Short "when" text for notifications: "in 25 min", "14:00", "Fri 14:00"
export function formatEventTime(event, now = new Date()) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  if (start <= now && end > now) return "Now";
  if (event.allDay) return sameDay(start, now) ? "Today" : dayLabel(start, now);
  const mins = Math.round((start - now) / 60000);
  if (mins < 60) return `in ${mins} min`;
  if (sameDay(start, now)) return clock(start);
  return `${start.toLocaleDateString([], { weekday: "short" })} ${clock(start)}`;
}

function UpcomingWidget({ calendar, hasCalendar, onOpenSettings }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  let body;
  if (!hasCalendar) {
    body = (
      <div className="widget-empty">
        <p>See your next meetings and dates here, with a reminder before each.</p>
        <button type="button" className="button button--primary button--small" onClick={onOpenSettings}>
          Connect calendar
        </button>
      </div>
    );
  } else if (!calendar.data) {
    body = (
      <p className="widget-status">
        {calendar.loading
          ? "Loading your calendar…"
          : "Your calendar couldn't be loaded. Check its address in Settings."}
      </p>
    );
  } else {
    const week = new Date(now.getTime() + 7 * 86400000);
    const events = calendar.data
      .filter((e) => new Date(e.end) > now && new Date(e.start) < week)
      .slice(0, 5);

    if (events.length === 0) {
      body = <p className="widget-status">Nothing in the next 7 days.</p>;
    } else {
      const groups = [];
      for (const e of events) {
        const label = dayLabel(new Date(e.start), now);
        const last = groups[groups.length - 1];
        if (last?.label === label) last.items.push(e);
        else groups.push({ label, items: [e] });
      }
      body = groups.map((g) => (
        <div key={g.label} className="agenda-day">
          <h3>{g.label}</h3>
          <ul>
            {g.items.map((e) => {
              const start = new Date(e.start);
              const end = new Date(e.end);
              const live = start <= now && end > now;
              return (
                <li key={e.id} className={`agenda-item ${live ? "is-live" : ""}`}>
                  <span className="agenda-item__title">{e.title}</span>
                  <span className="agenda-item__time">
                    {live
                      ? "Now"
                      : e.allDay
                        ? "All day"
                        : `${clock(start)} – ${clock(end)}`}
                  </span>
                  {e.location && <span className="agenda-item__place">{e.location}</span>}
                </li>
              );
            })}
          </ul>
        </div>
      ));
    }
  }

  return (
    <section className="widget widget--agenda glass" aria-labelledby="agenda-title">
      <h2 id="agenda-title" className="widget-title">
        Upcoming
      </h2>
      {body}
    </section>
  );
}

export default UpcomingWidget;
