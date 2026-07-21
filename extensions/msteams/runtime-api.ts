// Private runtime barrel for the bundled Microsoft Teams extension.
// Keep this barrel thin and aligned with the local extension surface.

export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export type { AllowlistMatch } from "nodoassist/plugin-sdk/allow-from";
export {
  mergeAllowlist,
  resolveAllowlistMatchSimple,
  summarizeMapping,
} from "nodoassist/plugin-sdk/allow-from";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelOutboundAdapter,
} from "nodoassist/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/channel-core";
export { logTypingFailure } from "nodoassist/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { resolveToolsBySender } from "nodoassist/plugin-sdk/channel-policy";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "nodoassist/plugin-sdk/channel-status";
export {
  buildChannelKeyCandidates,
  normalizeChannelSlug,
  resolveChannelEntryMatchWithFallback,
  resolveNestedAllowlistDecision,
} from "nodoassist/plugin-sdk/channel-targets";
export type {
  GroupPolicy,
  GroupToolPolicyConfig,
  MSTeamsChannelConfig,
  MSTeamsCloudName,
  MSTeamsConfig,
  MSTeamsReplyStyle,
  MSTeamsTeamConfig,
  MarkdownTableMode,
  NodoAssistConfig,
} from "nodoassist/plugin-sdk/config-contracts";
export { isDangerousNameMatchingEnabled } from "nodoassist/plugin-sdk/dangerous-name-runtime";
export { resolveDefaultGroupPolicy } from "nodoassist/plugin-sdk/runtime-group-policy";
export { withFileLock } from "nodoassist/plugin-sdk/file-lock";
export { keepHttpServerTaskAlive } from "nodoassist/plugin-sdk/channel-outbound";
export {
  detectMime,
  extensionForMime,
  extractOriginalFilename,
  getFileExtension,
  resolveChannelMediaMaxBytes,
} from "nodoassist/plugin-sdk/media-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "nodoassist/plugin-sdk/channel-inbound";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
export { buildMediaPayload } from "nodoassist/plugin-sdk/reply-payload";
export type { ReplyPayload } from "nodoassist/plugin-sdk/reply-payload";
export type { PluginRuntime } from "nodoassist/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export type { SsrFPolicy } from "nodoassist/plugin-sdk/ssrf-runtime";
export { fetchWithSsrFGuard } from "nodoassist/plugin-sdk/ssrf-runtime";
export { normalizeStringEntries } from "nodoassist/plugin-sdk/string-normalization-runtime";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
export { DEFAULT_WEBHOOK_MAX_BODY_BYTES } from "nodoassist/plugin-sdk/webhook-ingress";
export { setMSTeamsRuntime } from "./src/runtime.js";
