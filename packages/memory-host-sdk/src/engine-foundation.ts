// Real workspace contract for memory engine foundation concerns.

export {
  resolveAgentContextLimits,
  resolveAgentDir,
  resolveAgentWorkspaceDir,
  resolveDefaultAgentId,
  resolveSessionAgentId,
} from "./host/nodoassist-runtime-agent.js";
export {
  resolveMemorySearchConfig,
  resolveMemorySearchSyncConfig,
  type ResolvedMemorySearchConfig,
  type ResolvedMemorySearchSyncConfig,
} from "./host/nodoassist-runtime-agent.js";
export { parseDurationMs } from "./host/nodoassist-runtime-config.js";
export { loadConfig } from "./host/nodoassist-runtime-config.js";
export { resolveStateDir } from "./host/nodoassist-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/nodoassist-runtime-config.js";
export {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
} from "./host/nodoassist-runtime-config.js";
export { root } from "./host/nodoassist-runtime-io.js";
export { isPathInside } from "./host/fs-utils.js";
export { createSubsystemLogger } from "./host/nodoassist-runtime-io.js";
export { detectMime } from "./host/nodoassist-runtime-io.js";
export { resolveGlobalSingleton } from "./host/nodoassist-runtime-io.js";
export { onSessionTranscriptUpdate } from "./host/nodoassist-runtime-session.js";
export { splitShellArgs } from "./host/nodoassist-runtime-io.js";
export { runTasksWithConcurrency } from "./host/nodoassist-runtime-io.js";
export {
  shortenHomeInString,
  shortenHomePath,
  resolveUserPath,
  truncateUtf16Safe,
} from "./host/nodoassist-runtime-io.js";
export type { NodoAssistConfig } from "./host/nodoassist-runtime-config.js";
export type { SessionSendPolicyConfig } from "./host/nodoassist-runtime-config.js";
export type { SecretInput } from "./host/nodoassist-runtime-config.js";
export type {
  MemoryBackend,
  MemoryCitationsMode,
  MemoryQmdConfig,
  MemoryQmdIndexPath,
  MemoryQmdMcporterConfig,
  MemoryQmdSearchMode,
} from "./host/nodoassist-runtime-config.js";
export type { MemorySearchConfig } from "./host/nodoassist-runtime-config.js";
