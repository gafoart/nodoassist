// Test fixture helpers for constructing ACP runtime session metadata.
import type { SessionAcpMeta } from "../../../config/sessions/types.js";
import type { NodoAssistConfig } from "../../../config/types.nodoassist.js";

export function createAcpTestConfig(overrides?: Partial<NodoAssistConfig>): NodoAssistConfig {
  return {
    acp: {
      enabled: true,
      stream: {
        coalesceIdleMs: 0,
        maxChunkChars: 64,
      },
    },
    ...overrides,
  } as NodoAssistConfig;
}

export function createAcpSessionMeta(overrides?: Partial<SessionAcpMeta>): SessionAcpMeta {
  return {
    backend: "acpx",
    agent: "codex",
    runtimeSessionName: "runtime:1",
    mode: "persistent",
    state: "idle",
    lastActivityAt: Date.now(),
    identity: {
      state: "resolved",
      acpxSessionId: "acpx-session-1",
      source: "status",
      lastUpdatedAt: Date.now(),
    },
    ...overrides,
  };
}
