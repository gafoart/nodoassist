// Signal plugin module implements account types behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

export type SignalAccountConfig = Omit<
  Exclude<NonNullable<NodoAssistConfig["channels"]>["signal"], undefined>,
  "accounts"
>;
