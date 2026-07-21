// Nostr API module exposes the plugin public contract.
export {
  buildChannelConfigSchema,
  DEFAULT_ACCOUNT_ID,
  formatPairingApproveHint,
  type ChannelPlugin,
} from "nodoassist/plugin-sdk/channel-plugin-common";
export type { ChannelOutboundAdapter } from "nodoassist/plugin-sdk/channel-contract";
export {
  collectStatusIssuesFromLastError,
  createDefaultChannelRuntimeState,
} from "nodoassist/plugin-sdk/status-helpers";
