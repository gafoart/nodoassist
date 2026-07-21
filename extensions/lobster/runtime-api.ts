// Lobster API module exposes the plugin public contract.
export { definePluginEntry } from "nodoassist/plugin-sdk/core";
export type {
  AnyAgentTool,
  NodoAssistPluginApi,
  NodoAssistPluginToolContext,
  NodoAssistPluginToolFactory,
} from "nodoassist/plugin-sdk/core";
export {
  applyWindowsSpawnProgramPolicy,
  materializeWindowsSpawnProgram,
  resolveWindowsSpawnProgramCandidate,
} from "nodoassist/plugin-sdk/windows-spawn";
