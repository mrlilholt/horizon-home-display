import { formatShortDay, getDayAnchor, isSameDay, startOfDay } from "../utils/dateUtils";

export default function WeekStrip({ events, now, onSelectDate }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = startOfDay(now);
    date.setDate(date.getDate() + index);
    const count = events.filter((event) => isSameDay(new Date(event.start), date)).length;

    return {
      anchor: getDayAnchor(date),
      date,
      label: formatShortDay(date),
      count,
      isToday: index === 0
    };
  });

  return (
    <section className="panel week-strip">
      {days.map((day) => (
        <button
          key={day.anchor}
          type="button"
          className={`week-day ${day.isToday ? "week-day-today" : ""}`}
          onClick={() => onSelectDate(day.date)}
        >
          <span>{day.label}</span>
          <strong>{day.count}</strong>
        </button>
      ))}
    </section>
  );
}
