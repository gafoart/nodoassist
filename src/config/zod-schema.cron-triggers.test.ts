import { describe, expect, it } from "vitest";
import { NodoAssistSchema } from "./zod-schema.js";

describe("NodoAssistSchema cron triggers", () => {
  it("accepts the strict trigger gate and interval floor", () => {
    expect(
      NodoAssistSchema.parse({ cron: { triggers: { enabled: true, minIntervalMs: 45_000 } } }).cron
        ?.triggers,
    ).toEqual({ enabled: true, minIntervalMs: 45_000 });
  });

  it("rejects invalid and unknown trigger settings", () => {
    expect(NodoAssistSchema.safeParse({ cron: { triggers: { minIntervalMs: 0 } } }).success).toBe(
      false,
    );
    expect(
      NodoAssistSchema.safeParse({ cron: { triggers: { enabled: true, extra: true } } }).success,
    ).toBe(false);
  });
});
