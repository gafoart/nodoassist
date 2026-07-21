// Daemon install plan tests cover shared install plan validation and platform warning helpers.
import { describe, expect, it } from "vitest";
import {
  resolveDaemonInstallRuntimeInputs,
  resolveDaemonNodeBinDir,
  resolveDaemonNodoAssistBinDir,
  resolveDaemonServicePathDirs,
  resolveGatewayDevMode,
} from "./daemon-install-plan.shared.js";

describe("resolveGatewayDevMode", () => {
  it("detects src ts entrypoints", () => {
    expect(resolveGatewayDevMode(["node", "/Users/me/nodoassist/src/cli/index.ts"])).toBe(true);
    expect(resolveGatewayDevMode(["node", "C:\\Users\\me\\nodoassist\\src\\cli\\index.ts"])).toBe(
      true,
    );
    expect(resolveGatewayDevMode(["node", "/Users/me/nodoassist/dist/cli/index.js"])).toBe(false);
  });
});

describe("resolveDaemonInstallRuntimeInputs", () => {
  it("keeps explicit devMode and nodePath overrides", async () => {
    await expect(
      resolveDaemonInstallRuntimeInputs({
        env: {},
        runtime: "node",
        devMode: false,
        nodePath: "/custom/node",
      }),
    ).resolves.toEqual({
      devMode: false,
      nodePath: "/custom/node",
    });
  });
});

describe("resolveDaemonNodeBinDir", () => {
  it("returns the absolute node bin directory", () => {
    expect(resolveDaemonNodeBinDir("/custom/node/bin/node")).toEqual(["/custom/node/bin"]);
  });

  it("ignores bare executable names", () => {
    expect(resolveDaemonNodeBinDir("node")).toBeUndefined();
  });
});

describe("resolveDaemonNodoAssistBinDir", () => {
  it("uses the active nodoassist command directory", () => {
    expect(
      resolveDaemonNodoAssistBinDir({
        argv: ["node", "/Users/testuser/.npm-global/bin/nodoassist", "gateway", "install"],
        env: { PATH: "" },
        platform: "darwin",
      }),
    ).toEqual(["/Users/testuser/.npm-global/bin"]);
  });

  it("finds the PATH shim that resolves to the active package entrypoint", () => {
    const realpaths = new Map([
      ["/Users/testuser/.npm-global/bin/nodoassist", "/pkg/nodoassist/nodoassist.mjs"],
      [
        "/Users/testuser/.npm-global/lib/node_modules/nodoassist/nodoassist.mjs",
        "/pkg/nodoassist/nodoassist.mjs",
      ],
    ]);

    expect(
      resolveDaemonNodoAssistBinDir({
        argv: [
          "node",
          "/Users/testuser/.npm-global/lib/node_modules/nodoassist/nodoassist.mjs",
          "gateway",
          "install",
        ],
        env: { PATH: "/Users/testuser/.npm-global/bin:/usr/bin" },
        platform: "darwin",
        existsSync: (candidate) => candidate === "/Users/testuser/.npm-global/bin/nodoassist",
        realpathSync: (candidate) => realpaths.get(candidate) ?? candidate,
      }),
    ).toEqual(["/Users/testuser/.npm-global/bin"]);
  });

  it("ignores unrelated nodoassist commands elsewhere on PATH", () => {
    expect(
      resolveDaemonNodoAssistBinDir({
        argv: ["node", "/opt/nodoassist/nodoassist.mjs", "gateway", "install"],
        env: { PATH: "/Users/testuser/.npm-global/bin" },
        platform: "darwin",
        existsSync: () => true,
        realpathSync: (candidate) =>
          candidate === "/Users/testuser/.npm-global/bin/nodoassist"
            ? "/other/nodoassist.mjs"
            : candidate,
      }),
    ).toBeUndefined();
  });
});

describe("resolveDaemonServicePathDirs", () => {
  it("combines node and active nodoassist command directories", () => {
    expect(
      resolveDaemonServicePathDirs({
        nodePath: "/opt/homebrew/opt/node/bin/node",
        argv: ["node", "/Users/testuser/.npm-global/bin/nodoassist", "gateway", "install"],
        env: { PATH: "" },
        platform: "darwin",
      }),
    ).toEqual(["/opt/homebrew/opt/node/bin", "/Users/testuser/.npm-global/bin"]);
  });
});
