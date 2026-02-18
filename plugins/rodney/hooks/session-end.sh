#!/bin/bash
# ABOUTME: SessionEnd hook - stops rodney's Chrome process if running
# ABOUTME: Prevents headless Chrome from lingering after the session ends

set -euo pipefail

# Only attempt stop if rodney reports a running session
if rodney status > /dev/null 2>&1; then
    rodney stop > /dev/null 2>&1 || true
fi

echo '{}'
exit 0
