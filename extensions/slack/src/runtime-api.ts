// Slack API module exposes the plugin public contract.
export {
  buildComputedAccountStatusSnapshot,
  PAIRING_APPROVED_MESSAGE,
  projectCredentialSnapshotFields,
  resolveConfiguredFromRequiredCredentialStatuses,
} from "nodoassist/plugin-sdk/channel-status";
export { buildChannelConfigSchema, SlackConfigSchema } from "../config-api.js";
export type { ChannelMessageActionContext } from "nodoassist/plugin-sdk/channel-contract";
export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export type {
  ChannelPlugin,
  NodoAssistPluginApi,
  PluginRuntime,
} from "nodoassist/plugin-sdk/channel-plugin-common";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export type { SlackAccountConfig } from "nodoassist/plugin-sdk/config-contracts";
export {
  emptyPluginConfigSchema,
  formatPairingApproveHint,
} from "nodoassist/plugin-sdk/channel-plugin-common";
export { loadOutboundMediaFromUrl } from "nodoassist/plugin-sdk/outbound-media";
export { looksLikeSlackTargetId, normalizeSlackMessagingTarget } from "./target-parsing.js";
export { getChatChannelMeta } from "./channel-api.js";
export {
  createActionGate,
  imageResultFromFile,
  jsonResult,
  readNumberParam,
  readPositiveIntegerParam,
  readReactionParams,
  readStringParam,
  withNormalizedTimestamp,
} from "nodoassist/plugin-sdk/channel-actions";
