// Whatsapp plugin module implements doctor contract behavior.
import type { ChannelDoctorConfigMutation } from "nodoassist/plugin-sdk/channel-contract";
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { normalizeCompatibilityConfig as normalizeCompatibilityConfigImpl } from "./doctor.js";

export function normalizeCompatibilityConfig({
  cfg,
}: {
  cfg: NodoAssistConfig;
}): ChannelDoctorConfigMutation {
  return normalizeCompatibilityConfigImpl({ cfg });
}
