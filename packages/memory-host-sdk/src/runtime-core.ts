// Focused runtime contract for memory plugin config/state/helpers.

export type { AnyAgentTool } from "./host/nodoassist-runtime-agent.js";
export { resolveCronStyleNow } from "./host/nodoassist-runtime-agent.js";
export { DEFAULT_AGENT_COMPACTION_RESERVE_TOKENS_FLOOR } from "./host/nodoassist-runtime-agent.js";
export { resolveDefaultAgentId, resolveSessionAgentId } from "./host/nodoassist-runtime-agent.js";
export { resolveMemorySearchConfig } from "./host/nodoassist-runtime-agent.js";
export {
  asToolParamsRecord,
  jsonResult,
  readNumberParam,
  readStringParam,
} from "./host/nodoassist-runtime-agent.js";
export { SILENT_REPLY_TOKEN } from "./host/nodoassist-runtime-session.js";
export { parseNonNegativeByteSize } from "./host/nodoassist-runtime-config.js";
export {
  getRuntimeConfig,
  /** @deprecated Use getRuntimeConfig(), or pass the already loaded config through the call path. */
  loadConfig,
} from "./host/nodoassist-runtime-config.js";
export { resolveStateDir } from "./host/nodoassist-runtime-config.js";
export { resolveSessionTranscriptsDirForAgent } from "./host/nodoassist-runtime-config.js";
export { emptyPluginConfigSchema } from "./host/nodoassist-runtime-memory.js";
export {
  buildActiveMemoryPromptSection,
  getMemoryCapabilityRegistration,
  listActiveMemoryPublicArtifacts,
} from "./host/nodoassist-runtime-memory.js";
export { parseAgentSessionKey } from "./host/nodoassist-runtime-agent.js";
export type { NodoAssistConfig } from "./host/nodoassist-runtime-config.js";
export type { MemoryCitationsMode } from "./host/nodoassist-runtime-config.js";
export type {
  MemoryFlushPlan,
  MemoryFlushPlanResolver,
  MemoryPluginCapability,
  MemoryPluginPublicArtifact,
  MemoryPluginPublicArtifactsProvider,
  MemoryPluginRuntime,
  MemoryPromptSectionBuilder,
} from "./host/nodoassist-runtime-memory.js";
export type { NodoAssistPluginApi } from "./host/nodoassist-runtime-memory.js";
