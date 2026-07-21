// Failure output tests cover CLI error formatting and failure summaries.
import { describe, expect, it } from "vitest";
import { formatCliFailureLines } from "./failure-output.js";

describe("formatCliFailureLines", () => {
  it("shows a concise reason and recovery commands by default", () => {
    const lines = formatCliFailureLines({
      title: "Could not start the CLI.",
      error: new Error("config file is invalid"),
      argv: ["node", "nodoassist", "status"],
      env: {},
    });

    expect(lines).toEqual([
      "[nodoassist] Could not start the CLI.",
      "[nodoassist] Reason: config file is invalid",
      "[nodoassist] Debug: set NODOASSIST_DEBUG=1 to include the stack trace.",
      "[nodoassist] Try: nodoassist doctor",
      "[nodoassist] Help: nodoassist --help",
    ]);
  });

  it("prints stack details when debug output is requested", () => {
    const lines = formatCliFailureLines({
      title: "The CLI command failed.",
      error: new Error("boom"),
      env: { NODOASSIST_DEBUG: "1" },
    });

    expect(lines.slice(0, 4)).toEqual([
      "[nodoassist] The CLI command failed.",
      "[nodoassist] Reason: boom",
      "[nodoassist] Stack:",
      "[nodoassist] Error: boom",
    ]);
    expect(lines.join("\n")).toContain("Error: boom");
  });
});
