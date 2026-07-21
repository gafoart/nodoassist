// Tavily helper module supports tavily tool config behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import type { NodoAssistPluginToolContext } from "nodoassist/plugin-sdk/plugin-entry";
import type { NodoAssistPluginApi } from "nodoassist/plugin-sdk/plugin-runtime";

export type TavilyToolConfigContext = Pick<
  NodoAssistPluginToolContext,
  "config" | "runtimeConfig" | "getRuntimeConfig"
>;

export function resolveTavilyToolConfig(
  api: NodoAssistPluginApi,
  ctx?: TavilyToolConfigContext,
): NodoAssistConfig {
  return ctx?.getRuntimeConfig?.() ?? ctx?.runtimeConfig ?? ctx?.config ?? api.config;
}
