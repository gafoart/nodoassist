// Private runtime barrel for the bundled Mattermost extension.
// Keep this barrel thin and generic-only.

export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelPlugin,
  ChatType,
  HistoryEntry,
  NodoAssistConfig,
  NodoAssistPluginApi,
  PluginRuntime,
} from "nodoassist/plugin-sdk/core";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export type { ReplyPayload } from "nodoassist/plugin-sdk/reply-runtime";
export type { ModelsProviderData } from "nodoassist/plugin-sdk/models-provider-runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmPolicy,
  GroupPolicy,
} from "nodoassist/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createDedupeCache,
  parseStrictPositiveInteger,
  resolveClientIp,
  isTrustedProxyAddress,
} from "nodoassist/plugin-sdk/core";
export { buildComputedAccountStatusSnapshot } from "nodoassist/plugin-sdk/channel-status";
export { createAccountStatusSink } from "nodoassist/plugin-sdk/channel-outbound";
export { buildAgentMediaPayload } from "nodoassist/plugin-sdk/agent-media-payload";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
  resolveStoredModelOverride,
} from "nodoassist/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "nodoassist/plugin-sdk/models-provider-runtime";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nodoassist/plugin-sdk/dangerous-name-runtime";
export { resolveStorePath } from "nodoassist/plugin-sdk/session-store-runtime";
export { formatInboundFromLabel } from "nodoassist/plugin-sdk/channel-inbound";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export { logTypingFailure } from "nodoassist/plugin-sdk/channel-feedback";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
export { rawDataToString } from "nodoassist/plugin-sdk/webhook-ingress";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildPendingHistoryContextFromMap,
  clearHistoryEntriesIfEnabled,
  recordPendingHistoryEntryIfEnabled,
} from "nodoassist/plugin-sdk/reply-history";
export { normalizeAccountId, resolveThreadSessionKeys } from "nodoassist/plugin-sdk/routing";
export { resolveAllowlistMatchSimple } from "nodoassist/plugin-sdk/allow-from";
export { registerPluginHttpRoute } from "nodoassist/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "nodoassist/plugin-sdk/webhook-ingress";
export {
  applyAccountNameToChannelSection,
  applySetupAccountConfigPatch,
  migrateBaseNameToDefaultAccount,
} from "nodoassist/plugin-sdk/setup";
export {
  getAgentScopedMediaLocalRoots,
  resolveChannelMediaMaxBytes,
} from "nodoassist/plugin-sdk/media-runtime";
export { normalizeProviderId } from "nodoassist/plugin-sdk/provider-model-shared";
export { setMattermostRuntime } from "./src/runtime.js";
