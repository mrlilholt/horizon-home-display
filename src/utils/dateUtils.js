export function formatLongDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}

export function formatClock(date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit"
  }).format(date);
}

export function formatTimeRange(event) {
  if (event.isAllDay) {
    return "All day";
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  });

  return `${formatter.format(new Date(event.start))} - ${formatter.format(new Date(event.end))}`;
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function isEventNow(event, now = new Date()) {
  return new Date(event.start) <= now && new Date(event.end) >= now;
}

export function isEventPast(event, now = new Date()) {
  return new Date(event.end) < now;
}

export function groupEventsByDay(events) {
  return events.reduce((groups, event) => {
    const date = startOfDay(new Date(event.start));
    const key = date.toISOString();
    groups[key] ??= [];
    groups[key].push(event);
    return groups;
  }, {});
}

export function formatShortDay(date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);
}

export function formatLastUpdated(isoString) {
  if (!isoString) {
    return "Waiting for first sync";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(isoString));
}

export function getDayAnchor(date) {
  const day = startOfDay(date);
  const year = day.getFullYear();
  const month = String(day.getMonth() + 1).padStart(2, "0");
  const dayOfMonth = String(day.getDate()).padStart(2, "0");
  return `day-${year}-${month}-${dayOfMonth}`;
}
