#!/bin/bash
# ABOUTME: SessionEnd hook - unregisters this Claude session from browser-server
# ABOUTME: Reads client ID from environment (set by session-start.sh)

set -euo pipefail

SERVER_URL="http://localhost:9223"

# Check if we have a client ID to unregister
if [ -z "${BROWSER_SERVER_CLIENT_ID:-}" ]; then
    echo '{}'
    exit 0
fi

# Check if server is still running and unregister
curl -sf --connect-timeout 1 -X DELETE "$SERVER_URL/client/$BROWSER_SERVER_CLIENT_ID" > /dev/null 2>&1 || true

echo '{}'
exit 0
