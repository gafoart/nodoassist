// Tests reply profiler flag detection and timing tracker output.
import { describe, expect, it, vi } from "vitest";
import type { NodoAssistConfig } from "../../config/types.nodoassist.js";
import { createReplyTimingTracker, isReplyProfilerEnabled } from "./reply-timing-tracker.js";

describe("isReplyProfilerEnabled", () => {
  it("matches global and reply profiler diagnostic flags", () => {
    const cfg = { diagnostics: { flags: ["reply.profiler"] } } as NodoAssistConfig;
    expect(isReplyProfilerEnabled({ config: cfg, env: {} as NodeJS.ProcessEnv })).toBe(true);
    expect(
      isReplyProfilerEnabled({
        env: { NODOASSIST_DIAGNOSTICS: "profiler" } as NodeJS.ProcessEnv,
      }),
    ).toBe(true);
  });
});

describe("createReplyTimingTracker", () => {
  it("is a pass-through tracker unless the profiler flag is enabled", async () => {
    const warn = vi.fn();
    const tracker = createReplyTimingTracker({ log: { warn } });

    expect(tracker.measureSync("sync", () => 42)).toBe(42);
    await expect(tracker.measure("async", async () => "ok")).resolves.toBe("ok");
    tracker.logIfSlow({ message: "reply timings" });

    expect(warn).not.toHaveBeenCalled();
  });

  it("records and logs spans when the profiler flag is enabled", () => {
    const warn = vi.fn();
    const tracker = createReplyTimingTracker({
      log: { warn },
      env: { NODOASSIST_DIAGNOSTICS: "reply.profiler" } as NodeJS.ProcessEnv,
      totalWarnMs: 0,
      stageWarnMs: 0,
    });

    expect(tracker.measureSync("sync", () => 7)).toBe(7);
    tracker.logIfSlow({ message: "reply timings", outcome: "completed" });

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toContain("stages=sync:");
    expect(warn.mock.calls[0]?.[1]).toMatchObject({
      outcome: "completed",
      spans: [expect.objectContaining({ name: "sync" })],
    });
  });
});
