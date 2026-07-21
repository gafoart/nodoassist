// Mattermost API module exposes the plugin public contract.
export { createAccountStatusSink } from "nodoassist/plugin-sdk/channel-outbound";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/core";
export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/core";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
