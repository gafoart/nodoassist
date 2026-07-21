// Imessage plugin module implements account types behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

export type IMessageAccountConfig = Omit<
  NonNullable<NonNullable<NodoAssistConfig["channels"]>["imessage"]>,
  "accounts" | "defaultAccount"
>;
