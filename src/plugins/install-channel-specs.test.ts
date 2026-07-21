import { describe, expect, it } from "vitest";
import {
  resolveClawHubInstallSpecsForUpdateChannel,
  resolveNpmInstallSpecsForUpdateChannel,
} from "./install-channel-specs.js";

describe("resolveNpmInstallSpecsForUpdateChannel", () => {
  it.each(["@nodoassist/discord", "@nodoassist/discord@latest"])(
    "targets the exact core version for official extended-stable intent %s",
    (spec) => {
      expect(
        resolveNpmInstallSpecsForUpdateChannel({
          spec,
          updateChannel: "extended-stable",
          officialPackageName: "@nodoassist/discord",
          coreVersion: "2026.7.33",
        }),
      ).toEqual({
        installSpec: "@nodoassist/discord@2026.7.33",
        recordSpec: spec,
      });
    },
  );

  it.each([
    "@nodoassist/discord@2026.6.33",
    "@nodoassist/discord@next",
    "@nodoassist/discord@beta",
    "@nodoassist/discord@^2026.6.0",
    "https://registry.example.test/discord.tgz",
  ])("preserves explicit extended-stable intent %s", (spec) => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec,
        updateChannel: "extended-stable",
        officialPackageName: "@nodoassist/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: spec, recordSpec: spec });
  });

  it("does not rewrite a third-party package", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@acme/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@nodoassist/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({ installSpec: "@acme/discord", recordSpec: "@acme/discord" });
  });

  it("fails closed without an authoritative extended-stable core version", () => {
    expect(() =>
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@nodoassist/discord",
        updateChannel: "extended-stable",
        officialPackageName: "@nodoassist/discord",
      }),
    ).toThrow("requires an exact core version");
  });

  it("preserves beta behavior", () => {
    expect(
      resolveNpmInstallSpecsForUpdateChannel({
        spec: "@nodoassist/discord@latest",
        updateChannel: "beta",
        officialPackageName: "@nodoassist/discord",
        coreVersion: "2026.7.33",
      }),
    ).toEqual({
      installSpec: "@nodoassist/discord@beta",
      recordSpec: "@nodoassist/discord@latest",
      fallbackSpec: "@nodoassist/discord@latest",
      fallbackLabel: "@nodoassist/discord@beta",
    });
  });
});

describe("resolveClawHubInstallSpecsForUpdateChannel", () => {
  it("does not rewrite ClawHub on extended-stable", () => {
    expect(
      resolveClawHubInstallSpecsForUpdateChannel({
        spec: "clawhub:@nodoassist/discord",
        updateChannel: "extended-stable",
      }),
    ).toEqual({
      installSpec: "clawhub:@nodoassist/discord",
      recordSpec: "clawhub:@nodoassist/discord",
    });
  });
});
