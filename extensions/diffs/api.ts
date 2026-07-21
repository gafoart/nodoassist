// Diffs API module exposes the plugin public contract.
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export {
  definePluginEntry,
  type AnyAgentTool,
  type NodoAssistPluginApi,
  type NodoAssistPluginConfigSchema,
  type NodoAssistPluginToolContext,
  type PluginLogger,
} from "nodoassist/plugin-sdk/plugin-entry";
export { resolvePreferredNodoAssistTmpDir } from "nodoassist/plugin-sdk/temp-path";
