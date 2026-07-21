// Launchd current service tests cover resolving active macOS service labels.
import { describe, expect, it } from "vitest";
import { isCurrentProcessLaunchdServiceLabel } from "./launchd-current-service.js";

describe("isCurrentProcessLaunchdServiceLabel", () => {
  it("matches launchd-provided service labels", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.nodoassist.gateway", {
        LAUNCH_JOB_LABEL: "ai.nodoassist.gateway",
      }),
    ).toBe(true);
  });

  it("falls back to NodoAssist service markers when XPC_SERVICE_NAME is inherited", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.nodoassist.gateway", {
        XPC_SERVICE_NAME: "0",
        NODOASSIST_SERVICE_MARKER: "nodoassist",
        NODOASSIST_SERVICE_KIND: "gateway",
        NODOASSIST_LAUNCHD_LABEL: "ai.nodoassist.gateway",
      }),
    ).toBe(true);
  });

  it("preserves label-only fallback when launchd exposes no label variables", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.nodoassist.gateway", {
        NODOASSIST_LAUNCHD_LABEL: "ai.nodoassist.gateway",
      }),
    ).toBe(true);
  });

  it("can require service markers for label-only fallback", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel(
        "ai.nodoassist.gateway",
        {
          NODOASSIST_LAUNCHD_LABEL: "ai.nodoassist.gateway",
        },
        { allowConfiguredLabelFallback: false },
      ),
    ).toBe(false);
  });

  it("does not treat unrelated inherited launchd labels as current services", () => {
    expect(
      isCurrentProcessLaunchdServiceLabel("ai.nodoassist.gateway", {
        XPC_SERVICE_NAME: "0",
        NODOASSIST_LAUNCHD_LABEL: "ai.nodoassist.gateway",
      }),
    ).toBe(false);
  });
});
