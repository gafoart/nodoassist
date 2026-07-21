// Whatsapp plugin module implements account types behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

export type WhatsAppAccountConfig = NonNullable<
  NonNullable<NonNullable<NodoAssistConfig["channels"]>["whatsapp"]>["accounts"]
>[string];
