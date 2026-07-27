#!/usr/bin/env bash
# NodoAssist droplet watchdog. The compose healthcheck only proves the gateway
# HTTP surface; the Telegram polling connector can wedge after a network blip
# while /healthz stays green ("restarting (reason:" with no later
# "polling ingress started"). Detect that signature (or an unhealthy container)
# and docker-restart the gateway, with a cooldown so flapping cannot loop.
set -euo pipefail

CONTAINER="${NODOASSIST_CONTAINER:-nodoassist-gateway}"
WINDOW_MIN="${NODOASSIST_WATCHDOG_WINDOW_MIN:-10}"
COOLDOWN_SEC="${NODOASSIST_WATCHDOG_COOLDOWN_SEC:-360}"
STAMP="/run/nodoassist-watchdog.last-restart"

log() { logger -t nodoassist-watchdog "$1"; }

state="$(docker inspect --format '{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}}' "$CONTAINER" 2>/dev/null || true)"
if [ -z "$state" ]; then
  exit 0 # container not created; nothing to guard
fi
status="${state%% *}"
health="${state##* }"

now="$(date +%s)"
last=0
[ -f "$STAMP" ] && last="$(cat "$STAMP" 2>/dev/null || echo 0)"
if [ $((now - last)) -lt "$COOLDOWN_SEC" ]; then
  exit 0
fi

restart_reason=""
if [ "$status" = "running" ] && [ "$health" = "unhealthy" ]; then
  restart_reason="container unhealthy"
elif [ "$status" = "running" ]; then
  logs="$(docker logs --since "${WINDOW_MIN}m" "$CONTAINER" 2>&1 || true)"
  if printf '%s' "$logs" | grep -q "restarting (reason:"; then
    # Wedged only if no successful polling restart AFTER the last restart marker.
    after="$(printf '%s' "$logs" | awk '/restarting \(reason:/{found=NR} {lines[NR]=$0} END{for(i=found+1;i<=NR;i++) print lines[i]}')"
    if ! printf '%s' "$after" | grep -q "polling ingress started"; then
      restart_reason="telegram polling wedged (restart marker without polling ingress)"
    fi
  fi
fi

if [ -n "$restart_reason" ]; then
  log "restarting $CONTAINER: $restart_reason"
  echo "$now" > "$STAMP"
  docker restart "$CONTAINER" >/dev/null
  log "restart issued"
fi
