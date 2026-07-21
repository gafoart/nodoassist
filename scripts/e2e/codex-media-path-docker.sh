#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
source "$ROOT_DIR/scripts/lib/docker-e2e-image.sh"

IMAGE_NAME="$(docker_e2e_resolve_image "nodoassist-codex-media-path-e2e" NODOASSIST_CODEX_MEDIA_PATH_E2E_IMAGE)"
PORT="$(docker_e2e_read_tcp_port_env NODOASSIST_CODEX_MEDIA_PATH_PORT 18790)"
TIMEOUT_SECONDS="$(docker_e2e_read_positive_int_env NODOASSIST_CODEX_MEDIA_PATH_TIMEOUT_SECONDS 180)"
LOG_TAIL_MAX_BYTES="$(docker_e2e_read_positive_int_env NODOASSIST_CODEX_MEDIA_PATH_LOG_TAIL_MAX_BYTES 2097152)"
TOKEN="codex-media-path-e2e-$$"
CODEX_PLUGIN_SPEC="${NODOASSIST_CODEX_MEDIA_PATH_PLUGIN_SPEC:-npm:@nodoassist/codex}"

docker_e2e_build_or_reuse "$IMAGE_NAME" codex-media-path "$ROOT_DIR/scripts/e2e/Dockerfile" "$ROOT_DIR"
NODOASSIST_TEST_STATE_SCRIPT_B64="$(docker_e2e_test_state_shell_b64 codex-media-path empty)"

echo "Running Codex media-path Docker E2E..."
docker_e2e_run_logged_with_harness codex-media-path \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e "NODOASSIST_CODEX_MEDIA_PATH_PLUGIN_SPEC=$CODEX_PLUGIN_SPEC" \
  -e "NODOASSIST_CODEX_MEDIA_PATH_LOG_TAIL_MAX_BYTES=$LOG_TAIL_MAX_BYTES" \
  -e "NODOASSIST_CODEX_MEDIA_PATH_TIMEOUT_SECONDS=$TIMEOUT_SECONDS" \
  -e "NODOASSIST_ALLOW_INSECURE_PRIVATE_WS=1" \
  -e "NODOASSIST_GATEWAY_TOKEN=$TOKEN" \
  -e "NODOASSIST_TEST_STATE_SCRIPT_B64=$NODOASSIST_TEST_STATE_SCRIPT_B64" \
  -e "PORT=$PORT" \
  -v "$ROOT_DIR/src:/app/src:ro" \
  -v "$ROOT_DIR/test/helpers:/app/test/helpers:ro" \
  "$IMAGE_NAME" \
  bash scripts/e2e/lib/codex-media-path/scenario.sh
