import { getUser } from "@netlify/identity";
import { getWritableCalendars } from "../../server/calendarService.js";

export default async () => {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  return Response.json({
    calendars: getWritableCalendars()
  });
};

export const config = {
  path: "/api/writable-calendars",
  method: ["GET"]
};
