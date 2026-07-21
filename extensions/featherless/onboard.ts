// Featherless onboarding applies the curated model catalog and default.
import {
  createModelCatalogPresetAppliers,
  type NodoAssistConfig,
} from "nodoassist/plugin-sdk/provider-onboard";
import {
  buildFeatherlessCatalogModels,
  FEATHERLESS_BASE_URL,
  FEATHERLESS_DEFAULT_MODEL_REF,
} from "./models.js";

export { FEATHERLESS_DEFAULT_MODEL_REF } from "./models.js";

const featherlessPresetAppliers = createModelCatalogPresetAppliers({
  primaryModelRef: FEATHERLESS_DEFAULT_MODEL_REF,
  resolveParams: (_cfg: NodoAssistConfig) => ({
    providerId: "featherless",
    api: "openai-completions",
    baseUrl: FEATHERLESS_BASE_URL,
    catalogModels: buildFeatherlessCatalogModels(),
    aliases: [{ modelRef: FEATHERLESS_DEFAULT_MODEL_REF, alias: "Qwen3 32B" }],
  }),
});

export function applyFeatherlessConfig(cfg: NodoAssistConfig): NodoAssistConfig {
  return featherlessPresetAppliers.applyConfig(cfg);
}
