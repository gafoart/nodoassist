// Covers supervisor marker files used to identify managed NodoAssist processes.
import { describe, expect, it } from "vitest";
import { detectRespawnSupervisor, SUPERVISOR_HINT_ENV_VARS } from "./supervisor-markers.js";

describe("SUPERVISOR_HINT_ENV_VARS", () => {
  it("includes the cross-platform supervisor hint env vars", () => {
    const envVars = new Set(SUPERVISOR_HINT_ENV_VARS);
    expect(envVars.has("LAUNCH_JOB_LABEL")).toBe(true);
    expect(envVars.has("INVOCATION_ID")).toBe(true);
    expect(envVars.has("NODOASSIST_WINDOWS_TASK_NAME")).toBe(true);
    expect(envVars.has("NODOASSIST_SERVICE_MARKER")).toBe(true);
    expect(envVars.has("NODOASSIST_SERVICE_KIND")).toBe(true);
  });
});

describe("detectRespawnSupervisor", () => {
  it("detects launchd from NodoAssist's explicit marker or current gateway launchd job", () => {
    expect(
      detectRespawnSupervisor({ NODOASSIST_LAUNCHD_LABEL: " ai.nodoassist.gateway " }, "darwin"),
    ).toBe("launchd");
    expect(detectRespawnSupervisor({ NODOASSIST_LAUNCHD_LABEL: "   " }, "darwin")).toBeNull();
    expect(detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.nodoassist.gateway" }, "darwin")).toBe(
      "launchd",
    );
    expect(
      detectRespawnSupervisor(
        { LAUNCH_JOB_NAME: "ai.nodoassist.work", NODOASSIST_PROFILE: "work" },
        "darwin",
      ),
    ).toBe("launchd");
    expect(detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.nodoassist.mac" }, "darwin")).toBeNull();
    expect(detectRespawnSupervisor({ XPC_SERVICE_NAME: "ai.nodoassist.mac" }, "darwin")).toBeNull();
    expect(
      detectRespawnSupervisor(
        { XPC_SERVICE_NAME: "ai.nodoassist.mac", NODOASSIST_PROFILE: "mac" },
        "darwin",
      ),
    ).toBeNull();
    expect(detectRespawnSupervisor({ XPC_SERVICE_NAME: "ai.nodoassist.gateway" }, "darwin")).toBe(
      "launchd",
    );
  });

  it("detects systemd only from non-blank platform-specific hints", () => {
    expect(detectRespawnSupervisor({ INVOCATION_ID: "abc123" }, "linux")).toBe("systemd");
    expect(detectRespawnSupervisor({ JOURNAL_STREAM: "" }, "linux")).toBeNull();
  });

  it("detects Linux NodoAssist gateway service markers only for opt-in callers", () => {
    const gatewayServiceEnv = {
      NODOASSIST_SERVICE_MARKER: " nodoassist ",
      NODOASSIST_SERVICE_KIND: " gateway ",
    };
    expect(detectRespawnSupervisor(gatewayServiceEnv, "linux")).toBeNull();
    expect(
      detectRespawnSupervisor(gatewayServiceEnv, "linux", {
        includeLinuxNodoAssistGatewayServiceMarker: true,
      }),
    ).toBe("systemd");
    expect(
      detectRespawnSupervisor(
        {
          NODOASSIST_SERVICE_MARKER: "nodoassist",
          NODOASSIST_SERVICE_KIND: "worker",
        },
        "linux",
        { includeLinuxNodoAssistGatewayServiceMarker: true },
      ),
    ).toBeNull();
    expect(
      detectRespawnSupervisor(
        {
          NODOASSIST_SERVICE_MARKER: "other",
          NODOASSIST_SERVICE_KIND: "gateway",
        },
        "linux",
        { includeLinuxNodoAssistGatewayServiceMarker: true },
      ),
    ).toBeNull();
  });

  it("detects scheduled-task supervision on Windows from either hint family", () => {
    expect(
      detectRespawnSupervisor({ NODOASSIST_WINDOWS_TASK_NAME: "NodoAssist Gateway" }, "win32"),
    ).toBe("schtasks");
    expect(
      detectRespawnSupervisor(
        {
          NODOASSIST_SERVICE_MARKER: "nodoassist",
          NODOASSIST_SERVICE_KIND: "gateway",
        },
        "win32",
      ),
    ).toBe("schtasks");
    expect(
      detectRespawnSupervisor(
        {
          NODOASSIST_SERVICE_MARKER: "nodoassist",
          NODOASSIST_SERVICE_KIND: "worker",
        },
        "win32",
      ),
    ).toBeNull();
  });

  it("ignores service markers on non-Windows platforms and unknown platforms", () => {
    expect(
      detectRespawnSupervisor(
        {
          NODOASSIST_SERVICE_MARKER: "nodoassist",
          NODOASSIST_SERVICE_KIND: "gateway",
        },
        "linux",
      ),
    ).toBeNull();
    expect(
      detectRespawnSupervisor({ LAUNCH_JOB_LABEL: "ai.nodoassist.gateway" }, "freebsd"),
    ).toBeNull();
  });
});
