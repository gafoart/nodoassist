import { createLazyRuntimeModule } from "nodoassist/plugin-sdk/lazy-runtime";
// Whatsapp API module exposes the plugin public contract.
export { getChatChannelMeta, type ChannelPlugin } from "nodoassist/plugin-sdk/core";
export { buildChannelConfigSchema, WhatsAppConfigSchema } from "../config-api.js";
export { DEFAULT_ACCOUNT_ID } from "nodoassist/plugin-sdk/account-id";
export {
  formatWhatsAppConfigAllowFromEntries,
  resolveWhatsAppConfigAllowFrom,
  resolveWhatsAppConfigDefaultTo,
} from "./config-accessors.js";
export {
  createActionGate,
  jsonResult,
  readReactionParams,
  readStringParam,
  ToolAuthorizationError,
} from "nodoassist/plugin-sdk/channel-actions";
export { normalizeE164 } from "nodoassist/plugin-sdk/account-resolution";
export type { DmPolicy, GroupPolicy } from "nodoassist/plugin-sdk/config-contracts";
import type { NodoAssistConfig as RuntimeNodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

export { type ChannelMessageActionName } from "nodoassist/plugin-sdk/channel-contract";
export { loadOutboundMediaFromUrl } from "./outbound-media.runtime.js";
export {
  resolveWhatsAppGroupRequireMention,
  resolveWhatsAppGroupToolPolicy,
} from "./group-policy.js";
export {
  resolveWhatsAppGroupIntroHint,
  resolveWhatsAppMentionStripRegexes,
} from "./group-intro.js";
export { createWhatsAppOutboundBase } from "./outbound-base.js";
export {
  isWhatsAppGroupJid,
  isWhatsAppUserTarget,
  looksLikeWhatsAppTargetId,
  normalizeWhatsAppAllowFromEntries,
  normalizeWhatsAppMessagingTarget,
  normalizeWhatsAppTarget,
} from "./normalize-target.js";
export { resolveWhatsAppOutboundTarget } from "./resolve-outbound-target.js";
export { resolveWhatsAppReactionLevel } from "./reaction-level.js";

export type NodoAssistConfig = RuntimeNodoAssistConfig;
export type { WhatsAppAccountConfig } from "./account-types.js";

type MonitorWebChannel = typeof import("./channel.runtime.js").monitorWebChannel;

const loadChannelRuntime = createLazyRuntimeModule(() => import("./channel.runtime.js"));

export async function monitorWebChannel(
  ...args: Parameters<MonitorWebChannel>
): ReturnType<MonitorWebChannel> {
  const { monitorWebChannel: monitorWebChannelLocal } = await loadChannelRuntime();
  return await monitorWebChannelLocal(...args);
}
