// Msteams plugin module implements user agent behavior.
import { createRequire } from "node:module";
import { getMSTeamsRuntime } from "./runtime.js";

let cachedUserAgent: string | undefined;

function resolveTeamsSdkVersion(): string {
  try {
    const require = createRequire(import.meta.url);
    const pkg = require("@microsoft/teams.apps/package.json") as { version?: string };
    return pkg.version ?? "unknown";
  } catch {
    return "unknown";
  }
}

function resolveNodoAssistVersion(): string {
  try {
    return getMSTeamsRuntime().version;
  } catch {
    return "unknown";
  }
}

/**
 * Build a combined User-Agent string that preserves the Teams SDK identity
 * and appends the NodoAssist version.
 *
 * Format: "teams.ts[apps]/<sdk-version> NodoAssist/<nodoassist-version>"
 * Example: "teams.ts[apps]/2.0.5 NodoAssist/2026.3.22"
 *
 * This lets the Teams backend track SDK usage while also identifying the
 * host application.
 */
/** Reset the cached User-Agent (for testing). */
export function resetUserAgentCache(): void {
  cachedUserAgent = undefined;
}

export function buildUserAgent(): string {
  if (cachedUserAgent) {
    return cachedUserAgent;
  }
  cachedUserAgent = `teams.ts[apps]/${resolveTeamsSdkVersion()} NodoAssist/${resolveNodoAssistVersion()}`;
  return cachedUserAgent;
}

/**
 * User-Agent fragment for the Teams SDK App's client. The SDK's Client.clone
 * merges this with its own `teams.ts[apps]/<sdk-version>` identifier, so we
 * only contribute the NodoAssist piece — passing the full `buildUserAgent()`
 * would double-print the SDK token.
 *
 * Format: "NodoAssist/<nodoassist-version>"
 */
export function buildNodoAssistUserAgentFragment(): string {
  return `NodoAssist/${resolveNodoAssistVersion()}`;
}

export function ensureUserAgentHeader(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers);
  if (!nextHeaders.has("User-Agent")) {
    nextHeaders.set("User-Agent", buildUserAgent());
  }
  return nextHeaders;
}
