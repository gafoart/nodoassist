// Feishu API module exposes the plugin public contract.
export type {
  ChannelMessageActionName,
  ChannelMeta,
  ChannelPlugin,
  ClawdbotConfig,
} from "../runtime-api.js";

export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-resolution";
export { createActionGate } from "nodoassist/plugin-sdk/channel-actions";
export { buildChannelConfigSchema } from "nodoassist/plugin-sdk/channel-config-primitives";
export {
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "nodoassist/plugin-sdk/status-helpers";
export { PAIRING_APPROVED_MESSAGE } from "nodoassist/plugin-sdk/channel-status";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
