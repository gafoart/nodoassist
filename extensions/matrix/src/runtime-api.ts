// Matrix API module exposes the plugin public contract.
export {
  DEFAULT_ACCOUNT_ID,
  normalizeAccountId,
  normalizeOptionalAccountId,
} from "nodoassist/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringArrayParam,
  readStringParam,
  ToolAuthorizationError,
} from "nodoassist/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "nodoassist/plugin-sdk/channel-config-primitives";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/channel-core";
export type {
  BaseProbeResult,
  ChannelDirectoryEntry,
  ChannelGroupContext,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMessageActionName,
  ChannelMessageToolDiscovery,
  ChannelOutboundAdapter,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelToolSend,
} from "nodoassist/plugin-sdk/channel-contract";
export {
  formatLocationText,
  toLocationContext,
  type NormalizedLocation,
} from "nodoassist/plugin-sdk/channel-inbound";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
export { logTypingFailure } from "nodoassist/plugin-sdk/channel-outbound";
export { resolveAckReaction } from "nodoassist/plugin-sdk/channel-feedback";
export type { ChannelSetupInput } from "nodoassist/plugin-sdk/setup";
export type {
  NodoAssistConfig,
  ContextVisibilityMode,
  DmPolicy,
  GroupPolicy,
} from "nodoassist/plugin-sdk/config-contracts";
export type { GroupToolPolicyConfig } from "nodoassist/plugin-sdk/config-contracts";
export type { WizardPrompter } from "nodoassist/plugin-sdk/setup";
export type { SecretInput } from "nodoassist/plugin-sdk/secret-input";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export {
  addWildcardAllowFrom,
  formatDocsLink,
  hasConfiguredSecretInput,
  mergeAllowFromEntries,
  moveSingleAccountChannelSectionToDefaultAccount,
  promptAccountId,
  promptChannelAccessConfig,
  splitSetupEntries,
} from "nodoassist/plugin-sdk/setup";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export {
  assertHttpUrlTargetsPrivateNetwork,
  closeDispatcher,
  createPinnedDispatcher,
  isPrivateOrLoopbackHost,
  resolvePinnedHostnameWithPolicy,
  ssrfPolicyFromDangerouslyAllowPrivateNetwork,
  ssrfPolicyFromAllowPrivateNetwork,
  type LookupFn,
  type SsrFPolicy,
} from "nodoassist/plugin-sdk/ssrf-runtime";
export { dispatchReplyFromConfigWithSettledDispatcher } from "nodoassist/plugin-sdk/channel-inbound";
export {
  ensureConfiguredAcpBindingReady,
  resolveConfiguredAcpBindingRecord,
} from "nodoassist/plugin-sdk/acp-binding-runtime";
export {
  buildProbeChannelStatusSummary,
  collectStatusIssuesFromLastError,
  PAIRING_APPROVED_MESSAGE,
} from "nodoassist/plugin-sdk/channel-status";
export {
  getSessionBindingService,
  resolveThreadBindingIdleTimeoutMsForChannel,
  resolveThreadBindingMaxAgeMsForChannel,
} from "nodoassist/plugin-sdk/conversation-runtime";
export { resolveOutboundSendDep } from "nodoassist/plugin-sdk/channel-outbound";
export { resolveAgentIdFromSessionKey } from "nodoassist/plugin-sdk/routing";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
export { normalizePollInput, type PollInput } from "nodoassist/plugin-sdk/poll-runtime";
export { writeJsonFileAtomically } from "nodoassist/plugin-sdk/json-store";
export {
  buildChannelKeyCandidates,
  resolveChannelEntryMatch,
} from "nodoassist/plugin-sdk/channel-targets";
export { buildTimeoutAbortSignal } from "./matrix/sdk/timeout-abort-signal.js";
export { formatZonedTimestamp } from "nodoassist/plugin-sdk/time-runtime";
export type { PluginRuntime, RuntimeLogger } from "nodoassist/plugin-sdk/plugin-runtime";
export type { ReplyPayload } from "nodoassist/plugin-sdk/reply-runtime";
// resolveMatrixAccountStringValues already comes from the Matrix API barrel.
// Re-exporting auth-precedence here makes TS source loaders define the export twice.
