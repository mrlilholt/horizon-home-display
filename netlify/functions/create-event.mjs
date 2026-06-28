import { getUser } from "@netlify/identity";
import { createCalendarEvent } from "../../server/calendarService.js";

function getFunctionEnv() {
  return {
    GOOGLE_SERVICE_ACCOUNT_JSON: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_JSON") || "",
    GOOGLE_SERVICE_ACCOUNT_PROJECT_ID: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_PROJECT_ID") || "",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID") || "",
    GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY") || "",
    GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL") || "",
    GOOGLE_SERVICE_ACCOUNT_CLIENT_ID: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_CLIENT_ID") || "",
    GOOGLE_SERVICE_ACCOUNT_AUTH_URI: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_AUTH_URI") || "",
    GOOGLE_SERVICE_ACCOUNT_TOKEN_URI: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_TOKEN_URI") || "",
    GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL:
      Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL") || "",
    GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL:
      Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL") || "",
    GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN: Netlify.env.get("GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN") || "",
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

export default async (req) => {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: "Authentication required." }, { status: 401 });
  }

  try {
    const input = await req.json();
    const event = await createCalendarEvent(input, { env: getFunctionEnv() });
    return Response.json({ event }, { status: 201 });
  } catch (error) {
    return Response.json({ error: error.message || "Unable to create event." }, { status: 400 });
  }
};

export const config = {
  path: "/api/events",
  method: ["POST"]
};
