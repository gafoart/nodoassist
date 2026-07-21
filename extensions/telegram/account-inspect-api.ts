// Telegram API module exposes the plugin public contract.
import type { NodoAssistConfig } from "./runtime-api.js";
import { inspectTelegramAccount } from "./src/account-inspect.js";

export function inspectTelegramReadOnlyAccount(cfg: NodoAssistConfig, accountId?: string | null) {
  return inspectTelegramAccount({ cfg, accountId });
}
