// Narrow Matrix monitor helper seam.
// Keep monitor internals off the broad package runtime-api barrel so monitor
// tests and shared workers do not pull unrelated Matrix helper surfaces.

export type { NormalizedLocation } from "nodoassist/plugin-sdk/channel-inbound";
export type { PluginRuntime, RuntimeLogger } from "nodoassist/plugin-sdk/plugin-runtime";
export type { BlockReplyContext, ReplyPayload } from "nodoassist/plugin-sdk/reply-runtime";
export type { MarkdownTableMode, NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export {
  addAllowlistUserEntriesFromConfigEntry,
  buildAllowlistResolutionSummary,
  canonicalizeAllowlistWithResolvedIds,
  formatAllowlistMatchMeta,
  patchAllowlistUsersInConfigEntries,
  summarizeMapping,
} from "nodoassist/plugin-sdk/allow-from";
export {
  createReplyPrefixOptions,
  createTypingCallbacks,
} from "nodoassist/plugin-sdk/channel-outbound";
export { formatLocationText, toLocationContext } from "nodoassist/plugin-sdk/channel-inbound";
export { getAgentScopedMediaLocalRoots } from "nodoassist/plugin-sdk/agent-media-payload";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
export { logTypingFailure } from "nodoassist/plugin-sdk/channel-outbound";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "nodoassist/plugin-sdk/channel-targets";
