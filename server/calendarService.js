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
    calendarName: "Nikki's Personal Calendar",
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

const WRITABLE_CALENDAR_KEYS = new Set(["personal", "wife"]);

function asBool(value) {
  return String(value).toLowerCase() === "true";
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
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

function normalizePrivateKey(value) {
  if (!value) {
    return "";
  }

  return value.replace(/\\n/g, "\n");
}

function buildServiceAccountFromParts(env) {
  const clientEmail = env.GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL;
  const privateKey = normalizePrivateKey(env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);

  if (!clientEmail || !privateKey) {
    return null;
  }

  return {
    type: "service_account",
    project_id: env.GOOGLE_SERVICE_ACCOUNT_PROJECT_ID || undefined,
    private_key_id: env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID || undefined,
    private_key: privateKey,
    client_email: clientEmail,
    client_id: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_ID || undefined,
    auth_uri: env.GOOGLE_SERVICE_ACCOUNT_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: env.GOOGLE_SERVICE_ACCOUNT_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:
      env.GOOGLE_SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: env.GOOGLE_SERVICE_ACCOUNT_CLIENT_X509_CERT_URL || undefined,
    universe_domain: env.GOOGLE_SERVICE_ACCOUNT_UNIVERSE_DOMAIN || "googleapis.com"
  };
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
      credentials: {
        ...inlineCredentials,
        private_key: normalizePrivateKey(inlineCredentials.private_key)
      }
    };
  }

  const splitCredentials = buildServiceAccountFromParts(env);
  if (splitCredentials) {
    return {
      credentials: splitCredentials
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
    isAllDay,
    writable: WRITABLE_CALENDAR_KEYS.has(config.calendarKey)
  };
}

function formatMockEvent(event) {
  return {
    ...event,
    writable: WRITABLE_CALENDAR_KEYS.has(event.calendarKey)
  };
}

function getCalendarConfig(calendarKey) {
  return CALENDAR_CONFIG.find((config) => config.calendarKey === calendarKey) || null;
}

function assertWritableCalendar(calendarKey) {
  if (!WRITABLE_CALENDAR_KEYS.has(calendarKey)) {
    throw new Error("This calendar is read-only.");
  }
}

function getGoogleAuth(env) {
  const credentials = resolveGoogleCredentials(env);
  if (!credentials) {
    throw new Error("Google credentials are not configured.");
  }

  return new google.auth.GoogleAuth({
    ...credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"]
  });
}

async function getGoogleCalendarClient(env) {
  const auth = getGoogleAuth(env);
  const client = await auth.getClient();
  return google.calendar({ version: "v3", auth: client });
}

function getCalendarIdForKey(env, calendarKey) {
  const config = getCalendarConfig(calendarKey);
  if (!config) {
    throw new Error("Unknown calendar.");
  }

  const calendarId = env[config.envKey];
  if (!calendarId) {
    throw new Error("Selected calendar is not configured.");
  }

  return {
    calendarId,
    config
  };
}

function buildGoogleEventPayload(input) {
  const payload = {
    summary: input.title,
    location: input.location || ""
  };

  if (input.isAllDay) {
    const startDate = startOfDay(new Date(input.start));
    const endDate = startOfDay(new Date(input.end));
    const inclusiveEnd = new Date(endDate);
    inclusiveEnd.setDate(inclusiveEnd.getDate() + 1);
    payload.start = { date: startDate.toISOString().slice(0, 10) };
    payload.end = { date: inclusiveEnd.toISOString().slice(0, 10) };
  } else {
    payload.start = { dateTime: new Date(input.start).toISOString() };
    payload.end = { dateTime: new Date(input.end).toISOString() };
  }

  return payload;
}

function validateEventInput(input) {
  if (!input?.title?.trim()) {
    throw new Error("Event title is required.");
  }

  if (!input?.calendarKey) {
    throw new Error("Calendar selection is required.");
  }

  if (!input?.start || !input?.end) {
    throw new Error("Start and end are required.");
  }

  if (new Date(input.end) < new Date(input.start)) {
    throw new Error("Event end must be after start.");
  }
}

async function fetchGoogleEvents(env) {
  const calendar = await getGoogleCalendarClient(env);
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
      events: getMockEvents().map(formatMockEvent),
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
      events: getMockEvents().map(formatMockEvent),
      source: "mock",
      lastFetched,
      error: `Google Calendar fetch failed. Serving mock events instead. ${error.message || ""}`.trim()
    };
  }
}

export function getWritableCalendars() {
  return CALENDAR_CONFIG.filter((config) => WRITABLE_CALENDAR_KEYS.has(config.calendarKey)).map((config) => ({
    calendarKey: config.calendarKey,
    calendarName: config.calendarName,
    color: config.color
  }));
}

export async function createCalendarEvent(input, options = {}) {
  const env = options.env || process.env;
  validateEventInput(input);
  assertWritableCalendar(input.calendarKey);
  const { calendarId, config } = getCalendarIdForKey(env, input.calendarKey);
  const calendar = await getGoogleCalendarClient(env);
  const response = await calendar.events.insert({
    calendarId,
    requestBody: buildGoogleEventPayload(input)
  });

  return formatGoogleEvent(response.data, config, env);
}

export async function updateCalendarEvent(calendarKey, eventId, input, options = {}) {
  const env = options.env || process.env;
  validateEventInput({ ...input, calendarKey });
  assertWritableCalendar(calendarKey);
  const { calendarId, config } = getCalendarIdForKey(env, calendarKey);
  const calendar = await getGoogleCalendarClient(env);
  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: buildGoogleEventPayload({ ...input, calendarKey })
  });

  return formatGoogleEvent(response.data, config, env);
}
