// Memory Core plugin module implements cli.host behavior.
export {
  colorize,
  defaultRuntime,
  formatErrorMessage,
  isRich,
  resolveCommandSecretRefsViaGateway,
  setVerbose,
  shortenHomeInString,
  shortenHomePath,
  theme,
  withManager,
  withProgress,
  withProgressTotals,
} from "nodoassist/plugin-sdk/memory-core-host-runtime-cli";
export {
  getRuntimeConfig,
  resolveDefaultAgentId,
  resolveSessionTranscriptsDirForAgent,
  resolveStateDir,
  type NodoAssistConfig,
} from "nodoassist/plugin-sdk/memory-core-host-runtime-core";
export {
  listMemoryFiles,
  normalizeExtraMemoryPaths,
} from "nodoassist/plugin-sdk/memory-core-host-runtime-files";
export { getMemorySearchManager } from "./memory/index.js";
