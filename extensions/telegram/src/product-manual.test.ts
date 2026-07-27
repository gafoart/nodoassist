// Telegram tests cover the product manual prompt contract.
import { describe, expect, it } from "vitest";
import {
  buildTelegramManualSystemPrompt,
  composeTelegramSystemPrompt,
  resolveNodoAssistManualUrl,
} from "./product-manual.js";

describe("product manual prompt", () => {
  it("resolves the manual URL with the bot username as tenant", () => {
    expect(resolveNodoAssistManualUrl("MiNodoBot")).toBe(
      "https://lab.thecreativecomputing.com/nodo-assist-manual?source=telegram_bot&tenant=MiNodoBot",
    );
  });

  it("strips a leading @ and falls back to the product tenant", () => {
    expect(resolveNodoAssistManualUrl("@MiNodoBot")).toContain("tenant=MiNodoBot");
    expect(resolveNodoAssistManualUrl(undefined)).toContain("tenant=nodoassist");
    expect(resolveNodoAssistManualUrl("  ")).toContain("tenant=nodoassist");
  });

  it("builds a prompt with the exact URL and the offer triggers", () => {
    const prompt = buildTelegramManualSystemPrompt("MiNodoBot");
    expect(prompt).toContain(
      "https://lab.thecreativecomputing.com/nodo-assist-manual?source=telegram_bot&tenant=MiNodoBot",
    );
    expect(prompt).toContain("enlace EXACTO");
    expect(prompt).toContain("primera vez");
    expect(prompt).toContain("dudas");
  });

  it("composes the always-on manual block with the optional scoped prompt", () => {
    expect(composeTelegramSystemPrompt("manual", "scoped")).toBe("manual\n\nscoped");
    expect(composeTelegramSystemPrompt("manual", undefined)).toBe("manual");
  });
});
