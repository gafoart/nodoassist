#!/usr/bin/env bash
# Installs the packed NodoAssist tarball over dirty old-user state. When
# NODOASSIST_UPGRADE_SURVIVOR_BASELINE_SPEC is set, installs that published
# baseline first and upgrades it to the selected candidate.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
source "$ROOT_DIR/scripts/lib/docker-e2e-package.sh"
source "$ROOT_DIR/scripts/lib/nodoassist-e2e-instance.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "nodoassist-upgrade-survivor-e2e" NODOASSIST_UPGRADE_SURVIVOR_E2E_IMAGE)"
SKIP_BUILD="${NODOASSIST_UPGRADE_SURVIVOR_E2E_SKIP_BUILD:-0}"
DOCKER_RUN_TIMEOUT="${NODOASSIST_UPGRADE_SURVIVOR_DOCKER_RUN_TIMEOUT:-1200s}"
BASELINE_SPEC="${NODOASSIST_UPGRADE_SURVIVOR_BASELINE_SPEC:-}"
SCENARIO="${NODOASSIST_UPGRADE_SURVIVOR_SCENARIO:-base}"
UPDATE_RESTART_MODE="${NODOASSIST_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE:-manual}"
COMMAND_TIMEOUT="${NODOASSIST_UPGRADE_SURVIVOR_COMMAND_TIMEOUT:-900s}"
START_BUDGET_SECONDS="$(nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_START_BUDGET_SECONDS 90)"
STATUS_BUDGET_SECONDS="$(nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS 30)"
PROBE_TIMEOUT_MS="$(nodoassist_e2e_read_nonnegative_int_env NODOASSIST_UPGRADE_SURVIVOR_PROBE_TIMEOUT_MS 60000)"
PROBE_ATTEMPT_TIMEOUT_MS="$(
  nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_PROBE_ATTEMPT_TIMEOUT_MS 5000
)"
PROBE_MAX_BODY_BYTES="$(
  nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_PROBE_MAX_BODY_BYTES 1048576
)"
ROOT_MANAGED_VPS="${NODOASSIST_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS:-0}"

resolve_lane_artifact_suffix() {
  if [ -n "${NODOASSIST_DOCKER_ALL_LANE_NAME:-}" ]; then
    printf "%s" "$NODOASSIST_DOCKER_ALL_LANE_NAME"
    return
  fi

  if [ "$ROOT_MANAGED_VPS" = "1" ]; then
    printf "root-managed-vps-upgrade"
  elif [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
    printf "update-restart-auth"
  elif [ "${NODOASSIST_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" = "1" ]; then
    printf "published-upgrade-survivor"
  else
    printf "upgrade-survivor"
  fi

  if [ -n "${BASELINE_SPEC// }" ]; then
    printf -- "-%s" "$BASELINE_SPEC"
  fi
  if [ "$SCENARIO" != "base" ]; then
    printf -- "-%s" "$SCENARIO"
  fi
}

LANE_ARTIFACT_SUFFIX="$(resolve_lane_artifact_suffix)"
LANE_ARTIFACT_SUFFIX="${LANE_ARTIFACT_SUFFIX//[^A-Za-z0-9_.-]/_}"
ARTIFACT_DIR="${NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_DIR:-$ROOT_DIR/.artifacts/upgrade-survivor/$LANE_ARTIFACT_SUFFIX}"
DOCKER_RUN_USER_ARGS=()
PROBE_ENV_ARGS=(
  -e NODOASSIST_UPGRADE_SURVIVOR_PROBE_TIMEOUT_MS="$PROBE_TIMEOUT_MS"
  -e NODOASSIST_UPGRADE_SURVIVOR_PROBE_ATTEMPT_TIMEOUT_MS="$PROBE_ATTEMPT_TIMEOUT_MS"
  -e NODOASSIST_UPGRADE_SURVIVOR_PROBE_MAX_BODY_BYTES="$PROBE_MAX_BODY_BYTES"
)
if [ -n "${NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING:-}" ]; then
  PROBE_ENV_ARGS+=(
    -e NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING="$NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING"
  )
fi
if [ -n "${NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED:-}" ]; then
  PROBE_ENV_ARGS+=(
    -e NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED="$NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED"
  )
fi
cleanup_outer() {
  docker_e2e_cleanup_package_tgz "${PACKAGE_TGZ:-}"
}
trap cleanup_outer EXIT

if [ "$ROOT_MANAGED_VPS" = "1" ]; then
  if [ "${NODOASSIST_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" != "1" ]; then
    echo "NODOASSIST_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS=1 requires NODOASSIST_UPGRADE_SURVIVOR_PUBLISHED_BASELINE=1" >&2
    exit 1
  fi
  DOCKER_RUN_USER_ARGS+=(--user root -e HOME=/root -e USER=root)
fi

normalize_npm_candidate() {
  local raw="$1"
  case "$raw" in
    latest | beta)
      printf 'nodoassist@%s\n' "$raw"
      ;;
    nodoassist@*)
      printf '%s\n' "$raw"
      ;;
    *@*)
      echo "NODOASSIST_UPGRADE_SURVIVOR_CANDIDATE must be current, latest, beta, nodoassist@<version>, a bare version, or a .tgz path." >&2
      return 1
      ;;
    *)
      printf 'nodoassist@%s\n' "$raw"
      ;;
  esac
}

if [ "${NODOASSIST_UPGRADE_SURVIVOR_PUBLISHED_BASELINE:-0}" = "1" ]; then
  if [ -z "${BASELINE_SPEC// }" ]; then
    echo "NODOASSIST_UPGRADE_SURVIVOR_BASELINE_SPEC is required for published upgrade survivor" >&2
    exit 1
  fi

  mkdir -p "$ARTIFACT_DIR"
  chmod -R a+rwX "$ARTIFACT_DIR" || true

  DOCKER_E2E_PACKAGE_ARGS=()
  CANDIDATE_RAW="${NODOASSIST_UPGRADE_SURVIVOR_CANDIDATE:-current}"
  CANDIDATE_KIND="npm"
  CANDIDATE_SPEC=""

  if [ -n "${NODOASSIST_CURRENT_PACKAGE_TGZ:-}" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "$NODOASSIST_CURRENT_PACKAGE_TGZ")"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/nodoassist-current.tgz"
  elif [ "$CANDIDATE_RAW" = "current" ]; then
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor)"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/nodoassist-current.tgz"
  elif [[ "$CANDIDATE_RAW" == *.tgz ]]; then
    if [ ! -f "$CANDIDATE_RAW" ]; then
      echo "NodoAssist candidate tarball does not exist: $CANDIDATE_RAW" >&2
      exit 1
    fi
    PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "$CANDIDATE_RAW")"
    docker_e2e_package_mount_args "$PACKAGE_TGZ"
    CANDIDATE_KIND="tarball"
    CANDIDATE_SPEC="/tmp/nodoassist-current.tgz"
  else
    CANDIDATE_KIND="npm"
    CANDIDATE_SPEC="$(normalize_npm_candidate "$CANDIDATE_RAW")"
  fi

  NODOASSIST_TEST_STATE_FUNCTION_B64="$(docker_e2e_test_state_function_b64)"

  docker_e2e_build_or_reuse "$IMAGE_NAME" upgrade-survivor "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "bare" "$SKIP_BUILD"

  echo "Running published upgrade survivor Docker E2E..."
  docker_e2e_run_with_harness \
    -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
    -e NODOASSIST_TEST_STATE_FUNCTION_B64="$NODOASSIST_TEST_STATE_FUNCTION_B64" \
    -e NODOASSIST_UPGRADE_SURVIVOR_BASELINE="$BASELINE_SPEC" \
    -e NODOASSIST_UPGRADE_SURVIVOR_CANDIDATE_KIND="$CANDIDATE_KIND" \
    -e NODOASSIST_UPGRADE_SURVIVOR_CANDIDATE_SPEC="$CANDIDATE_SPEC" \
    -e NODOASSIST_UPGRADE_SURVIVOR_SCENARIO="$SCENARIO" \
    -e NODOASSIST_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE="$UPDATE_RESTART_MODE" \
    -e NODOASSIST_UPGRADE_SURVIVOR_COMMAND_TIMEOUT="$COMMAND_TIMEOUT" \
    -e NODOASSIST_UPGRADE_SURVIVOR_LEGACY_RUNTIME_DEPS_SYMLINK="${NODOASSIST_UPGRADE_SURVIVOR_LEGACY_RUNTIME_DEPS_SYMLINK:-}" \
    -e NODOASSIST_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS="$ROOT_MANAGED_VPS" \
    -e NODOASSIST_UPGRADE_SURVIVOR_SUMMARY_JSON=/tmp/nodoassist-upgrade-survivor-artifacts/summary.json \
    -e NODOASSIST_UPGRADE_SURVIVOR_START_BUDGET_SECONDS="$START_BUDGET_SECONDS" \
    -e NODOASSIST_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS="$STATUS_BUDGET_SECONDS" \
    "${PROBE_ENV_ARGS[@]}" \
    -v "$ARTIFACT_DIR:/tmp/nodoassist-upgrade-survivor-artifacts" \
    "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
    "${DOCKER_RUN_USER_ARGS[@]}" \
    "$IMAGE_NAME" \
    timeout --kill-after=30s "$DOCKER_RUN_TIMEOUT" bash scripts/e2e/lib/upgrade-survivor/run.sh
  exit 0
fi

PACKAGE_TGZ="$(docker_e2e_prepare_package_tgz upgrade-survivor "${NODOASSIST_CURRENT_PACKAGE_TGZ:-}")"
docker_e2e_package_mount_args "$PACKAGE_TGZ"
NODOASSIST_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 upgrade-survivor upgrade-survivor)"
mkdir -p "$ARTIFACT_DIR"
chmod -R a+rwX "$ARTIFACT_DIR" || true

docker_e2e_build_or_reuse "$IMAGE_NAME" upgrade-survivor "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR" "bare" "$SKIP_BUILD"

echo "Running upgrade survivor Docker E2E..."
docker_e2e_run_with_harness \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e NODOASSIST_TEST_STATE_SCRIPT_B64="$NODOASSIST_TEST_STATE_SCRIPT_B64" \
  -e NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT=/tmp/nodoassist-upgrade-survivor-artifacts \
  -e NODOASSIST_UPGRADE_SURVIVOR_ROOT_MANAGED_VPS="$ROOT_MANAGED_VPS" \
  -e NODOASSIST_UPGRADE_SURVIVOR_SCENARIO="$SCENARIO" \
  -e NODOASSIST_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE="$UPDATE_RESTART_MODE" \
  -e NODOASSIST_UPGRADE_SURVIVOR_COMMAND_TIMEOUT="$COMMAND_TIMEOUT" \
  -e NODOASSIST_UPGRADE_SURVIVOR_START_BUDGET_SECONDS="$START_BUDGET_SECONDS" \
  -e NODOASSIST_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS="$STATUS_BUDGET_SECONDS" \
  "${PROBE_ENV_ARGS[@]}" \
  -v "$ARTIFACT_DIR:/tmp/nodoassist-upgrade-survivor-artifacts" \
  "${DOCKER_E2E_PACKAGE_ARGS[@]}" \
  "${DOCKER_RUN_USER_ARGS[@]}" \
  "$IMAGE_NAME" \
  timeout --kill-after=30s "$DOCKER_RUN_TIMEOUT" bash -lc 'set -euo pipefail
source scripts/lib/nodoassist-e2e-instance.sh

export npm_config_loglevel=error
export npm_config_fund=false
export npm_config_audit=false
export NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT="${NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT:-/tmp/nodoassist-upgrade-survivor-artifacts}"
export NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT="${NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT:-/tmp/nodoassist-upgrade-survivor-runtime}"
mkdir -p "$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT"
export TMPDIR="${NODOASSIST_UPGRADE_SURVIVOR_TMPDIR:-$NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT/tmp}"
export NODOASSIST_TEST_STATE_TMPDIR="${NODOASSIST_UPGRADE_SURVIVOR_TEST_STATE_TMPDIR:-$NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT/state-tmp}"
export npm_config_prefix="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/npm-prefix"
export NPM_CONFIG_PREFIX="$npm_config_prefix"
export npm_config_cache="${NODOASSIST_UPGRADE_SURVIVOR_NPM_CACHE:-$NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT/npm-cache}"
export NPM_CONFIG_CACHE="$npm_config_cache"
export npm_config_tmp="$TMPDIR"
mkdir -p "$NODOASSIST_UPGRADE_SURVIVOR_RUNTIME_ROOT" "$TMPDIR" "$NODOASSIST_TEST_STATE_TMPDIR" "$npm_config_prefix" "$npm_config_cache"
chmod 700 "$npm_config_cache" || true
export PATH="$npm_config_prefix/bin:$PATH"
export CI=true
export NODOASSIST_NO_ONBOARD=1
export NODOASSIST_NO_PROMPT=1
export NODOASSIST_SKIP_PROVIDERS=1
export NODOASSIST_SKIP_CHANNELS=1
export NODOASSIST_DISABLE_BONJOUR=1
export GATEWAY_AUTH_TOKEN_REF="upgrade-survivor-token"
export OPENAI_API_KEY="sk-nodoassist-upgrade-survivor"
export DISCORD_BOT_TOKEN="upgrade-survivor-discord-token"
export TELEGRAM_BOT_TOKEN="123456:upgrade-survivor-telegram-token"
export FEISHU_APP_SECRET="upgrade-survivor-feishu-secret"
export BRAVE_API_KEY="BSA_upgrade_survivor_brave_key"

UPDATE_RESTART_MODE="${NODOASSIST_UPGRADE_SURVIVOR_UPDATE_RESTART_MODE:-manual}"
command_timeout="${NODOASSIST_UPGRADE_SURVIVOR_COMMAND_TIMEOUT:-900s}"
PORT=18789
START_BUDGET="$(nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_START_BUDGET_SECONDS 90)"
STATUS_BUDGET="$(nodoassist_e2e_read_positive_int_env NODOASSIST_UPGRADE_SURVIVOR_STATUS_BUDGET_SECONDS 30)"
GATEWAY_LOG="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/gateway.log"
SYSTEMCTL_SHIM_LOG="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim.log"
SYSTEMCTL_SHIM_PID_FILE="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim.pid"
SYSTEMCTL_SHIM_DAEMON_LOG="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/systemctl-shim-gateway.log"
BASELINE_SERVICE_INSTALL_JSON="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/baseline-service-install.json"
BASELINE_SERVICE_INSTALL_ERR="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/baseline-service-install.err"
export NODOASSIST_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_LOG="$SYSTEMCTL_SHIM_LOG"
export NODOASSIST_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_PID_FILE="$SYSTEMCTL_SHIM_PID_FILE"
export NODOASSIST_UPGRADE_SURVIVOR_SYSTEMCTL_SHIM_DAEMON_LOG="$SYSTEMCTL_SHIM_DAEMON_LOG"
export NODOASSIST_UPGRADE_SURVIVOR_BASELINE_SERVICE_INSTALL_JSON="$BASELINE_SERVICE_INSTALL_JSON"
export NODOASSIST_UPGRADE_SURVIVOR_BASELINE_SERVICE_INSTALL_ERR="$BASELINE_SERVICE_INSTALL_ERR"

gateway_pid=""
plugin_registry_pid=""
cleanup() {
  if [ -n "${plugin_registry_pid:-}" ]; then
    kill "$plugin_registry_pid" >/dev/null 2>&1 || true
  fi
  nodoassist_e2e_terminate_gateways "${gateway_pid:-}"
  if [ -s "$SYSTEMCTL_SHIM_PID_FILE" ]; then
    nodoassist_e2e_terminate_gateways "$(cat "$SYSTEMCTL_SHIM_PID_FILE" 2>/dev/null || true)"
  fi
}
trap cleanup EXIT

configure_configured_plugin_install_fixture_registry() {
  [ "${NODOASSIST_UPGRADE_SURVIVOR_SCENARIO:-base}" = "configured-plugin-installs" ] || return 0

  local fixture_root="$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/configured-plugin-installs-npm-fixture"
  local package_dir="$fixture_root/package"
  local tarball="$fixture_root/nodoassist-brave-plugin-2026.5.2.tgz"
  local port_file="$fixture_root/npm-registry-port"
  local log_file="$fixture_root/npm-registry.log"
  mkdir -p "$package_dir"
  FIXTURE_PACKAGE_DIR="$package_dir" node <<'"'"'NODE'"'"'
const fs = require("node:fs");
const path = require("node:path");
const root = process.env.FIXTURE_PACKAGE_DIR;
fs.mkdirSync(root, { recursive: true });
fs.writeFileSync(
  path.join(root, "package.json"),
  `${JSON.stringify(
    {
      name: "@nodoassist/brave-plugin",
      version: "2026.5.2",
      nodoassist: { extensions: ["./index.js"] },
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(root, "nodoassist.plugin.json"),
  `${JSON.stringify(
    {
      id: "brave",
      activation: { onStartup: false },
      providerAuthEnvVars: { brave: ["BRAVE_API_KEY"] },
      contracts: { webSearchProviders: ["brave"] },
      configSchema: {
        type: "object",
        additionalProperties: false,
        properties: {
          webSearch: {
            type: "object",
            additionalProperties: false,
            properties: {
              apiKey: { type: ["string", "object"] },
              mode: { type: "string", enum: ["web", "llm-context"] },
              baseUrl: { type: ["string", "object"] },
            },
          },
        },
      },
    },
    null,
    2,
  )}\n`,
);
fs.writeFileSync(
  path.join(root, "index.js"),
  `module.exports = { id: "brave", name: "Brave Fixture", register() {} };\n`,
);
NODE
  tar -czf "$tarball" -C "$fixture_root" package
  node scripts/e2e/lib/plugins/npm-registry-server.mjs \
    "$port_file" \
    "@nodoassist/brave-plugin" \
    "2026.5.2" \
    "$tarball" \
    >"$log_file" 2>&1 &
  plugin_registry_pid="$!"

  for _ in $(seq 1 100); do
    if [ -s "$port_file" ]; then
      export NPM_CONFIG_REGISTRY="http://127.0.0.1:$(cat "$port_file")"
      export npm_config_registry="$NPM_CONFIG_REGISTRY"
      return 0
    fi
    if ! kill -0 "$plugin_registry_pid" 2>/dev/null; then
      nodoassist_e2e_print_log "$log_file" >&2
      return 1
    fi
    sleep 0.1
  done

  nodoassist_e2e_print_log "$log_file" >&2
  echo "Timed out waiting for configured plugin install npm fixture registry." >&2
  return 1
}

nodoassist_e2e_eval_test_state_from_b64 "${NODOASSIST_TEST_STATE_SCRIPT_B64:?missing NODOASSIST_TEST_STATE_SCRIPT_B64}"
node scripts/e2e/lib/upgrade-survivor/assertions.mjs seed

nodoassist_e2e_install_package "$NODOASSIST_UPGRADE_SURVIVOR_ARTIFACT_ROOT/install.log" "upgrade survivor package" "$npm_config_prefix"
command -v nodoassist >/dev/null
package_version="$(node -p "JSON.parse(require(\"node:fs\").readFileSync(process.argv[1] + \"/lib/node_modules/nodoassist/package.json\", \"utf8\")).version" "$npm_config_prefix")"
NODOASSIST_PACKAGE_ACCEPTANCE_LEGACY_COMPAT="$(
  node scripts/e2e/lib/package-compat.mjs "$package_version"
)"
export NODOASSIST_PACKAGE_ACCEPTANCE_LEGACY_COMPAT

echo "Checking dirty-state config before update..."
NODOASSIST_UPGRADE_SURVIVOR_ASSERT_STAGE=baseline node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-config
NODOASSIST_UPGRADE_SURVIVOR_ASSERT_STAGE=baseline node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-state
if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  # shellcheck disable=SC1091
  source scripts/e2e/lib/upgrade-survivor/update-restart-auth.sh
  prepare_update_restart_probe_current_install "$PORT" "$GATEWAY_LOG"
fi

echo "Running package update against the mounted tarball..."
update_args=(update --tag "${NODOASSIST_CURRENT_PACKAGE_TGZ:?missing NODOASSIST_CURRENT_PACKAGE_TGZ}" --yes --json)
if [ "$UPDATE_RESTART_MODE" != "auto-auth" ]; then
  update_args+=(--no-restart)
fi
set +e
nodoassist_e2e_maybe_timeout "$command_timeout" env -u NODOASSIST_GATEWAY_TOKEN -u NODOASSIST_GATEWAY_PASSWORD NODOASSIST_ALLOW_ROOT=1 nodoassist "${update_args[@]}" >/tmp/nodoassist-upgrade-survivor-update.json 2>/tmp/nodoassist-upgrade-survivor-update.err
update_status=$?
set -e
if [ "$update_status" -ne 0 ]; then
  echo "nodoassist update failed" >&2
  nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-update.err >&2
  nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-update.json >&2
  exit "$update_status"
fi

if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  echo "Skipping doctor repair until after restart proof."
else
  echo "Running non-interactive doctor repair..."
  configure_configured_plugin_install_fixture_registry
  if ! nodoassist_e2e_maybe_timeout "$command_timeout" nodoassist doctor --fix --non-interactive >/tmp/nodoassist-upgrade-survivor-doctor.log 2>&1; then
    echo "nodoassist doctor failed" >&2
    nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-doctor.log >&2
    exit 1
  fi
  if ! nodoassist_e2e_maybe_timeout "$command_timeout" nodoassist config validate >>/tmp/nodoassist-upgrade-survivor-doctor.log 2>&1; then
    echo "post-doctor config validation failed" >&2
    nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-doctor.log >&2
    exit 1
  fi
fi

echo "Verifying config and state survived update..."
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-config
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-state

startup_summary="n/a"
if [ "$UPDATE_RESTART_MODE" = "auto-auth" ]; then
  echo "Gateway restart was handled by nodoassist update."
else
  echo "Starting gateway from upgraded state..."
  start_epoch="$(node -e "process.stdout.write(String(Date.now()))")"
  nodoassist gateway --port "$PORT" --bind loopback --allow-unconfigured >"$GATEWAY_LOG" 2>&1 &
  gateway_pid="$!"
  nodoassist_e2e_wait_gateway_ready "$gateway_pid" "$GATEWAY_LOG" 360 "$PORT"
  ready_epoch="$(node -e "process.stdout.write(String(Date.now()))")"
  start_seconds=$(((ready_epoch - start_epoch + 999) / 1000))
  if [ "$start_seconds" -gt "$START_BUDGET" ]; then
    echo "gateway startup exceeded survivor budget: ${start_seconds}s > ${START_BUDGET}s" >&2
    nodoassist_e2e_print_log "$GATEWAY_LOG" >&2
    exit 1
  fi
  startup_summary="${start_seconds}s"
fi

echo "Checking gateway HTTP probes..."
node scripts/e2e/lib/upgrade-survivor/probe-gateway.mjs \
  --base-url "http://127.0.0.1:$PORT" \
  --path /healthz \
  --expect live \
  --out /tmp/nodoassist-upgrade-survivor-healthz.json

readyz_probe_args=(
  --base-url "http://127.0.0.1:$PORT"
  --path /readyz
  --expect ready
)
if [ -n "${NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING:-}" ]; then
  readyz_probe_args+=(--allow-failing "$NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_FAILING")
fi
if [ "${NODOASSIST_UPGRADE_SURVIVOR_READYZ_ALLOW_DEGRADED:-}" = "1" ]; then
  readyz_probe_args+=(--allow-degraded-ready)
fi
readyz_probe_args+=(--out /tmp/nodoassist-upgrade-survivor-readyz.json)
node scripts/e2e/lib/upgrade-survivor/probe-gateway.mjs "${readyz_probe_args[@]}"

echo "Checking gateway RPC status..."
status_start="$(node -e "process.stdout.write(String(Date.now()))")"
if ! nodoassist_e2e_maybe_timeout "$command_timeout" nodoassist gateway status --url "ws://127.0.0.1:$PORT" --token "$GATEWAY_AUTH_TOKEN_REF" --require-rpc --timeout 30000 --json >/tmp/nodoassist-upgrade-survivor-status.json 2>/tmp/nodoassist-upgrade-survivor-status.err; then
  echo "gateway status failed" >&2
  nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-status.err >&2
  nodoassist_e2e_print_log "$GATEWAY_LOG" >&2
  nodoassist_e2e_print_log "$SYSTEMCTL_SHIM_DAEMON_LOG" >&2
  exit 1
fi
status_end="$(node -e "process.stdout.write(String(Date.now()))")"
status_seconds=$(((status_end - status_start + 999) / 1000))
if [ "$status_seconds" -gt "$STATUS_BUDGET" ]; then
  echo "gateway status exceeded survivor budget: ${status_seconds}s > ${STATUS_BUDGET}s" >&2
  nodoassist_e2e_print_log /tmp/nodoassist-upgrade-survivor-status.json >&2
  exit 1
fi
node scripts/e2e/lib/upgrade-survivor/assertions.mjs assert-status-json /tmp/nodoassist-upgrade-survivor-status.json

echo "Upgrade survivor Docker E2E passed scenario=${NODOASSIST_UPGRADE_SURVIVOR_SCENARIO:-base} updateRestartMode=${UPDATE_RESTART_MODE} startup=${startup_summary} status=${status_seconds}s."
'
