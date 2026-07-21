// Private runtime barrel for the bundled Google Chat extension.
// Keep this barrel thin and avoid broad plugin-sdk surfaces during bootstrap.

export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export {
  createActionGate,
  jsonResult,
  readNumberParam,
  readReactionParams,
  readStringParam,
} from "nodoassist/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "nodoassist/plugin-sdk/channel-config-primitives";
export type {
  ChannelMessageActionAdapter,
  ChannelMessageActionName,
  ChannelStatusIssue,
} from "nodoassist/plugin-sdk/channel-contract";
export { missingTargetError } from "nodoassist/plugin-sdk/channel-feedback";
export {
  createAccountStatusSink,
  runPassiveAccountLifecycle,
} from "nodoassist/plugin-sdk/channel-outbound";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export { PAIRING_APPROVED_MESSAGE } from "nodoassist/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export { GoogleChatConfigSchema } from "nodoassist/plugin-sdk/bundled-channel-config-schema";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nodoassist/plugin-sdk/dangerous-name-runtime";
export {
  readRemoteMediaBuffer,
  resolveChannelMediaMaxBytes,
} from "nodoassist/plugin-sdk/media-runtime";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
export type { PluginRuntime } from "nodoassist/plugin-sdk/runtime-store";
export { fetchWithSsrFGuard } from "nodoassist/plugin-sdk/ssrf-runtime";
export type {
  GoogleChatAccountConfig,
  GoogleChatConfig,
} from "nodoassist/plugin-sdk/config-contracts";
export { extractToolSend } from "nodoassist/plugin-sdk/tool-send";
export { resolveInboundMentionDecision } from "nodoassist/plugin-sdk/channel-inbound";
export { resolveInboundRouteEnvelopeBuilderWithRuntime } from "nodoassist/plugin-sdk/inbound-envelope";
export { resolveWebhookPath } from "nodoassist/plugin-sdk/webhook-ingress";
export {
  registerWebhookTargetWithPluginRoute,
  resolveWebhookTargetWithAuthOrReject,
  withResolvedWebhookRequestPipeline,
} from "nodoassist/plugin-sdk/webhook-targets";
export {
  createWebhookInFlightLimiter,
  readJsonWebhookBodyOrReject,
  type WebhookInFlightLimiter,
} from "nodoassist/plugin-sdk/webhook-request-guards";
export { setGoogleChatRuntime } from "./src/runtime.js";
