// Slack API module exposes the plugin public contract.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { inspectSlackAccount } from "./src/account-inspect.js";

export function inspectSlackReadOnlyAccount(cfg: NodoAssistConfig, accountId?: string | null) {
  return inspectSlackAccount({ cfg, accountId });
}
