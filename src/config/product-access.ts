// NodoAssist product access contract: Telegram allowlist with admin/client levels.
import type { NodoAssistConfig } from "./types.nodoassist.js";
import type { GroupToolPolicyConfig } from "./types.tools.js";

/**
 * Product contract: the product owner's Telegram account is always an admin.
 * Config may add more admins (commands.ownerAllowFrom) and clients
 * (channels.telegram.allowFrom), but can never remove or demote this account.
 */
export const PRODUCT_ADMIN_TELEGRAM_USER_ID = "424724340";
const PRODUCT_ADMIN_OWNER_ENTRY = `telegram:${PRODUCT_ADMIN_TELEGRAM_USER_ID}`;

/**
 * Tool groups denied to client-level Telegram senders (allowlisted, non-admin).
 * Host-control surfaces stay admin-only; chat, web, media, memory and
 * messaging tools remain available so clients get a useful assistant.
 */
export const CLIENT_TOOL_DENY: readonly string[] = [
  "group:runtime",
  "group:fs",
  "group:automation",
  "group:sessions",
  "group:agents",
  "group:nodes",
];

function normalizedEntries(list: Array<string | number> | undefined): string[] {
  return (list ?? []).map((entry) => String(entry).trim()).filter(Boolean);
}

function isNumericId(value: string): boolean {
  return /^\d+$/.test(value);
}

/** Admins = the product admin plus numeric Telegram ids in commands.ownerAllowFrom. */
export function telegramAdminUserIds(cfg: NodoAssistConfig): Set<string> {
  const admins = new Set([PRODUCT_ADMIN_TELEGRAM_USER_ID]);
  for (const entry of normalizedEntries(cfg.commands?.ownerAllowFrom)) {
    const id = entry.toLowerCase().startsWith("telegram:")
      ? entry.slice("telegram:".length)
      : entry;
    // Unprefixed numeric owner entries are channel-agnostic and count on Telegram too.
    if (isNumericId(id)) {
      admins.add(id);
    }
  }
  return admins;
}

/** Clients = allowlisted numeric Telegram sender ids (base + accounts) minus admins. */
export function telegramClientUserIds(cfg: NodoAssistConfig): string[] {
  const telegram = cfg.channels?.telegram;
  if (!telegram) {
    return [];
  }
  const admins = telegramAdminUserIds(cfg);
  const allowlists: Array<Array<string | number> | undefined> = [telegram.allowFrom];
  for (const account of Object.values(telegram.accounts ?? {})) {
    allowlists.push(account.allowFrom);
  }
  const clients = new Set<string>();
  for (const list of allowlists) {
    for (const entry of normalizedEntries(list)) {
      if (isNumericId(entry) && !admins.has(entry)) {
        clients.add(entry);
      }
    }
  }
  return [...clients].toSorted();
}

function withProductOwner(cfg: NodoAssistConfig): NodoAssistConfig {
  const owners = normalizedEntries(cfg.commands?.ownerAllowFrom);
  const hasAdmin = owners.some(
    (entry) => entry === PRODUCT_ADMIN_OWNER_ENTRY || entry === PRODUCT_ADMIN_TELEGRAM_USER_ID,
  );
  if (hasAdmin) {
    return cfg;
  }
  return {
    ...cfg,
    commands: {
      ...cfg.commands,
      ownerAllowFrom: [...(cfg.commands?.ownerAllowFrom ?? []), PRODUCT_ADMIN_OWNER_ENTRY],
    },
  };
}

function withTelegramAccessDefaults(cfg: NodoAssistConfig): NodoAssistConfig {
  const telegram = cfg.channels?.telegram;
  if (!telegram) {
    return cfg;
  }
  const allowFrom = normalizedEntries(telegram.allowFrom);
  const needsAdmin =
    !allowFrom.includes(PRODUCT_ADMIN_TELEGRAM_USER_ID) && !allowFrom.includes("*");
  const needsPolicy = telegram.dmPolicy === undefined;
  if (!needsAdmin && !needsPolicy) {
    return cfg;
  }
  return {
    ...cfg,
    channels: {
      ...cfg.channels,
      telegram: {
        ...telegram,
        ...(needsPolicy ? { dmPolicy: "allowlist" as const } : {}),
        ...(needsAdmin
          ? { allowFrom: [...(telegram.allowFrom ?? []), PRODUCT_ADMIN_TELEGRAM_USER_ID] }
          : {}),
      },
    },
  };
}

function withTelegramCommandGate(cfg: NodoAssistConfig): NodoAssistConfig {
  // Client level has no slash/native commands: Telegram command auth defaults
  // to admins only. Config may add ids to commands.allowFrom.telegram.
  const configured = cfg.commands?.allowFrom?.telegram;
  const admins = [...telegramAdminUserIds(cfg)].toSorted();
  const merged = configured ? normalizedEntries(configured) : [];
  const missing = admins.filter((id) => !merged.includes(id));
  if (configured && missing.length === 0) {
    return cfg;
  }
  return {
    ...cfg,
    commands: {
      ...cfg.commands,
      allowFrom: {
        ...cfg.commands?.allowFrom,
        telegram: [...(configured ?? []), ...missing],
      },
    },
  };
}

function withClientToolPolicy(cfg: NodoAssistConfig): NodoAssistConfig {
  const clients = telegramClientUserIds(cfg);
  if (clients.length === 0) {
    return cfg;
  }
  const existing = cfg.tools?.toolsBySender ?? {};
  const additions: Record<string, GroupToolPolicyConfig> = {};
  for (const id of clients) {
    const key = `telegram:${id}`;
    // Explicit config for a client wins over the product default policy.
    if (!(key in existing) && !(id in existing)) {
      additions[key] = { deny: [...CLIENT_TOOL_DENY] };
    }
  }
  if (Object.keys(additions).length === 0) {
    return cfg;
  }
  return {
    ...cfg,
    tools: {
      ...cfg.tools,
      toolsBySender: { ...additions, ...existing },
    },
  };
}

/**
 * Applies the NodoAssist Telegram access model at config materialization:
 * - the product admin is always an owner and always allowlisted;
 * - Telegram DMs default to allowlist policy;
 * - slash/native commands on Telegram default to admins only;
 * - allowlisted non-admin senders ("clients") chat with host-control tool
 *   groups denied unless config overrides their sender policy.
 * Runtime-only: these defaults are never written back to the config file.
 */
export function applyProductAccessDefaults(cfg: NodoAssistConfig): NodoAssistConfig {
  let next = withProductOwner(cfg);
  next = withTelegramAccessDefaults(next);
  next = withTelegramCommandGate(next);
  next = withClientToolPolicy(next);
  return next;
}
