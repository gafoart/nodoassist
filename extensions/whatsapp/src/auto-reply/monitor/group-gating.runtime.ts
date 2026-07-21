// Whatsapp plugin module implements group gating behavior.
export {
  implicitMentionKindWhen,
  resolveInboundMentionDecision,
} from "nodoassist/plugin-sdk/channel-mention-gating";
export { hasControlCommand } from "nodoassist/plugin-sdk/command-detection";
export { createChannelHistoryWindow } from "nodoassist/plugin-sdk/reply-history";
export { parseActivationCommand } from "nodoassist/plugin-sdk/group-activation";
export { normalizeE164 } from "../../text-runtime.js";
