function isoForDate(date, hours, minutes = 0, durationMinutes = 60) {
  const start = new Date(date);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

function allDayIso(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
}

function dayOffset(base, days) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date;
}

export function getMockEvents() {
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const currentHour = now.getHours();

  const currentEventTime = isoForDate(today, Math.max(6, currentHour - 1), 0, 90);
  const nextEventTime = isoForDate(today, Math.min(21, currentHour + 1), 30, 60);
  const tonightTime = isoForDate(today, 19, 0, 90);
  const tomorrow = dayOffset(today, 1);
  const day2 = dayOffset(today, 2);
  const day3 = dayOffset(today, 3);
  const day4 = dayOffset(today, 4);
  const day5 = dayOffset(today, 5);
  const day6 = dayOffset(today, 6);

  return [
    {
      id: "mock-now",
      title: "Deep Work Block",
      ...currentEventTime,
      calendarName: "Work",
      calendarKey: "work",
      color: "#4A90E2",
      location: "Home Office",
      isAllDay: false
    },
    {
      id: "mock-next",
      title: "Lunch Reset",
      ...nextEventTime,
      calendarName: "Personal",
      calendarKey: "personal",
      color: "#7ED321",
      location: "Kitchen",
      isAllDay: false
    },
    {
      id: "mock-all-day",
      title: "Family Planning Day",
      ...allDayIso(today),
      calendarName: "Family",
      calendarKey: "family",
      color: "#F5A623",
      location: "",
      isAllDay: true
    },
    {
      id: "mock-tonight",
      title: "School Pickup",
      ...tonightTime,
      calendarName: "Family",
      calendarKey: "family",
      color: "#F5A623",
      location: "Main Entrance",
      isAllDay: false
    },
    {
      id: "mock-wife",
      title: "Dinner with Friends",
      ...isoForDate(tomorrow, 18, 30, 120),
      calendarName: "Wife",
      calendarKey: "wife",
      color: "#BD10E0",
      location: "Downtown",
      isAllDay: false
    },
    {
      id: "mock-work-standup",
      title: "Leadership Sync",
      ...isoForDate(day2, 9, 0, 45),
      calendarName: "Work",
      calendarKey: "work",
      color: "#4A90E2",
      location: "Meet",
      isAllDay: false
    },
    {
      id: "mock-personal",
      title: "Gym Session",
      ...isoForDate(day3, 7, 0, 60),
      calendarName: "Personal",
      calendarKey: "personal",
      color: "#7ED321",
      location: "Community Center",
      isAllDay: false
    },
    {
      id: "mock-family",
      title: "Movie Night",
      ...isoForDate(day4, 20, 0, 120),
      calendarName: "Family",
      calendarKey: "family",
      color: "#F5A623",
      location: "Living Room",
      isAllDay: false
    },
    {
      id: "mock-wife-yoga",
      title: "Morning Yoga",
      ...isoForDate(day5, 8, 0, 60),
      calendarName: "Wife",
      calendarKey: "wife",
      color: "#BD10E0",
      location: "Studio",
      isAllDay: false
    },
    {
      id: "mock-work-review",
      title: "Sprint Review",
      ...isoForDate(day6, 14, 0, 60),
      calendarName: "Work",
      calendarKey: "work",
      color: "#4A90E2",
      location: "Conference Room B",
      isAllDay: false
    }
  ].sort((a, b) => new Date(a.start) - new Date(b.start));
}
