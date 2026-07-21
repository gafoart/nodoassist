// Discord API module exposes the plugin public contract.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { inspectDiscordAccount } from "./src/account-inspect.js";

export function inspectDiscordReadOnlyAccount(cfg: NodoAssistConfig, accountId?: string | null) {
  return inspectDiscordAccount({ cfg, accountId });
}
