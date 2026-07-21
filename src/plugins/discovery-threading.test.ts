// Covers plugin discovery threading and concurrency behavior.
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PluginDiscoveryResult } from "./discovery.js";

const discoverNodoAssistPluginsMock = vi.fn();

vi.mock("./discovery.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./discovery.js")>();
  return {
    ...actual,
    discoverNodoAssistPlugins: (...args: unknown[]) => discoverNodoAssistPluginsMock(...args),
  };
});

const { loadPluginManifestRegistry } = await import("./manifest-registry.js");
const { resolveInstalledPluginIndexRegistry } =
  await import("./installed-plugin-index-registry.js");

const emptyDiscovery: PluginDiscoveryResult = { candidates: [], diagnostics: [] };

describe("discovery threading", () => {
  beforeEach(() => {
    discoverNodoAssistPluginsMock.mockReset();
    discoverNodoAssistPluginsMock.mockReturnValue(emptyDiscovery);
  });

  it("skips internal discoverNodoAssistPlugins when discovery is supplied", () => {
    loadPluginManifestRegistry({ discovery: emptyDiscovery });
    expect(discoverNodoAssistPluginsMock).not.toHaveBeenCalled();

    discoverNodoAssistPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ discovery: emptyDiscovery, installRecords: {} });
    expect(discoverNodoAssistPluginsMock).not.toHaveBeenCalled();
  });

  it("calls discoverNodoAssistPlugins when neither discovery nor candidates supplied", () => {
    loadPluginManifestRegistry({});
    expect(discoverNodoAssistPluginsMock).toHaveBeenCalledTimes(1);

    discoverNodoAssistPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({ installRecords: {} });
    expect(discoverNodoAssistPluginsMock).toHaveBeenCalledTimes(1);
  });

  it("prefers explicit candidates over discovery when both are supplied", () => {
    loadPluginManifestRegistry({ candidates: [], diagnostics: [], discovery: emptyDiscovery });
    expect(discoverNodoAssistPluginsMock).not.toHaveBeenCalled();

    discoverNodoAssistPluginsMock.mockClear();
    resolveInstalledPluginIndexRegistry({
      candidates: [],
      discovery: emptyDiscovery,
      installRecords: {},
    });
    expect(discoverNodoAssistPluginsMock).not.toHaveBeenCalled();
  });
});
