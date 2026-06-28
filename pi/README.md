# Raspberry Pi Deployment

This folder is meant to travel with the project on a flash drive.

## What to copy to the Pi

Copy the whole `HorizonHomeDisplay` project folder onto the Pi. This project already expects:

- `.env` at the project root
- `service-account.json` at the project root

## First-time setup on the Pi

1. Install Node.js, npm, and Chromium.
2. Copy the project folder to the Pi, for example:

```bash
cp -R /media/pi/FLASHDRIVE/HorizonHomeDisplay ~/HorizonHomeDisplay
```

3. Run:

```bash
cd ~/HorizonHomeDisplay
chmod +x pi/install-on-pi.sh pi/horizon-kiosk.sh
./pi/install-on-pi.sh
```

The install script will:

- run `npm install`
- run `npm run build`
- install the `systemd` service
- enable the service on boot
- add Chromium kiosk autostart for the desktop session

## After install

Open `http://localhost:3333` on the Pi to verify the app.

Check the service:

```bash
sudo systemctl status horizon-home-display
```

Restart the service:

```bash
sudo systemctl restart horizon-home-display
```

## Notes

- The Node app runs in production mode through `npm start`.
- Chromium launches automatically in kiosk mode on login.
- Internet access is required for Google Calendar and Neon Horizon Radio.
