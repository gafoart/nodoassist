#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"
IMAGE_NAME="$(docker_e2e_resolve_image "nodoassist-plugins-e2e" NODOASSIST_PLUGINS_E2E_IMAGE)"
NODOASSIST_DOCKER_E2E_LOG_PRINT_BYTES="$(
  docker_e2e_read_positive_int_env NODOASSIST_DOCKER_E2E_LOG_PRINT_BYTES 65536
)"
CLAW_HUB_PREFLIGHT_BODY_MAX_BYTES="$(
  docker_e2e_read_positive_int_env NODOASSIST_PLUGINS_E2E_CLAWHUB_PREFLIGHT_BODY_MAX_BYTES 1048576
)"
CLAW_HUB_PREFLIGHT_TIMEOUT_MS="$(
  docker_e2e_read_positive_int_env NODOASSIST_PLUGINS_E2E_CLAWHUB_PREFLIGHT_TIMEOUT_MS 30000
)"
PLUGINS_CLI_TIMEOUT="${NODOASSIST_PLUGINS_CLI_TIMEOUT:-180s}"

docker_e2e_build_or_reuse "$IMAGE_NAME" plugins

NODOASSIST_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 plugins empty)"
DOCKER_ENV_ARGS=(
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0
  -e "NODOASSIST_DOCKER_E2E_LOG_PRINT_BYTES=$NODOASSIST_DOCKER_E2E_LOG_PRINT_BYTES"
  -e "NODOASSIST_PLUGINS_E2E_CLAWHUB_PREFLIGHT_BODY_MAX_BYTES=$CLAW_HUB_PREFLIGHT_BODY_MAX_BYTES"
  -e "NODOASSIST_PLUGINS_E2E_CLAWHUB_PREFLIGHT_TIMEOUT_MS=$CLAW_HUB_PREFLIGHT_TIMEOUT_MS"
  -e "NODOASSIST_PLUGINS_CLI_TIMEOUT=$PLUGINS_CLI_TIMEOUT"
  -e "NODOASSIST_TEST_STATE_SCRIPT_B64=$NODOASSIST_TEST_STATE_SCRIPT_B64"
)
for env_name in \
  NODOASSIST_PLUGINS_E2E_CLAWHUB \
  NODOASSIST_PLUGINS_E2E_LIVE_CLAWHUB \
  NODOASSIST_PLUGINS_E2E_CLAWHUB_SPEC \
  NODOASSIST_PLUGINS_E2E_CLAWHUB_ID; do
  env_value="${!env_name:-}"
  if [[ -n "$env_value" && "$env_value" != "undefined" && "$env_value" != "null" ]]; then
    DOCKER_ENV_ARGS+=(-e "$env_name")
  fi
done
if [[ "${NODOASSIST_PLUGINS_E2E_LIVE_CLAWHUB:-0}" = "1" ]]; then
  for env_name in \
    NODOASSIST_CLAWHUB_URL \
    CLAWHUB_URL \
    NODOASSIST_CLAWHUB_TOKEN \
    CLAWHUB_TOKEN \
    CLAWHUB_AUTH_TOKEN \
    NODOASSIST_PLUGINS_E2E_LIVE_NPM_REGISTRY; do
    env_value="${!env_name:-}"
    if [[ -n "$env_value" && "$env_value" != "undefined" && "$env_value" != "null" ]]; then
      DOCKER_ENV_ARGS+=(-e "$env_name")
    fi
  done
fi

echo "Running plugins Docker E2E..."
docker_e2e_run_logged_print_with_harness \
  plugins-run \
  "${DOCKER_ENV_ARGS[@]}" \
  "$IMAGE_NAME" \
  bash scripts/e2e/lib/plugins/sweep.sh

echo "OK"
