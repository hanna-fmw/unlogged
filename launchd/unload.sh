#!/usr/bin/env bash
set -euo pipefail
DEST="$HOME/Library/LaunchAgents/dev.unlogged.plist"
launchctl unload "$DEST" 2>/dev/null || true
rm -f "$DEST"
echo "Unloaded dev.unlogged."
