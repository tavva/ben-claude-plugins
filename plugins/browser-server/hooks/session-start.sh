#!/bin/bash
# ABOUTME: SessionStart hook - registers this Claude session with browser-server
# ABOUTME: Saves client ID to CLAUDE_ENV_FILE for SessionEnd cleanup

set -euo pipefail

SERVER_URL="http://localhost:9223"

# Check if server is running
if ! curl -sf --connect-timeout 1 "$SERVER_URL/status" > /dev/null 2>&1; then
    # Server not running, nothing to register with
    echo '{}'
    exit 0
fi

# Register as a client
RESPONSE=$(curl -sf -X POST "$SERVER_URL/client" 2>/dev/null || echo '{}')
CLIENT_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4 || true)

if [ -n "$CLIENT_ID" ] && [ -n "${CLAUDE_ENV_FILE:-}" ]; then
    echo "BROWSER_SERVER_CLIENT_ID=$CLIENT_ID" >> "$CLAUDE_ENV_FILE"
fi

echo '{}'
exit 0
