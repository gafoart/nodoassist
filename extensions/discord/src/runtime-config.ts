// Discord helper module supports runtime config behavior.
import {
  getRuntimeConfigSnapshot,
  getRuntimeConfigSourceSnapshot,
  selectApplicableRuntimeConfig,
} from "nodoassist/plugin-sdk/runtime-config-snapshot";
import type { NodoAssistConfig } from "./runtime-api.js";

export function selectDiscordRuntimeConfig(inputConfig: NodoAssistConfig): NodoAssistConfig {
  return (
    selectApplicableRuntimeConfig({
      inputConfig,
      runtimeConfig: getRuntimeConfigSnapshot(),
      runtimeSourceConfig: getRuntimeConfigSourceSnapshot(),
    }) ?? inputConfig
  );
}
