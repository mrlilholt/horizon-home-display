import EventCard from "./EventCard";

export default function TodayAgenda({ events, nextEventId, now, sectionId }) {
  return (
    <section className="panel section-panel" id={sectionId}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Today</p>
          <h2>Current Agenda</h2>
        </div>
      </div>
      {events.length ? (
        <div className="event-list">
          {events.map((event) => {
            const start = new Date(event.start);
            const end = new Date(event.end);
            return (
              <EventCard
                key={event.id}
                event={event}
                isNow={start <= now && end >= now}
                isNext={event.id === nextEventId}
                isPast={end < now}
              />
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <h3>No events today</h3>
          <p>The board is clear for now.</p>
        </div>
      )}
    </section>
  );
}
