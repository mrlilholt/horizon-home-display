import fs from "node:fs";
import path from "node:path";
import { google } from "googleapis";
import { getMockEvents } from "./mockEvents.js";

const CALENDAR_CONFIG = [
  {
    envKey: "GOOGLE_CALENDAR_WORK_ID",
    calendarName: "Addison's Work",
    calendarKey: "work",
    color: "#4A90E2",
    obscureEnv: "OBSCURE_WORK_TITLES",
    hiddenTitle: "Work Event"
  },
  {
    envKey: "GOOGLE_CALENDAR_PERSONAL_ID",
    calendarName: "Addison's Personal Calendar",
    calendarKey: "personal",
    color: "#7ED321",
    obscureEnv: "OBSCURE_PERSONAL_TITLES",
    hiddenTitle: "Personal Event"
  },
  {
    envKey: "GOOGLE_CALENDAR_WIFE_ID",
    calendarName: "Wife",
    calendarKey: "wife",
    color: "#BD10E0",
    obscureEnv: "OBSCURE_WIFE_TITLES",
    hiddenTitle: "Calendar Event"
  },
  {
    envKey: "GOOGLE_CALENDAR_FAMILY_ID",
    calendarName: "Family",
    calendarKey: "family",
    color: "#F5A623",
    obscureEnv: "OBSCURE_FAMILY_TITLES",
    hiddenTitle: "Family Event"
  }
];

function asBool(value) {
  return String(value).toLowerCase() === "true";
}

function parseServiceAccountJson(rawValue) {
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue);
  } catch {
    try {
      return JSON.parse(Buffer.from(rawValue, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }
}

function resolveCredentialsPath(env) {
  const configuredPath = env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!configuredPath) {
    return null;
  }

  return path.resolve(process.cwd(), configuredPath);
}

function resolveGoogleCredentials(env) {
  const inlineCredentials = parseServiceAccountJson(env.GOOGLE_SERVICE_ACCOUNT_JSON);
  if (inlineCredentials) {
    return {
      credentials: inlineCredentials
    };
  }

  const credentialPath = resolveCredentialsPath(env);
  if (credentialPath && fs.existsSync(credentialPath)) {
    return {
      keyFile: credentialPath
    };
  }

  return null;
}

function hasGoogleConfig(env) {
  const credentials = resolveGoogleCredentials(env);
  const hasCalendars = CALENDAR_CONFIG.some(({ envKey }) => env[envKey]);
  return Boolean(credentials && hasCalendars);
}

function buildTimeRange() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 14);
  end.setHours(23, 59, 59, 999);

  return {
    timeMin: start.toISOString(),
    timeMax: end.toISOString()
  };
}

function formatGoogleEvent(event, config, env) {
  const isAllDay = Boolean(event.start?.date && !event.start?.dateTime);
  const start = isAllDay ? new Date(`${event.start.date}T00:00:00`) : new Date(event.start.dateTime);
  const end = isAllDay ? new Date(`${event.end.date}T00:00:00`) : new Date(event.end.dateTime);
  const title = asBool(env[config.obscureEnv]) ? config.hiddenTitle : event.summary || "Untitled Event";

  return {
    id: event.id,
    title,
    start: start.toISOString(),
    end: end.toISOString(),
    calendarName: config.calendarName,
    calendarKey: config.calendarKey,
    color: config.color,
    location: event.location || "",
    isAllDay
  };
}

async function fetchGoogleEvents(env) {
  const credentials = resolveGoogleCredentials(env);
  const auth = new google.auth.GoogleAuth({
    ...credentials,
    scopes: ["https://www.googleapis.com/auth/calendar.readonly"]
  });
  const client = await auth.getClient();
  const calendar = google.calendar({ version: "v3", auth: client });
  const { timeMin, timeMax } = buildTimeRange();

  const calendarConfigs = CALENDAR_CONFIG.filter(({ envKey }) => env[envKey]);

  const responses = await Promise.all(
    calendarConfigs.map(async (config) => {
      const response = await calendar.events.list({
        calendarId: env[config.envKey],
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: "startTime"
      });

      return (response.data.items || []).map((event) => formatGoogleEvent(event, config, env));
    })
  );

  return responses.flat().sort((a, b) => new Date(a.start) - new Date(b.start));
}

export async function getCalendarPayload(options = {}) {
  const env = options.env || process.env;
  const lastFetched = new Date().toISOString();

  if (!hasGoogleConfig(env)) {
    return {
      events: getMockEvents(),
      source: "mock",
      lastFetched,
      error: null
    };
  }

  try {
    const events = await fetchGoogleEvents(env);
    return {
      events,
      source: "google",
      lastFetched,
      error: null
    };
  } catch (error) {
    return {
      events: getMockEvents(),
      source: "mock",
      lastFetched,
      error: "Google Calendar fetch failed. Serving mock events instead."
    };
  }
}
