#!/data/data/com.termux/files/usr/bin/bash
# NodoAssist OAuth Sync Widget
# Syncs Claude Code tokens to NodoAssist over SSH
# Place in ~/.shortcuts/ on phone for Termux:Widget

termux-toast "Syncing NodoAssist auth..."

# Run sync on the configured NodoAssist host.
SERVER="${NODOASSIST_SERVER:-nodoassist-host}"
RESULT=$(ssh "$SERVER" '$HOME/nodoassist/scripts/sync-claude-code-auth.sh' 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # Extract expiry time from output
    EXPIRY=$(echo "$RESULT" | grep "Token expires:" | cut -d: -f2-)

    termux-vibrate -d 100
    termux-toast "NodoAssist synced! Expires:${EXPIRY}"

    # Optional: restart nodoassist service
    ssh "$SERVER" 'systemctl --user restart nodoassist' 2>/dev/null
else
    termux-vibrate -d 300
    termux-toast "Sync failed: ${RESULT}"
fi
