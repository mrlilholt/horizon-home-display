import { getUser } from "@netlify/identity";
import { getCalendarPayload } from "../../server/calendarService.js";

function getFunctionEnv() {
  return {
    GOOGLE_SERVICE_ACCOUNT_JSON: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_JSON") || "",
    GOOGLE_APPLICATION_CREDENTIALS: Netlify.env.get("GOOGLE_APPLICATION_CREDENTIALS") || "",
    GOOGLE_CALENDAR_WORK_ID: Netlify.env.get("GOOGLE_CALENDAR_WORK_ID") || "",
    GOOGLE_CALENDAR_PERSONAL_ID: Netlify.env.get("GOOGLE_CALENDAR_PERSONAL_ID") || "",
    GOOGLE_CALENDAR_WIFE_ID: Netlify.env.get("GOOGLE_CALENDAR_WIFE_ID") || "",
    GOOGLE_CALENDAR_FAMILY_ID: Netlify.env.get("GOOGLE_CALENDAR_FAMILY_ID") || "",
    OBSCURE_WORK_TITLES: Netlify.env.get("OBSCURE_WORK_TITLES") || "false",
    OBSCURE_PERSONAL_TITLES: Netlify.env.get("OBSCURE_PERSONAL_TITLES") || "false",
    OBSCURE_WIFE_TITLES: Netlify.env.get("OBSCURE_WIFE_TITLES") || "false",
    OBSCURE_FAMILY_TITLES: Netlify.env.get("OBSCURE_FAMILY_TITLES") || "false"
  };
}

export default async () => {
  const user = await getUser();
  if (!user) {
    return Response.json(
      {
        error: "Authentication required."
      },
      {
        status: 401,
        headers: {
          "Cache-Control": "no-store"
        }
      }
    );
  }

  const payload = await getCalendarPayload({
    env: getFunctionEnv()
  });

  return Response.json(payload, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
};

export const config = {
  path: "/api/events",
  method: ["GET"]
};
