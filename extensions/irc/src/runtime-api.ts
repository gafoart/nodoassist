// Private runtime barrel for the bundled IRC extension.
// Keep this barrel thin and generic-only.

export type { BaseProbeResult } from "nodoassist/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/channel-core";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export type { PluginRuntime } from "nodoassist/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyBySenderConfig,
  GroupToolPolicyConfig,
  MarkdownConfig,
} from "nodoassist/plugin-sdk/config-contracts";
export type { OutboundReplyPayload } from "nodoassist/plugin-sdk/reply-payload";
export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export { buildChannelConfigSchema } from "nodoassist/plugin-sdk/channel-config-primitives";
export {
  PAIRING_APPROVED_MESSAGE,
  buildBaseChannelStatusSummary,
} from "nodoassist/plugin-sdk/channel-status";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { createAccountStatusSink } from "nodoassist/plugin-sdk/channel-outbound";
export { resolveControlCommandGate } from "nodoassist/plugin-sdk/command-auth-native";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
export {
  deliverFormattedTextWithAttachments,
  formatTextWithAttachmentLinks,
  resolveOutboundMediaUrls,
} from "nodoassist/plugin-sdk/reply-payload";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export { isDangerousNameMatchingEnabled } from "nodoassist/plugin-sdk/dangerous-name-runtime";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
