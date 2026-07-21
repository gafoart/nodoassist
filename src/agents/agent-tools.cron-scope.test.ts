/**
 * Tests cron-triggered tool assembly.
 * Ensures cron runs scope cron tool behavior to self-removal of the current
 * job only.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnyAgentTool } from "./tools/common.js";

const mocks = vi.hoisted(() => {
  const stubTool = (name: string) =>
    ({
      name,
      label: name,
      displaySummary: name,
      description: name,
      parameters: { type: "object", properties: {} },
      execute: vi.fn(),
    }) satisfies AnyAgentTool;

  return {
    createNodoAssistToolsOptions: vi.fn(),
    stubTool,
  };
});

vi.mock("./nodoassist-tools.js", () => ({
  createNodoAssistTools: (options: unknown) => {
    mocks.createNodoAssistToolsOptions(options);
    return [mocks.stubTool("cron")];
  },
}));

import "./test-helpers/fast-bash-tools.js";
import "./test-helpers/fast-coding-tools.js";
import { createNodoAssistCodingTools } from "./agent-tools.js";

function firstNodoAssistToolsOptions(): { cronSelfRemoveOnlyJobId?: string } | undefined {
  return mocks.createNodoAssistToolsOptions.mock.calls[0]?.[0] as
    | { cronSelfRemoveOnlyJobId?: string }
    | undefined;
}

describe("createNodoAssistCodingTools cron scope", () => {
  beforeEach(() => {
    mocks.createNodoAssistToolsOptions.mockClear();
  });

  it("scopes cron-triggered jobs to self-removal", () => {
    const tools = createNodoAssistCodingTools({
      trigger: "cron",
      jobId: "job-current",
    });

    expect(tools.map((tool) => tool.name)).toContain("cron");
    expect(firstNodoAssistToolsOptions()?.cronSelfRemoveOnlyJobId).toBe("job-current");
  });

  it("does not scope non-cron sessions", () => {
    createNodoAssistCodingTools({
      trigger: "user",
      jobId: "job-current",
    });

    expect(firstNodoAssistToolsOptions()?.cronSelfRemoveOnlyJobId).toBeUndefined();
  });
});
