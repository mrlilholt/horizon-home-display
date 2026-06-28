import { formatTimeRange } from "../utils/dateUtils";

export default function EventCard({ event, isNow, isNext, isPast, onSelect }) {
  return (
    <article
      className={`event-card ${isPast ? "event-card-past" : ""} ${event.writable ? "event-card-clickable" : ""}`}
      style={{ "--accent": event.color }}
      onClick={event.writable ? () => onSelect(event) : undefined}
    >
      <div className="event-card-topline">
        <span className="calendar-chip">{event.calendarName}</span>
        <div className="badges">
          {isNow ? <span className="badge badge-now">NOW</span> : null}
          {isNext ? <span className="badge badge-next">NEXT</span> : null}
        </div>
      </div>
      <h3>{event.title}</h3>
      <p className="event-time">{formatTimeRange(event)}</p>
      {event.location ? <p className="event-location">{event.location}</p> : null}
    </article>
  );
}
