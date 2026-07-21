// Whatsapp plugin module implements channel actions behavior.
import { createActionGate } from "nodoassist/plugin-sdk/channel-actions";
import type { ChannelMessageActionName } from "nodoassist/plugin-sdk/channel-contract";
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

export { listWhatsAppAccountIds, resolveWhatsAppAccount } from "./accounts.js";
export { resolveWhatsAppReactionLevel } from "./reaction-level.js";
export { createActionGate, type ChannelMessageActionName, type NodoAssistConfig };
