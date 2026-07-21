// Daemon runtime hint tests cover platform-specific daemon guidance.
import { describe, expect, it } from "vitest";
import { buildPlatformRuntimeLogHints, buildPlatformServiceStartHints } from "./runtime-hints.js";

describe("buildPlatformRuntimeLogHints", () => {
  it("renders launchd log hints on darwin", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "darwin",
        env: {
          HOME: "/Users/test",
          NODOASSIST_STATE_DIR: "/tmp/nodoassist-state",
          NODOASSIST_LOG_PREFIX: "gateway",
        },
        systemdServiceName: "nodoassist-gateway",
        windowsTaskName: "NodoAssist Gateway",
      }),
    ).toEqual([
      "Launchd stdout (if installed): /Users/test/Library/Logs/nodoassist/gateway.log",
      "Launchd stderr (if installed): suppressed",
      "Restart attempts: /tmp/nodoassist-state/logs/gateway-restart.log",
    ]);
  });

  it("renders systemd and windows hints by platform", () => {
    expect(
      buildPlatformRuntimeLogHints({
        platform: "linux",
        env: {
          NODOASSIST_STATE_DIR: "/tmp/nodoassist-state",
        },
        systemdServiceName: "nodoassist-gateway",
        windowsTaskName: "NodoAssist Gateway",
      }),
    ).toEqual([
      "Logs: journalctl --user -u nodoassist-gateway.service -n 200 --no-pager",
      "Restart attempts: /tmp/nodoassist-state/logs/gateway-restart.log",
    ]);
    expect(
      buildPlatformRuntimeLogHints({
        platform: "win32",
        env: {
          NODOASSIST_STATE_DIR: "/tmp/nodoassist-state",
        },
        systemdServiceName: "nodoassist-gateway",
        windowsTaskName: "NodoAssist Gateway",
      }),
    ).toEqual([
      'Logs: schtasks /Query /TN "NodoAssist Gateway" /V /FO LIST',
      "Restart attempts: /tmp/nodoassist-state/logs/gateway-restart.log",
    ]);
  });
});

describe("buildPlatformServiceStartHints", () => {
  it("builds platform-specific service start hints", () => {
    expect(
      buildPlatformServiceStartHints({
        platform: "darwin",
        installCommand: "nodoassist gateway install",
        startCommand: "nodoassist gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.nodoassist.gateway.plist",
        systemdServiceName: "nodoassist-gateway",
        windowsTaskName: "NodoAssist Gateway",
      }),
    ).toEqual([
      "nodoassist gateway install",
      "nodoassist gateway",
      "launchctl bootstrap gui/$UID ~/Library/LaunchAgents/com.nodoassist.gateway.plist",
    ]);
    expect(
      buildPlatformServiceStartHints({
        platform: "linux",
        installCommand: "nodoassist gateway install",
        startCommand: "nodoassist gateway",
        launchAgentPlistPath: "~/Library/LaunchAgents/com.nodoassist.gateway.plist",
        systemdServiceName: "nodoassist-gateway",
        windowsTaskName: "NodoAssist Gateway",
      }),
    ).toEqual([
      "nodoassist gateway install",
      "nodoassist gateway",
      "systemctl --user start nodoassist-gateway.service",
    ]);
  });
});
