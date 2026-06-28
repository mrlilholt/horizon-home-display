#!/usr/bin/env bash
set -euo pipefail

sleep 8
xset s off
xset -dpms
xset s noblank

__CHROMIUM_BIN__ \
  --kiosk \
  --incognito \
  --disable-infobars \
  --noerrdialogs \
  --disable-session-crashed-bubble \
  http://localhost:3333
