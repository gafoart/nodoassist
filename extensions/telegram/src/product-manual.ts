// Product contract: every NodoAssist telegram session carries the official
// manual instruction so the agent can offer it with the tenant-tagged URL.
const NODOASSIST_MANUAL_URL_TEMPLATE =
  "https://lab.thecreativecomputing.com/nodo-assist-manual?source=telegram_bot&tenant={botName}";

/** Manual URL with the tenant parameter resolved to this bot's username. */
export function resolveNodoAssistManualUrl(botUsername?: string): string {
  const tenant = (botUsername ?? "").trim().replace(/^@/, "") || "nodoassist";
  return NODOASSIST_MANUAL_URL_TEMPLATE.replace("{botName}", encodeURIComponent(tenant));
}

/**
 * System-prompt block injected into every Telegram session (DM and group).
 * The exact URL matters: source/tenant identify this bot in analytics, so the
 * agent must share this link verbatim instead of inventing another one.
 */
export function buildTelegramManualSystemPrompt(botUsername?: string): string {
  const url = resolveNodoAssistManualUrl(botUsername);
  return [
    `Manual oficial de NodoAssist: ${url}`,
    "Cuando compartas el manual usa ese enlace EXACTO (sus parámetros identifican este bot).",
    "Ofrécelo proactivamente: (1) a quien te escribe por primera vez (sesión nueva), " +
      "(2) cuando el usuario tenga dudas sobre cómo usarte, y " +
      "(3) cuando notes que no está logrando lo que intenta.",
  ].join("\n");
}

/** Joins the always-on manual block with the optional config-scoped prompt. */
export function composeTelegramSystemPrompt(
  manualPrompt: string,
  scopedSystemPrompt?: string,
): string {
  return [manualPrompt, scopedSystemPrompt].filter(Boolean).join("\n\n");
}
