// Private runtime barrel for the bundled Nextcloud Talk extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { AllowlistMatch } from "nodoassist/plugin-sdk/allow-from";
export type { ChannelGroupContext } from "nodoassist/plugin-sdk/channel-contract";
export { logInboundDrop } from "nodoassist/plugin-sdk/channel-inbound";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export type {
  BlockStreamingCoalesceConfig,
  DmConfig,
  DmPolicy,
  GroupPolicy,
  GroupToolPolicyConfig,
  NodoAssistConfig,
} from "nodoassist/plugin-sdk/config-contracts";
export {
  GROUP_POLICY_BLOCKED_LABEL,
  resolveAllowlistProviderRuntimeGroupPolicy,
  resolveDefaultGroupPolicy,
  warnMissingProviderGroupPolicyFallbackOnce,
} from "nodoassist/plugin-sdk/runtime-group-policy";
export { createChannelMessageReplyPipeline } from "nodoassist/plugin-sdk/channel-outbound";
export type { OutboundReplyPayload } from "nodoassist/plugin-sdk/reply-payload";
export { deliverFormattedTextWithAttachments } from "nodoassist/plugin-sdk/reply-payload";
export type { PluginRuntime } from "nodoassist/plugin-sdk/runtime-store";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export type { SecretInput } from "nodoassist/plugin-sdk/secret-input";
export { fetchWithSsrFGuard } from "nodoassist/plugin-sdk/ssrf-runtime";
export { setNextcloudTalkRuntime } from "./src/runtime.js";
