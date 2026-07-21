// Gateway model-pricing config helper.
// Resolves whether cost/pricing metadata should be available to Gateway surfaces.
import type { NodoAssistConfig } from "../config/types.nodoassist.js";

/** Returns whether gateway model pricing/cost metadata should be shown. */
export function isGatewayModelPricingEnabled(config: NodoAssistConfig): boolean {
  return config.models?.pricing?.enabled !== false;
}
