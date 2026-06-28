# Horizon Home Display

Horizon Home Display is a Raspberry Pi-friendly home dashboard built with React, Vite, Node.js, and Express. It merges multiple Google Calendars into a single wall-display UI and embeds Neon Horizon Radio alongside the agenda. The frontend silently polls the backend every 30 seconds, so events update without a page refresh.

## What is included

- Full-screen React dashboard optimized for 1920x1080 landscape displays
- Express API on port `3333`
- Google Calendar integration using a service account
- Mock fallback events when Google credentials are not configured or fail
- Manual refresh button, live clock, last updated status, and auto-refresh indicator
- Per-calendar color coding and optional title obscuring for privacy
- Neon Horizon Radio iframe embed

## Project structure

```text
horizon-home-display/
  package.json
  .env.example
  server/
    index.js
    calendarService.js
    mockEvents.js
  src/
    main.jsx
    App.jsx
    styles.css
    components/
    utils/
  index.html
  vite.config.js
```

## Local development

1. Install Node.js LTS.
2. Install dependencies:

```bash
npm install
```

3. Create your environment file:

```bash
cp .env.example .env
```

4. Start the frontend and backend together:

```bash
npm run dev
```

5. Open [http://localhost:5173](http://localhost:5173).

The frontend proxies `/api` requests to `http://localhost:3333`, so the React app does not need hardcoded backend URLs.

## Environment variables

Copy `.env.example` to `.env` and configure the values you need:

```env
PORT=3333
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json
GOOGLE_SERVICE_ACCOUNT_JSON=
GOOGLE_CALENDAR_WORK_ID=
GOOGLE_CALENDAR_PERSONAL_ID=
GOOGLE_CALENDAR_WIFE_ID=
GOOGLE_CALENDAR_FAMILY_ID=
OBSCURE_WORK_TITLES=false
OBSCURE_PERSONAL_TITLES=false
OBSCURE_WIFE_TITLES=false
OBSCURE_FAMILY_TITLES=false
```

Use `GOOGLE_APPLICATION_CREDENTIALS` for local file-based development. Use `GOOGLE_SERVICE_ACCOUNT_JSON` when deploying to Netlify by pasting the full JSON payload into a Netlify environment variable.

If your hosting provider makes a full JSON secret awkward, you can instead provide split service-account variables:

- `GOOGLE_SERVICE_ACCOUNT_PROJECT_ID`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_ID`
- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL`
- `GOOGLE_SERVICE_ACCOUNT_CLIENT_ID`

If Google Calendar is not configured, the backend automatically serves realistic mock events so the dashboard still works.

## Google Calendar setup

Recommended setup for a local dashboard: use a Google service account.

1. Create a Google Cloud project.
2. Enable the Google Calendar API.
3. Create a service account.
4. Download the service account JSON file.
5. Put the file at the project root as `service-account.json`.
6. Set `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` in `.env`.
7. Share each calendar with the service account email address.
8. Add each calendar ID to the matching `.env` variable.
9. Restart the backend.

Find a calendar ID in Google Calendar:

1. Open Google Calendar.
2. Go to calendar `Settings`.
3. Open `Integrate calendar`.
4. Copy the `Calendar ID`.

If your work calendar cannot be shared due to organization policy, a practical fallback is to create a separate “Work Blocks” calendar and share that with the service account instead.

## Privacy controls

These variables let you hide event titles for selected calendars:

- `OBSCURE_WORK_TITLES=true`
- `OBSCURE_PERSONAL_TITLES=true`
- `OBSCURE_WIFE_TITLES=true`
- `OBSCURE_FAMILY_TITLES=true`

When enabled, the backend replaces titles with generic labels before data reaches the frontend.

## Raspberry Pi setup

1. Install Node.js LTS on the Pi.
2. Copy or clone this project onto the Pi.
3. Run:

```bash
npm install
cp .env.example .env
npm run dev
```

4. Open Chromium to the dashboard URL:

```bash
chromium-browser --kiosk http://localhost:5173
```

For a built frontend plus backend:

```bash
npm run build
npm start
```

If you later add a static file server for `dist`, point Chromium at that served URL instead.

## Flash drive deployment bundle

If you want to move this project to a Raspberry Pi with a flash drive, generate a Pi-ready bundle:

```bash
npm run bundle:pi
```

That creates:

- `out/HorizonHomeDisplay/`
- `out/HorizonHomeDisplay-pi-bundle.tar.gz`

The bundle includes the project, your current `.env`, the `service-account.json`, the Pi install script, the kiosk launcher, and the `systemd` service template.

On the Raspberry Pi:

```bash
cp -R /media/pi/FLASHDRIVE/HorizonHomeDisplay ~/HorizonHomeDisplay
cd ~/HorizonHomeDisplay
chmod +x pi/install-on-pi.sh pi/horizon-kiosk.sh
./pi/install-on-pi.sh
```

The Pi-specific files live in [/Users/alilholt/Documents/HorizonHomeDisplay/pi](</Users/alilholt/Documents/HorizonHomeDisplay/pi>).

## Netlify deployment with private login

This app can also be deployed publicly on Netlify while keeping calendar access behind a login wall.

### What the hosted version does

- the React app is public
- calendar data is served by a protected Netlify Function at `/api/events`
- users must sign in before the dashboard loads real data
- local development on `localhost` bypasses the login gate for convenience

### Netlify setup

1. Push this repo to GitHub.
2. Create a Netlify site connected to the repo.
3. In Netlify site settings, add these environment variables:

```text
GOOGLE_SERVICE_ACCOUNT_JSON=...full JSON from service-account.json...
GOOGLE_CALENDAR_WORK_ID=...
GOOGLE_CALENDAR_PERSONAL_ID=...
GOOGLE_CALENDAR_WIFE_ID=...
GOOGLE_CALENDAR_FAMILY_ID=...
OBSCURE_WORK_TITLES=false
OBSCURE_PERSONAL_TITLES=false
OBSCURE_WIFE_TITLES=false
OBSCURE_FAMILY_TITLES=false
```

4. Deploy the site.

### Netlify Identity setup

This project uses `@netlify/identity` for password-based login.

1. In Netlify, open `Project configuration` → `Identity`.
2. Enable Identity.
3. Set registration to `Invite only` so nobody can self-register.
4. Invite only your own email address.
5. Complete the invite email and set your password.

After that, visiting the deployed site will show a sign-in form before the dashboard loads.

### Important limitation

Netlify Identity does not work in normal localhost development. That is why the app bypasses authentication on `localhost`, `127.0.0.1`, and `::1`, but requires login on the deployed site.

## Optional Pi autostart

On Raspberry Pi OS desktop, you can add a kiosk launch command to:

```text
~/.config/lxsession/LXDE-pi/autostart
```

Example:

```text
@chromium-browser --kiosk http://localhost:5173
```

You can also use a process manager such as `pm2` or a `systemd` service for the backend if you want the dashboard to recover automatically after reboots.

## API endpoints

### `GET /api/health`

```json
{
  "ok": true,
  "service": "Horizon Home Display API"
}
```

### `GET /api/events`

```json
{
  "events": [],
  "source": "google",
  "lastFetched": "2026-06-27T20:00:00.000Z",
  "error": null
}
```

The `source` value is `mock` when Google configuration is missing or when Google fetches fail.

## Changing the radio URL

Update the iframe `src` in [src/components/RadioPanel.jsx](/Users/alilholt/Documents/HorizonHomeDisplay/src/components/RadioPanel.jsx) if you want to swap out Neon Horizon Radio for another panel.

## Notes

- `service-account.json` is ignored by git and should never be committed.
- The backend does not expose Google credentials to the browser.
- The backend fetches from the start of today through 14 days ahead.
- The frontend polls every 30 seconds without reloading the page.
