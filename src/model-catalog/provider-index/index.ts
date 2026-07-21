// Provider-index public facade for normalized provider discovery metadata.
export { loadNodoAssistProviderIndex } from "./load.js";
export { normalizeNodoAssistProviderIndex } from "./normalize.js";
export type {
  NodoAssistProviderIndex,
  NodoAssistProviderIndexPluginInstall,
  NodoAssistProviderIndexPlugin,
  NodoAssistProviderIndexProviderAuthChoice,
  NodoAssistProviderIndexProvider,
} from "./types.js";
