// Private runtime barrel for the bundled Feishu extension.
// Keep this barrel thin and generic-only.

export type {
  AllowlistMatch,
  AnyAgentTool,
  BaseProbeResult,
  ChannelGroupContext,
  ChannelMessageActionName,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelPlugin,
  HistoryEntry,
  NodoAssistConfig,
  NodoAssistPluginApi,
  OutboundIdentity,
  PluginRuntime,
  ReplyPayload,
} from "nodoassist/plugin-sdk/core";
export type { NodoAssistConfig as ClawdbotConfig } from "nodoassist/plugin-sdk/core";
export type RuntimeEnv = {
  log: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  exit: (code: number) => void;
};
export type { GroupToolPolicyConfig } from "nodoassist/plugin-sdk/config-contracts";
export {
  DEFAULT_ACCOUNT_ID,
  buildChannelConfigSchema,
  createActionGate,
  createDedupeCache,
} from "nodoassist/plugin-sdk/core";
export {
  PAIRING_APPROVED_MESSAGE,
  buildProbeChannelStatusSummary,
  createDefaultChannelRuntimeState,
} from "nodoassist/plugin-sdk/channel-status";
export { buildAgentMediaPayload } from "nodoassist/plugin-sdk/agent-media-payload";
export { createChannelPairingController } from "nodoassist/plugin-sdk/channel-pairing";
export { createReplyPrefixContext } from "nodoassist/plugin-sdk/channel-outbound";
export {
  evaluateSupplementalContextVisibility,
  filterSupplementalContextItems,
  resolveChannelContextVisibilityMode,
} from "nodoassist/plugin-sdk/context-visibility-runtime";
export { getSessionEntry } from "nodoassist/plugin-sdk/session-store-runtime";
export { readJsonFileWithFallback } from "nodoassist/plugin-sdk/json-store";
export { normalizeAgentId } from "nodoassist/plugin-sdk/routing";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";
export {
  isRequestBodyLimitError,
  readRequestBodyWithLimit,
  requestBodyErrorToText,
} from "nodoassist/plugin-sdk/webhook-ingress";
export { setFeishuRuntime } from "./src/runtime.js";
