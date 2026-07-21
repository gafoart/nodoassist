// Irc API module exposes the plugin public contract.
export { createAccountStatusSink } from "nodoassist/plugin-sdk/channel-outbound";
export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/channel-core";
export { PAIRING_APPROVED_MESSAGE } from "nodoassist/plugin-sdk/channel-status";
export { buildBaseChannelStatusSummary } from "nodoassist/plugin-sdk/status-helpers";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
