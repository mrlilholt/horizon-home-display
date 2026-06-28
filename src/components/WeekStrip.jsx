import { formatShortDay, isSameDay, startOfDay } from "../utils/dateUtils";

export default function WeekStrip({ events, now }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() + index);
    const count = events.filter((event) => isSameDay(new Date(event.start), date)).length;

    return {
      label: formatShortDay(date),
      count,
      isToday: index === 0
    };
  });

  return (
    <section className="panel week-strip">
      {days.map((day) => (
        <div key={day.label} className={`week-day ${day.isToday ? "week-day-today" : ""}`}>
          <span>{day.label}</span>
          <strong>{day.count}</strong>
        </div>
      ))}
    </section>
  );
}
