// Mistral provider module implements model/runtime integration.
import { buildManifestModelProviderConfig } from "nodoassist/plugin-sdk/provider-catalog-shared";
import type { ModelProviderConfig } from "nodoassist/plugin-sdk/provider-model-shared";
import manifest from "./nodoassist.plugin.json" with { type: "json" };

export function buildMistralProvider(): ModelProviderConfig {
  return buildManifestModelProviderConfig({
    providerId: "mistral",
    catalog: manifest.modelCatalog.providers.mistral,
  });
}
