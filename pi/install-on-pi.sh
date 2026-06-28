#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${1:-$HOME/HorizonHomeDisplay}"
SERVICE_NAME="horizon-home-display"
SERVICE_PATH="/etc/systemd/system/${SERVICE_NAME}.service"
AUTOSTART_DIR="$HOME/.config/lxsession/LXDE-pi"
AUTOSTART_FILE="${AUTOSTART_DIR}/autostart"
CHROMIUM_BIN="$(command -v chromium-browser || command -v chromium || true)"

if [[ -z "${CHROMIUM_BIN}" ]]; then
  echo "Chromium was not found. Install it first with:"
  echo "  sudo apt update && sudo apt install -y chromium-browser"
  exit 1
fi

if [[ ! -d "${APP_DIR}" ]]; then
  echo "App directory not found: ${APP_DIR}"
  exit 1
fi

cd "${APP_DIR}"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required."
  echo "Install them first, then rerun this script."
  exit 1
fi

echo "Installing dependencies..."
npm install

echo "Building production assets..."
npm run build

echo "Installing systemd service..."
sudo cp "${APP_DIR}/pi/horizon-home-display.service" "${SERVICE_PATH}"
sudo sed -i "s|__APP_DIR__|${APP_DIR}|g" "${SERVICE_PATH}"
sudo sed -i "s|__USER__|${USER}|g" "${SERVICE_PATH}"
sudo systemctl daemon-reload
sudo systemctl enable "${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "Configuring Chromium kiosk autostart..."
mkdir -p "${AUTOSTART_DIR}"
grep -v "horizon-kiosk.sh" "${AUTOSTART_FILE}" 2>/dev/null > "${AUTOSTART_FILE}.tmp" || true
mv "${AUTOSTART_FILE}.tmp" "${AUTOSTART_FILE}"
echo "@${APP_DIR}/pi/horizon-kiosk.sh" >> "${AUTOSTART_FILE}"

sed -i.bak "s|__CHROMIUM_BIN__|${CHROMIUM_BIN}|g" "${APP_DIR}/pi/horizon-kiosk.sh"

echo
echo "Installation complete."
echo "Dashboard service status:"
sudo systemctl --no-pager --full status "${SERVICE_NAME}" || true
echo
echo "Reboot the Pi or log out and back in to test kiosk autostart."
