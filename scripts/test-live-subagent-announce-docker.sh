#!/usr/bin/env bash
set -euo pipefail

SCRIPT_ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT_DIR="${NODOASSIST_LIVE_DOCKER_REPO_ROOT:-$SCRIPT_ROOT_DIR}"
ROOT_DIR="$(cd "$ROOT_DIR" && pwd)"
TRUSTED_HARNESS_DIR="${NODOASSIST_LIVE_DOCKER_TRUSTED_HARNESS_DIR:-$SCRIPT_ROOT_DIR}"
if [[ -z "$TRUSTED_HARNESS_DIR" || ! -d "$TRUSTED_HARNESS_DIR" ]]; then
  echo "ERROR: trusted live Docker harness directory not found: ${TRUSTED_HARNESS_DIR:-<empty>}." >&2
  exit 1
fi
TRUSTED_HARNESS_DIR="$(cd "$TRUSTED_HARNESS_DIR" && pwd)"
source "$TRUSTED_HARNESS_DIR/scripts/lib/live-docker-auth.sh"

IMAGE_NAME="${NODOASSIST_IMAGE:-nodoassist:local}"
LIVE_IMAGE_NAME="${NODOASSIST_LIVE_IMAGE:-${IMAGE_NAME}-live}"
CONFIG_DIR="${NODOASSIST_CONFIG_DIR:-$HOME/.nodoassist}"
WORKSPACE_DIR="${NODOASSIST_WORKSPACE_DIR:-$HOME/.nodoassist/workspace}"
PROFILE_FILE="$(nodoassist_live_default_profile_file)"
DOCKER_USER="${NODOASSIST_DOCKER_USER:-node}"
DOCKER_HOME_MOUNT=()
DOCKER_EXTRA_ENV_FILES=()
DOCKER_TRUSTED_HARNESS_CONTAINER_DIR="/trusted-harness"
DOCKER_TRUSTED_HARNESS_MOUNT=(-v "$TRUSTED_HARNESS_DIR":"$DOCKER_TRUSTED_HARNESS_CONTAINER_DIR":ro)
TEMP_DIRS=()

cleanup_temp_dirs() {
  if ((${#TEMP_DIRS[@]} > 0)); then
    rm -rf "${TEMP_DIRS[@]}"
  fi
}
trap cleanup_temp_dirs EXIT

if [[ -n "${NODOASSIST_DOCKER_CACHE_HOME_DIR:-}" ]]; then
  CACHE_HOME_DIR="${NODOASSIST_DOCKER_CACHE_HOME_DIR}"
elif nodoassist_live_is_ci; then
  CACHE_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/nodoassist-docker-cache.XXXXXX")"
  TEMP_DIRS+=("$CACHE_HOME_DIR")
else
  CACHE_HOME_DIR="$HOME/.cache/nodoassist/docker-cache"
fi
nodoassist_live_prepare_bind_dir_for_container_user "$CACHE_HOME_DIR"

if nodoassist_live_uses_managed_bind_dirs; then
  DOCKER_USER="$(id -u):$(id -g)"
  DOCKER_HOME_DIR="$(mktemp -d "${RUNNER_TEMP:-/tmp}/nodoassist-docker-home.XXXXXX")"
  TEMP_DIRS+=("$DOCKER_HOME_DIR")
  nodoassist_live_prepare_bind_dir_for_container_user "$DOCKER_HOME_DIR"
  DOCKER_HOME_MOUNT=(-v "$DOCKER_HOME_DIR":/home/node)
fi

PROFILE_MOUNT=()
PROFILE_STATUS="none"
if [[ -f "$PROFILE_FILE" && -r "$PROFILE_FILE" ]]; then
  if [[ -n "${DOCKER_HOME_DIR:-}" ]]; then
    nodoassist_live_stage_profile_into_home "$DOCKER_HOME_DIR" "$PROFILE_FILE"
  else
    PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
  fi
  PROFILE_STATUS="$PROFILE_FILE"
fi

if [[ -n "${OPENAI_API_KEY:-}" || -n "${OPENAI_BASE_URL:-}" || -n "${GEMINI_API_KEY:-}" || -n "${GOOGLE_API_KEY:-}" ]]; then
  docker_env_dir="$(mktemp -d "${RUNNER_TEMP:-/tmp}/nodoassist-subagent-live-env.XXXXXX")"
  TEMP_DIRS+=("$docker_env_dir")
  docker_env_file="$docker_env_dir/provider.env"
  {
    if [[ -n "${OPENAI_API_KEY:-}" ]]; then
      printf 'NODOASSIST_DOCKER_LIVE_OPENAI_API_KEY=%s\n' "${OPENAI_API_KEY}"
    fi
    if [[ -n "${OPENAI_BASE_URL:-}" ]]; then
      printf 'NODOASSIST_DOCKER_LIVE_OPENAI_BASE_URL=%s\n' "${OPENAI_BASE_URL}"
    fi
    if [[ -n "${GEMINI_API_KEY:-}" ]]; then
      printf 'NODOASSIST_DOCKER_LIVE_GEMINI_API_KEY=%s\n' "${GEMINI_API_KEY}"
    fi
    if [[ -n "${GOOGLE_API_KEY:-}" ]]; then
      printf 'NODOASSIST_DOCKER_LIVE_GOOGLE_API_KEY=%s\n' "${GOOGLE_API_KEY}"
    fi
  } >"$docker_env_file"
  DOCKER_EXTRA_ENV_FILES+=(--env-file "$docker_env_file")
fi

CONTAINER_NODE_OPTIONS="$(nodoassist_live_container_node_options)"

read -r -d '' LIVE_TEST_CMD <<'EOF' || true
set -euo pipefail
[ -f "$HOME/.profile" ] && [ -r "$HOME/.profile" ] && source "$HOME/.profile" || true
if [ -n "${NODOASSIST_DOCKER_LIVE_OPENAI_API_KEY:-}" ]; then
  export OPENAI_API_KEY="$NODOASSIST_DOCKER_LIVE_OPENAI_API_KEY"
  unset NODOASSIST_DOCKER_LIVE_OPENAI_API_KEY
fi
if [ -n "${NODOASSIST_DOCKER_LIVE_OPENAI_BASE_URL:-}" ]; then
  export OPENAI_BASE_URL="$NODOASSIST_DOCKER_LIVE_OPENAI_BASE_URL"
  unset NODOASSIST_DOCKER_LIVE_OPENAI_BASE_URL
fi
if [ -n "${NODOASSIST_DOCKER_LIVE_GEMINI_API_KEY:-}" ]; then
  export GEMINI_API_KEY="$NODOASSIST_DOCKER_LIVE_GEMINI_API_KEY"
  unset NODOASSIST_DOCKER_LIVE_GEMINI_API_KEY
fi
if [ -n "${NODOASSIST_DOCKER_LIVE_GOOGLE_API_KEY:-}" ]; then
  export GOOGLE_API_KEY="$NODOASSIST_DOCKER_LIVE_GOOGLE_API_KEY"
  unset NODOASSIST_DOCKER_LIVE_GOOGLE_API_KEY
fi
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export COREPACK_HOME="${COREPACK_HOME:-$XDG_CACHE_HOME/node/corepack}"
export NPM_CONFIG_CACHE="${NPM_CONFIG_CACHE:-$XDG_CACHE_HOME/npm}"
export npm_config_cache="$NPM_CONFIG_CACHE"
mkdir -p "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE"
chmod 700 "$XDG_CACHE_HOME" "$COREPACK_HOME" "$NPM_CONFIG_CACHE" || true
tmp_dir="$(mktemp -d)"
trusted_scripts_dir="${NODOASSIST_LIVE_DOCKER_SCRIPTS_DIR:-/src/scripts}"
source "$trusted_scripts_dir/lib/live-docker-stage.sh"
nodoassist_live_stage_source_tree "$tmp_dir"
nodoassist_live_stage_node_modules "$tmp_dir"
nodoassist_live_link_runtime_tree "$tmp_dir"
nodoassist_live_stage_state_dir "$tmp_dir/.nodoassist-state"
nodoassist_live_prepare_staged_config
cd "$tmp_dir"
NODOASSIST_LIVE_TEST=1 \
NODOASSIST_LIVE_SUBAGENT_E2E=1 \
NODOASSIST_VITEST_MAX_WORKERS="${NODOASSIST_VITEST_MAX_WORKERS:-1}" \
node scripts/test-live.mjs -- src/agents/subagent-announce.live.test.ts -- --reporter=verbose
EOF

NODOASSIST_LIVE_DOCKER_REPO_ROOT="$ROOT_DIR" "$TRUSTED_HARNESS_DIR/scripts/test-live-build-docker.sh"
if nodoassist_live_uses_managed_bind_dirs; then
  nodoassist_live_chown_bind_dirs_for_container_user \
    "$LIVE_IMAGE_NAME" \
    "$DOCKER_USER" \
    "$CACHE_HOME_DIR" \
    "${DOCKER_HOME_DIR:-}"
fi

echo "==> Run subagent announce live test in Docker"
echo "==> Target: src/agents/subagent-announce.live.test.ts"
echo "==> Model: ${NODOASSIST_LIVE_SUBAGENT_E2E_MODEL:-openai/gpt-5.5}"
echo "==> Profile file: $PROFILE_STATUS"
DOCKER_RUN_ARGS=()
nodoassist_live_init_docker_run_args DOCKER_RUN_ARGS "${NODOASSIST_LIVE_SUBAGENT_DOCKER_RUN_TIMEOUT:-1200s}"
DOCKER_RUN_ARGS+=(--rm -t \
  -u "$DOCKER_USER" \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS="$CONTAINER_NODE_OPTIONS" \
  -e NODOASSIST_SKIP_CHANNELS=1 \
  -e NODOASSIST_SUPPRESS_NOTES=1 \
  -e NODOASSIST_LIVE_DOCKER_SCRIPTS_DIR="${DOCKER_TRUSTED_HARNESS_CONTAINER_DIR}/scripts" \
  -e NODOASSIST_LIVE_DOCKER_SOURCE_STAGE_MODE="${NODOASSIST_LIVE_DOCKER_SOURCE_STAGE_MODE:-copy}" \
  -e NODOASSIST_LIVE_TEST=1 \
  -e NODOASSIST_LIVE_TEST_QUIET="${NODOASSIST_LIVE_TEST_QUIET:-}" \
  -e NODOASSIST_LIVE_WRAPPER_HEARTBEAT_MS="${NODOASSIST_LIVE_WRAPPER_HEARTBEAT_MS:-}" \
  -e NODOASSIST_LIVE_SUBAGENT_E2E=1 \
  -e NODOASSIST_LIVE_SUBAGENT_E2E_MODEL="${NODOASSIST_LIVE_SUBAGENT_E2E_MODEL:-}" \
  -e NODOASSIST_VITEST_FS_MODULE_CACHE=0 \
  -e NODOASSIST_VITEST_MAX_WORKERS="${NODOASSIST_VITEST_MAX_WORKERS:-1}")
nodoassist_live_append_array DOCKER_RUN_ARGS DOCKER_EXTRA_ENV_FILES
nodoassist_live_append_array DOCKER_RUN_ARGS DOCKER_HOME_MOUNT
nodoassist_live_append_array DOCKER_RUN_ARGS DOCKER_TRUSTED_HARNESS_MOUNT
DOCKER_RUN_ARGS+=(\
  -v "$CACHE_HOME_DIR":/home/node/.cache \
  -v "$ROOT_DIR":/src:ro \
  -v "$CONFIG_DIR":/home/node/.nodoassist \
  -v "$WORKSPACE_DIR":/home/node/.nodoassist/workspace)
nodoassist_live_append_array DOCKER_RUN_ARGS PROFILE_MOUNT
DOCKER_RUN_ARGS+=(\
  "$LIVE_IMAGE_NAME" \
  -lc "$LIVE_TEST_CMD")
"${DOCKER_RUN_ARGS[@]}"
