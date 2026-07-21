#!/usr/bin/env bash
set -euo pipefail

source scripts/lib/nodoassist-e2e-instance.sh
nodoassist_e2e_eval_test_state_from_b64 "${NODOASSIST_TEST_STATE_SCRIPT_B64:?missing NODOASSIST_TEST_STATE_SCRIPT_B64}"
export NODOASSIST_SKIP_CHANNELS=1
export NODOASSIST_SKIP_GMAIL_WATCHER=1
export NODOASSIST_SKIP_CRON=1
export NODOASSIST_SKIP_CANVAS_HOST=1
export NODOASSIST_SKIP_BROWSER_CONTROL_SERVER=1
export NODOASSIST_SKIP_ACPX_RUNTIME=1
export NODOASSIST_SKIP_ACPX_RUNTIME_PROBE=1
export NODOASSIST_AGENT_HARNESS_FALLBACK=none
export NODOASSIST_CODEX_MEDIA_PATH_APP_SERVER_LOG="/tmp/nodoassist-codex-media-path-app-server.jsonl"

PORT="${PORT:?missing PORT}"
TOKEN="${NODOASSIST_GATEWAY_TOKEN:?missing NODOASSIST_GATEWAY_TOKEN}"
PLUGIN_SPEC="${NODOASSIST_CODEX_MEDIA_PATH_PLUGIN_SPEC:?missing NODOASSIST_CODEX_MEDIA_PATH_PLUGIN_SPEC}"
GATEWAY_LOG="/tmp/nodoassist-codex-media-path-gateway.log"
CLIENT_LOG="/tmp/nodoassist-codex-media-path-client.log"
PLUGIN_INSTALL_LOG="/tmp/nodoassist-codex-media-path-plugin-install.log"
PLUGIN_INSPECT_LOG="/tmp/nodoassist-codex-media-path-plugin-inspect.json"
gateway_pid=""

cleanup() {
  nodoassist_e2e_stop_process "$gateway_pid"
}
trap cleanup EXIT

dump_debug_logs() {
  local status="$1"
  echo "Codex media-path Docker E2E failed with exit code $status" >&2
  nodoassist_e2e_dump_logs "$PLUGIN_INSTALL_LOG" "$PLUGIN_INSPECT_LOG" "$GATEWAY_LOG" "$CLIENT_LOG" "$NODOASSIST_CODEX_MEDIA_PATH_APP_SERVER_LOG"
}
trap 'status=$?; dump_debug_logs "$status"; exit "$status"' ERR

entry="$(nodoassist_e2e_resolve_entrypoint)"
mkdir -p "$NODOASSIST_STATE_DIR" "$NODOASSIST_TEST_WORKSPACE_DIR"
rm -f "$NODOASSIST_CODEX_MEDIA_PATH_APP_SERVER_LOG"

nodoassist_e2e_enable_nodoassist_cli_timeout

echo "Installing Codex plugin: $PLUGIN_SPEC"
nodoassist plugins install "$PLUGIN_SPEC" --force >"$PLUGIN_INSTALL_LOG" 2>&1
nodoassist plugins inspect codex --runtime --json >"$PLUGIN_INSPECT_LOG"

node scripts/e2e/lib/codex-media-path/write-config.mjs

gateway_pid="$(nodoassist_e2e_start_gateway "$entry" "$PORT" "$GATEWAY_LOG")"
nodoassist_e2e_wait_gateway_ready "$gateway_pid" "$GATEWAY_LOG" 480 "$PORT"

PORT="$PORT" NODOASSIST_GATEWAY_TOKEN="$TOKEN" \
  tsx scripts/e2e/lib/codex-media-path/client.mjs >"$CLIENT_LOG" 2>&1

nodoassist_e2e_print_log "$CLIENT_LOG"
echo "Codex media-path Docker E2E passed"
