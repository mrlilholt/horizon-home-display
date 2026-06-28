import { formatShortDay } from "../utils/dateUtils";
import EventCard from "./EventCard";

export default function UpcomingEvents({ groupedEntries, nextEventId, now, getSectionId, onSelectEvent }) {
  return (
    <section className="panel section-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Next 14 Days</p>
          <h2>Upcoming Events</h2>
        </div>
      </div>
      {groupedEntries.length ? (
        <div className="upcoming-groups">
          {groupedEntries.map(([dayKey, events]) => (
            <div key={dayKey} className="day-group" id={getSectionId(new Date(dayKey))}>
              <div className="day-group-header">{formatShortDay(new Date(dayKey))}</div>
              <div className="event-list compact-list">
                {events.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isNow={false}
                    isNext={event.id === nextEventId}
                    isPast={new Date(event.end) < now}
                    onSelect={onSelectEvent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No upcoming events</h3>
          <p>Nothing scheduled in the next two weeks.</p>
        </div>
      )}
    </section>
  );
}
