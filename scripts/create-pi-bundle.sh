#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BUNDLE_ROOT="${ROOT_DIR}/out"
BUNDLE_DIR="${BUNDLE_ROOT}/HorizonHomeDisplay"
ARCHIVE_PATH="${BUNDLE_ROOT}/HorizonHomeDisplay-pi-bundle.tar.gz"

mkdir -p "${BUNDLE_ROOT}"
rm -rf "${BUNDLE_DIR}"
mkdir -p "${BUNDLE_DIR}"

rsync -a \
  --exclude '.git' \
  --exclude 'node_modules' \
  --exclude 'dist' \
  --exclude 'out' \
  "${ROOT_DIR}/" "${BUNDLE_DIR}/"

chmod +x "${BUNDLE_DIR}/pi/install-on-pi.sh" "${BUNDLE_DIR}/pi/horizon-kiosk.sh" "${BUNDLE_DIR}/scripts/create-pi-bundle.sh"

tar -czf "${ARCHIVE_PATH}" -C "${BUNDLE_ROOT}" HorizonHomeDisplay

echo "Created:"
echo "  ${BUNDLE_DIR}"
echo "  ${ARCHIVE_PATH}"
