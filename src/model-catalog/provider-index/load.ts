import { NODOASSIST_PROVIDER_INDEX } from "./nodoassist-provider-index.js";
// Provider-index loader normalizes bundled installable-provider metadata and falls back to an empty index.
import { normalizeNodoAssistProviderIndex } from "./normalize.js";
import type { NodoAssistProviderIndex } from "./types.js";

// Load the bundled provider index through the normalizer. Invalid generated or
// caller-supplied data falls back to an empty v1 index instead of leaking shape.
export function loadNodoAssistProviderIndex(
  source: unknown = NODOASSIST_PROVIDER_INDEX,
): NodoAssistProviderIndex {
  return normalizeNodoAssistProviderIndex(source) ?? { version: 1, providers: {} };
}
