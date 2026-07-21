// Mattermost API module exposes the plugin public contract.
export type {
  BaseProbeResult,
  ChannelAccountSnapshot,
  ChannelDirectoryEntry,
  ChatType,
  HistoryEntry,
  NodoAssistConfig,
  NodoAssistPluginApi,
  ReplyPayload,
} from "nodoassist/plugin-sdk/core";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export { buildAgentMediaPayload } from "nodoassist/plugin-sdk/agent-media-payload";
export { resolveAllowlistMatchSimple } from "nodoassist/plugin-sdk/allow-from";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export { logTypingFailure } from "nodoassist/plugin-sdk/channel-feedback";
export {
  listSkillCommandsForAgents,
  resolveControlCommandGate,
} from "nodoassist/plugin-sdk/command-auth-native";
export { buildModelsProviderData } from "nodoassist/plugin-sdk/models-provider-runtime";
export { isDangerousNameMatchingEnabled } from "nodoassist/plugin-sdk/dangerous-name-runtime";
export {
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export { resolveChannelMediaMaxBytes } from "nodoassist/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
// Legacy map-helper exports stay for older plugin consumers. New message-turn
// code should use createChannelHistoryWindow.
export {
  DEFAULT_GROUP_HISTORY_LIMIT,
  createChannelHistoryWindow,
  buildInboundHistoryFromMap,
  buildPendingHistoryContextFromMap,
  recordPendingHistoryEntryIfEnabled,
} from "nodoassist/plugin-sdk/reply-history";
export { registerPluginHttpRoute } from "nodoassist/plugin-sdk/webhook-targets";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
} from "nodoassist/plugin-sdk/webhook-ingress";
export {
  isTrustedProxyAddress,
  parseStrictPositiveInteger,
  resolveClientIp,
} from "nodoassist/plugin-sdk/core";
export { parseTcpPort } from "nodoassist/plugin-sdk/number-runtime";
