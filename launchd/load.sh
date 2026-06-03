#!/usr/bin/env bash
set -euo pipefail
DEST="$HOME/Library/LaunchAgents/dev.unlogged.plist"
cp "$(dirname "$0")/dev.unlogged.plist" "$DEST"
launchctl unload "$DEST" 2>/dev/null || true
launchctl load "$DEST"
echo "Loaded dev.unlogged. Next run: Friday 16:45."
