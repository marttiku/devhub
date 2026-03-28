#!/usr/bin/env bash
set -e

echo "=== DevHub Install ==="

# 1. Host helper
echo "Installing host helper…"
cd host-helper && npm install && cd ..

# 2. pm2
if ! command -v pm2 &>/dev/null; then
  echo "Installing pm2 globally…"
  npm install -g pm2
fi

echo "Starting host helper with pm2…"
pm2 start host-helper/index.js --name devhub-helper --interpreter node

echo ""
echo "Run the following command to make devhub-helper start on login:"
echo ""
pm2 startup || true
echo ""
echo "Paste the 'sudo env PATH...' command above, then run: pm2 save"
echo ""

# 3. Docker
echo "Starting devhub Docker container…"
docker compose up -d --build

echo ""
echo "✓ DevHub is running at http://localhost:${API_PORT:-4242}"
