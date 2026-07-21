// Opencode Go setup module handles plugin onboarding behavior.
import {
  applyAgentDefaultModelPrimary,
  type NodoAssistConfig,
} from "nodoassist/plugin-sdk/provider-onboard";

export const OPENCODE_GO_DEFAULT_MODEL_REF = "opencode-go/kimi-k2.6";

export function applyOpencodeGoProviderConfig(cfg: NodoAssistConfig): NodoAssistConfig {
  return cfg;
}

export function applyOpencodeGoConfig(cfg: NodoAssistConfig): NodoAssistConfig {
  return applyAgentDefaultModelPrimary(
    applyOpencodeGoProviderConfig(cfg),
    OPENCODE_GO_DEFAULT_MODEL_REF,
  );
}
