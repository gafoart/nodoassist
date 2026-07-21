// Tests for the NodoAssist Telegram admin/client access contract.
import { describe, expect, it } from "vitest";
import {
  applyProductAccessDefaults,
  CLIENT_TOOL_DENY,
  PRODUCT_ADMIN_TELEGRAM_USER_ID,
  telegramAdminUserIds,
  telegramClientUserIds,
} from "./product-access.js";
import type { NodoAssistConfig } from "./types.nodoassist.js";

const ADMIN = PRODUCT_ADMIN_TELEGRAM_USER_ID;

describe("applyProductAccessDefaults", () => {
  it("always installs the product admin as command owner", () => {
    const cfg = applyProductAccessDefaults({});
    expect(cfg.commands?.ownerAllowFrom).toEqual([`telegram:${ADMIN}`]);
  });

  it("keeps configured owners and appends the product admin", () => {
    const cfg = applyProductAccessDefaults({
      commands: { ownerAllowFrom: ["discord:42"] },
    });
    expect(cfg.commands?.ownerAllowFrom).toEqual(["discord:42", `telegram:${ADMIN}`]);
  });

  it("does not duplicate an already-configured admin owner entry", () => {
    for (const entry of [`telegram:${ADMIN}`, ADMIN]) {
      const cfg = applyProductAccessDefaults({ commands: { ownerAllowFrom: [entry] } });
      expect(cfg.commands?.ownerAllowFrom).toEqual([entry]);
    }
  });

  it("allowlists the admin and defaults dmPolicy on a configured telegram channel", () => {
    const cfg = applyProductAccessDefaults({ channels: { telegram: { botToken: "x" } } });
    expect(cfg.channels?.telegram?.dmPolicy).toBe("allowlist");
    expect(cfg.channels?.telegram?.allowFrom).toEqual([ADMIN]);
  });

  it("keeps explicit dmPolicy and existing allowFrom entries", () => {
    const cfg = applyProductAccessDefaults({
      channels: { telegram: { dmPolicy: "pairing", allowFrom: [111] } },
    });
    expect(cfg.channels?.telegram?.dmPolicy).toBe("pairing");
    expect(cfg.channels?.telegram?.allowFrom).toEqual([111, ADMIN]);
  });

  it("does not append the admin to a wildcard allowFrom", () => {
    const cfg = applyProductAccessDefaults({
      channels: { telegram: { dmPolicy: "open", allowFrom: ["*"] } },
    });
    expect(cfg.channels?.telegram?.allowFrom).toEqual(["*"]);
  });

  it("leaves config untouched when telegram is not configured", () => {
    const cfg = applyProductAccessDefaults({});
    expect(cfg.channels?.telegram).toBeUndefined();
  });

  it("gates telegram commands to admins by default", () => {
    const cfg = applyProductAccessDefaults({});
    expect(cfg.commands?.allowFrom?.telegram).toEqual([ADMIN]);
  });

  it("merges the admin into an explicit telegram command allowlist", () => {
    const cfg = applyProductAccessDefaults({
      commands: { allowFrom: { telegram: ["555"] } },
    });
    expect(cfg.commands?.allowFrom?.telegram).toEqual(["555", ADMIN]);
  });

  it("does not add a global '*' command allowlist for other channels", () => {
    const cfg = applyProductAccessDefaults({});
    expect(cfg.commands?.allowFrom?.["*"]).toBeUndefined();
  });

  it("applies the client tool deny policy to allowlisted non-admin senders", () => {
    const cfg = applyProductAccessDefaults({
      channels: { telegram: { allowFrom: [ADMIN, "777", 888] } },
    });
    expect(cfg.tools?.toolsBySender?.["telegram:777"]).toEqual({ deny: [...CLIENT_TOOL_DENY] });
    expect(cfg.tools?.toolsBySender?.["telegram:888"]).toEqual({ deny: [...CLIENT_TOOL_DENY] });
    expect(cfg.tools?.toolsBySender?.[`telegram:${ADMIN}`]).toBeUndefined();
  });

  it("collects clients from account-level allowlists too", () => {
    const cfg = applyProductAccessDefaults({
      channels: { telegram: { accounts: { work: { allowFrom: ["999"] } } } },
    });
    expect(cfg.tools?.toolsBySender?.["telegram:999"]).toEqual({ deny: [...CLIENT_TOOL_DENY] });
  });

  it("lets explicit sender tool config override the client default", () => {
    const custom = { allow: ["*"] };
    const cfg = applyProductAccessDefaults({
      channels: { telegram: { allowFrom: ["777"] } },
      tools: { toolsBySender: { "telegram:777": custom } },
    });
    expect(cfg.tools?.toolsBySender?.["telegram:777"]).toEqual(custom);
  });

  it("treats extra numeric owner entries as admins, not clients", () => {
    const cfg: NodoAssistConfig = {
      commands: { ownerAllowFrom: ["telegram:123"] },
      channels: { telegram: { allowFrom: ["123", "777"] } },
    };
    expect([...telegramAdminUserIds(cfg)].toSorted()).toEqual(["123", ADMIN]);
    expect(telegramClientUserIds(cfg)).toEqual(["777"]);
    const applied = applyProductAccessDefaults(cfg);
    expect(applied.tools?.toolsBySender?.["telegram:123"]).toBeUndefined();
    expect(applied.commands?.allowFrom?.telegram).toEqual(["123", ADMIN]);
  });

  it("is idempotent", () => {
    const once = applyProductAccessDefaults({
      channels: { telegram: { allowFrom: ["777"] } },
    });
    const twice = applyProductAccessDefaults(once);
    expect(twice).toEqual(once);
  });
});
