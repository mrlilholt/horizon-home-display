function toDateInputValue(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(isoString) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function getInitialEventForm(writableCalendars, event = null) {
  const defaultCalendarKey = writableCalendars[0]?.calendarKey || "personal";

  if (!event) {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
    const end = new Date(start);
    end.setHours(end.getHours() + 1);

    return {
      title: "",
      calendarKey: defaultCalendarKey,
      location: "",
      isAllDay: false,
      startDate: toDateInputValue(start.toISOString()),
      endDate: toDateInputValue(end.toISOString()),
      startDateTime: toDateTimeInputValue(start.toISOString()),
      endDateTime: toDateTimeInputValue(end.toISOString())
    };
  }

  return {
    title: event.title || "",
    calendarKey: event.calendarKey,
    location: event.location || "",
    isAllDay: event.isAllDay,
    startDate: toDateInputValue(event.start),
    endDate: toDateInputValue(event.isAllDay ? new Date(new Date(event.end).getTime() - 86400000).toISOString() : event.end),
    startDateTime: toDateTimeInputValue(event.start),
    endDateTime: toDateTimeInputValue(event.end)
  };
}

export default function EventModal({
  isOpen,
  mode,
  form,
  writableCalendars,
  error,
  isSaving,
  onClose,
  onChange,
  onSubmit
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="panel event-modal" onClick={(event) => event.stopPropagation()}>
        <div className="password-panel-header">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Edit Event" : "Add Event"}</p>
            <h2>{mode === "edit" ? "Update calendar event" : "Create calendar event"}</h2>
          </div>
          <button type="button" className="logout-button" onClick={onClose}>
            Close
          </button>
        </div>
        <form className="password-form" onSubmit={onSubmit}>
          <label className="auth-field">
            <span>Title</span>
            <input value={form.title} onChange={(event) => onChange("title", event.target.value)} required />
          </label>
          <label className="auth-field">
            <span>Calendar</span>
            <select
              value={form.calendarKey}
              onChange={(event) => onChange("calendarKey", event.target.value)}
              disabled={mode === "edit"}
            >
              {writableCalendars.map((calendar) => (
                <option key={calendar.calendarKey} value={calendar.calendarKey}>
                  {calendar.calendarName}
                </option>
              ))}
            </select>
          </label>
          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={form.isAllDay}
              onChange={(event) => onChange("isAllDay", event.target.checked)}
            />
            <span>All day event</span>
          </label>
          {form.isAllDay ? (
            <div className="event-form-grid">
              <label className="auth-field">
                <span>Start date</span>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(event) => onChange("startDate", event.target.value)}
                  required
                />
              </label>
              <label className="auth-field">
                <span>End date</span>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(event) => onChange("endDate", event.target.value)}
                  required
                />
              </label>
            </div>
          ) : (
            <div className="event-form-grid">
              <label className="auth-field">
                <span>Start</span>
                <input
                  type="datetime-local"
                  value={form.startDateTime}
                  onChange={(event) => onChange("startDateTime", event.target.value)}
                  required
                />
              </label>
              <label className="auth-field">
                <span>End</span>
                <input
                  type="datetime-local"
                  value={form.endDateTime}
                  onChange={(event) => onChange("endDateTime", event.target.value)}
                  required
                />
              </label>
            </div>
          )}
          <label className="auth-field">
            <span>Location</span>
            <input value={form.location} onChange={(event) => onChange("location", event.target.value)} />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <div className="password-actions">
            <button type="submit" className="refresh-button" disabled={isSaving}>
              {isSaving ? "Saving..." : mode === "edit" ? "Save changes" : "Create event"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
