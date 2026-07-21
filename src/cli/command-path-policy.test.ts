// Command path policy tests cover allowed CLI command path shapes and lazy imports.
import { importFreshModule } from "nodoassist/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { CliCommandCatalogEntry, CliCommandPathPolicy } from "./command-catalog.js";
import {
  resolveCliCatalogCommandPath,
  resolveCliCommandPathPolicy,
  resolveCliNetworkProxyPolicy,
} from "./command-path-policy.js";

const DEFAULT_EXPECTED_POLICY: CliCommandPathPolicy = {
  bypassConfigGuard: false,
  routeConfigGuard: "never",
  loadPlugins: "never",
  pluginRegistry: { scope: "all" },
  ownsProtocolStdout: false,
  hideBanner: false,
  ensureCliPath: true,
  networkProxy: "default",
};

type NetworkProxyResolver = Extract<
  CliCommandPathPolicy["networkProxy"],
  (ctx: { argv: string[]; commandPath: string[] }) => unknown
>;
type LoadPluginsResolver = Extract<
  CliCommandPathPolicy["loadPlugins"],
  (ctx: { argv: string[]; commandPath: string[]; jsonOutputMode: boolean }) => unknown
>;

function expectResolvedPolicy(
  commandPath: string[],
  expected: Partial<CliCommandPathPolicy>,
): void {
  expect(resolveCliCommandPathPolicy(commandPath)).toEqual({
    ...DEFAULT_EXPECTED_POLICY,
    ...expected,
  });
}

function expectNetworkProxyResolver(
  policy: CliCommandPathPolicy,
): asserts policy is CliCommandPathPolicy & { networkProxy: NetworkProxyResolver } {
  expect(typeof policy.networkProxy).toBe("function");
}

function expectLoadPluginsResolver(
  policy: CliCommandPathPolicy,
): asserts policy is CliCommandPathPolicy & { loadPlugins: LoadPluginsResolver } {
  expect(typeof policy.loadPlugins).toBe("function");
}

describe("command-path-policy", () => {
  afterEach(() => {
    vi.doUnmock("./command-catalog.js");
    vi.resetModules();
  });

  it("resolves status policy with shared startup semantics", () => {
    expectResolvedPolicy(["status"], {
      routeConfigGuard: "never",
      loadPlugins: "never",
      pluginRegistry: { scope: "channels" },
      ensureCliPath: false,
      networkProxy: "bypass",
    });
  });

  it("applies exact overrides after broader channel plugin rules", () => {
    expectResolvedPolicy(["channels", "send"], {
      loadPlugins: "always",
      pluginRegistry: { scope: "configured-channels" },
    });
    expectResolvedPolicy(["channels", "login"], {
      loadPlugins: "always",
      pluginRegistry: { scope: "configured-channels" },
    });
    expectResolvedPolicy(["channels", "capabilities"], {
      loadPlugins: "always",
      pluginRegistry: { scope: "configured-channels" },
    });
    expectResolvedPolicy(["channels", "add"], {
      loadPlugins: "never",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: "bypass",
    });
    const channelsStatusPolicy = resolveCliCommandPathPolicy(["channels", "status"]);
    expect(channelsStatusPolicy).toEqual({
      ...DEFAULT_EXPECTED_POLICY,
      loadPlugins: "never",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: channelsStatusPolicy.networkProxy,
    });
    expectNetworkProxyResolver(channelsStatusPolicy);
    expect(
      channelsStatusPolicy.networkProxy({
        argv: ["node", "nodoassist", "channels", "status"],
        commandPath: ["channels", "status"],
      }),
    ).toBe("bypass");
    expect(
      channelsStatusPolicy.networkProxy({
        argv: ["node", "nodoassist", "channels", "status", "--probe"],
        commandPath: ["channels", "status"],
      }),
    ).toBe("default");
    expectResolvedPolicy(["channels", "list"], {
      loadPlugins: "never",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["channels", "logs"], {
      loadPlugins: "never",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["channels", "remove"], {
      loadPlugins: "always",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["channels", "resolve"], {
      loadPlugins: "always",
      pluginRegistry: { scope: "configured-channels" },
      networkProxy: "bypass",
    });
  });

  it("keeps config-only agent commands on config-only startup", () => {
    const agentPolicy = resolveCliCommandPathPolicy(["agent"]);
    expect(agentPolicy).toEqual({
      ...DEFAULT_EXPECTED_POLICY,
      loadPlugins: agentPolicy.loadPlugins,
      pluginRegistry: { scope: "all" },
      networkProxy: agentPolicy.networkProxy,
    });
    expectLoadPluginsResolver(agentPolicy);
    expectNetworkProxyResolver(agentPolicy);
    expect(
      agentPolicy.loadPlugins({
        argv: ["node", "nodoassist", "agent"],
        commandPath: ["agent"],
        jsonOutputMode: false,
      }),
    ).toBe(true);
    expect(
      agentPolicy.loadPlugins({
        argv: ["node", "nodoassist", "agent", "--json"],
        commandPath: ["agent"],
        jsonOutputMode: true,
      }),
    ).toBe(false);
    expect(
      agentPolicy.loadPlugins({
        argv: ["node", "nodoassist", "agent", "--local"],
        commandPath: ["agent"],
        jsonOutputMode: true,
      }),
    ).toBe(true);
    expect(
      agentPolicy.networkProxy({
        argv: ["node", "nodoassist", "agent"],
        commandPath: ["agent"],
      }),
    ).toBe("bypass");
    expect(
      agentPolicy.networkProxy({
        argv: ["node", "nodoassist", "agent", "--local"],
        commandPath: ["agent"],
      }),
    ).toBe("default");

    for (const commandPath of [
      ["agents"],
      ["agents", "list"],
      ["agents", "bind"],
      ["agents", "bindings"],
      ["agents", "unbind"],
      ["agents", "set-identity"],
      ["agents", "delete"],
    ]) {
      expectResolvedPolicy(commandPath, {
        loadPlugins: "never",
        networkProxy: "bypass",
      });
    }
  });

  it("resolves mixed startup-only rules", () => {
    expectResolvedPolicy(["configure"], {
      bypassConfigGuard: true,
      loadPlugins: "never",
    });
    expectResolvedPolicy(["config"], {
      bypassConfigGuard: true,
      loadPlugins: "never",
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["config", "set"], {
      loadPlugins: "never",
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["doctor"], {
      bypassConfigGuard: true,
      loadPlugins: "never",
    });
    expectResolvedPolicy(["config", "validate"], {
      bypassConfigGuard: true,
      loadPlugins: "never",
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["gateway", "status"], {
      routeConfigGuard: "always",
      loadPlugins: "never",
      networkProxy: "bypass",
    });
    expectResolvedPolicy(["plugins", "update"], {
      loadPlugins: "never",
      hideBanner: true,
    });
    expectResolvedPolicy(["plugins", "list"], {
      ensureCliPath: false,
      loadPlugins: "never",
      networkProxy: "bypass",
    });
    for (const commandPath of [["tasks"], ["tasks", "list"], ["tasks", "audit"]]) {
      expectResolvedPolicy(commandPath, {
        ensureCliPath: false,
        loadPlugins: "never",
        networkProxy: "bypass",
      });
    }
    for (const commandPath of [
      ["plugins", "install"],
      ["plugins", "inspect"],
      ["plugins", "registry"],
      ["plugins", "doctor"],
    ]) {
      expectResolvedPolicy(commandPath, {
        loadPlugins: "never",
      });
    }
    expectResolvedPolicy(["cron", "list"], {
      bypassConfigGuard: true,
      loadPlugins: "never",
      networkProxy: "bypass",
    });
  });

  it("defaults unknown command paths to network proxy routing", () => {
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "googlemeet", "login"])).toBe(
      "default",
    );
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "tool", "image_generate"])).toBe(
      "bypass",
    );
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "tools", "effective"])).toBe(
      "bypass",
    );
  });

  it("resolves static network proxy bypass policies from the catalog", () => {
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "status"])).toBe("bypass");
    expect(
      resolveCliNetworkProxyPolicy(["node", "nodoassist", "config", "get", "proxy.enabled"]),
    ).toBe("bypass");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "proxy", "start"])).toBe("bypass");
  });

  it("resolves mixed network proxy policies from argv-sensitive catalog entries", () => {
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "gateway"])).toBe("default");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "gateway", "run"])).toBe("default");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "gateway", "health"])).toBe(
      "bypass",
    );
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "node", "run"])).toBe("default");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "node", "status"])).toBe("bypass");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "agent", "--local"])).toBe(
      "default",
    );
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "agent", "run"])).toBe("bypass");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "channels", "status"])).toBe(
      "bypass",
    );
    expect(
      resolveCliNetworkProxyPolicy(["node", "nodoassist", "channels", "status", "--probe"]),
    ).toBe("default");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "models", "status"])).toBe("bypass");
    expect(
      resolveCliNetworkProxyPolicy(["node", "nodoassist", "models", "status", "--probe"]),
    ).toBe("default");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "skills", "info", "browser"])).toBe(
      "bypass",
    );
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "skills", "check"])).toBe("bypass");
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "skills", "list"])).toBe("bypass");
    expect(
      resolveCliNetworkProxyPolicy(["node", "nodoassist", "skills", "search", "browser"]),
    ).toBe("default");
  });

  it("uses the longest catalog command path for deep network proxy overrides", async () => {
    const catalog: readonly CliCommandCatalogEntry[] = [
      { commandPath: ["nodes"], policy: { networkProxy: "bypass" } },
      {
        commandPath: ["nodes", "camera", "snap"],
        exact: true,
        policy: { networkProxy: "default" },
      },
    ];

    vi.doMock("./command-catalog.js", async (importOriginal) => {
      const actual = await importOriginal<typeof import("./command-catalog.js")>();
      return { ...actual, cliCommandCatalog: catalog };
    });
    const {
      resolveCliCatalogCommandPath: resolveCliCatalogCommandPathLocal,
      resolveCliNetworkProxyPolicy: resolveCliNetworkProxyPolicyLocal,
    } = await importFreshModule<typeof import("./command-path-policy.js")>(
      import.meta.url,
      "./command-path-policy.js?catalog-overrides",
    );

    expect(
      resolveCliCatalogCommandPathLocal(["node", "nodoassist", "nodes", "camera", "snap"]),
    ).toEqual(["nodes", "camera", "snap"]);
    expect(
      resolveCliNetworkProxyPolicyLocal(["node", "nodoassist", "nodes", "camera", "snap"]),
    ).toBe("default");
    expect(
      resolveCliNetworkProxyPolicyLocal(["node", "nodoassist", "nodes", "camera", "list"]),
    ).toBe("bypass");
  });

  it("stops catalog command path resolution before positional arguments", () => {
    expect(
      resolveCliCatalogCommandPath(["node", "nodoassist", "config", "get", "proxy.enabled"]),
    ).toEqual(["config", "get"]);
    expect(
      resolveCliCatalogCommandPath(["node", "nodoassist", "message", "send", "--to", "demo"]),
    ).toEqual(["message"]);
  });

  it("treats bare gateway invocations with options as the gateway runtime", () => {
    const argv = ["node", "nodoassist", "gateway", "--port", "1234"];

    expect(resolveCliCatalogCommandPath(argv)).toEqual(["gateway"]);
    expect(resolveCliNetworkProxyPolicy(argv)).toBe("default");
  });

  it("resolves gateway runs after root options with values", () => {
    const argv = ["node", "nodoassist", "--log-level", "debug", "gateway", "run"];

    expect(resolveCliCatalogCommandPath(argv)).toEqual(["gateway"]);
    expect(resolveCliNetworkProxyPolicy(argv)).toBe("default");
  });

  it("does not let gateway run option values spoof bypass subcommands", () => {
    for (const argv of [
      ["node", "nodoassist", "gateway", "--token", "status"],
      ["node", "nodoassist", "gateway", "--token=status"],
      ["node", "nodoassist", "gateway", "--password", "health"],
      ["node", "nodoassist", "gateway", "--password-file", "status"],
      ["node", "nodoassist", "gateway", "--ws-log", "compact"],
    ]) {
      expect(resolveCliCatalogCommandPath(argv), argv.join(" ")).toEqual(["gateway"]);
      expect(resolveCliNetworkProxyPolicy(argv), argv.join(" ")).toBe("default");
    }
  });

  it("still resolves real gateway bypass subcommands after their command token", () => {
    expect(resolveCliCatalogCommandPath(["node", "nodoassist", "gateway", "status"])).toEqual([
      "gateway",
      "status",
    ]);
    expect(
      resolveCliCatalogCommandPath([
        "node",
        "nodoassist",
        "gateway",
        "status",
        "--token",
        "secret",
      ]),
    ).toEqual(["gateway", "status"]);
    expect(resolveCliNetworkProxyPolicy(["node", "nodoassist", "gateway", "status"])).toBe(
      "bypass",
    );
  });
});
