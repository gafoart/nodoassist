/**
 * Environment snapshot helpers for live gateway tests.
 */
import { deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";

const COMMON_LIVE_ENV_NAMES = [
  "NODOASSIST_AGENT_RUNTIME",
  "NODOASSIST_CONFIG_PATH",
  "NODOASSIST_GATEWAY_TOKEN",
  "OPENAI_API_KEY",
  "OPENAI_BASE_URL",
  "NODOASSIST_SKIP_BROWSER_CONTROL_SERVER",
  "NODOASSIST_SKIP_CANVAS_HOST",
  "NODOASSIST_SKIP_CHANNELS",
  "NODOASSIST_SKIP_CRON",
  "NODOASSIST_SKIP_GMAIL_WATCHER",
  "NODOASSIST_STATE_DIR",
] as const;

export type LiveEnvSnapshot = Record<string, string | undefined>;

/** Captures live-test environment variables so tests can restore them later. */
export function snapshotLiveEnv(extraNames: readonly string[] = []): LiveEnvSnapshot {
  const snapshot: LiveEnvSnapshot = {};
  for (const name of [...COMMON_LIVE_ENV_NAMES, ...extraNames]) {
    snapshot[name] = process.env[name];
  }
  return snapshot;
}

/** Restores a previously captured live-test environment snapshot. */
export function restoreLiveEnv(snapshot: LiveEnvSnapshot): void {
  for (const [name, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      deleteTestEnvValue(name);
    } else {
      setTestEnvValue(name, value);
    }
  }
}
