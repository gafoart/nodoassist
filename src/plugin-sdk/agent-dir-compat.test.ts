/**
 * Tests agent directory compatibility helpers.
 */
import { describe, expect, it } from "vitest";
import { resolveNodoAssistAgentDir } from "./agent-dir-compat.js";

describe("resolveNodoAssistAgentDir", () => {
  it("keeps the shipped Pi env alias for deprecated plugin SDK callers", () => {
    expect(
      resolveNodoAssistAgentDir({
        PI_CODING_AGENT_DIR: "/tmp/nodoassist-legacy-agent",
      }),
    ).toBe("/tmp/nodoassist-legacy-agent");
  });

  it("prefers the NodoAssist env override over the deprecated Pi alias", () => {
    expect(
      resolveNodoAssistAgentDir({
        NODOASSIST_AGENT_DIR: "/tmp/nodoassist-agent",
        PI_CODING_AGENT_DIR: "/tmp/nodoassist-legacy-agent",
      }),
    ).toBe("/tmp/nodoassist-agent");
  });
});
