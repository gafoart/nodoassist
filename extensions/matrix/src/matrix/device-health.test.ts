// Matrix tests cover device health plugin behavior.
import { describe, expect, it } from "vitest";
import { isNodoAssistManagedMatrixDevice, summarizeMatrixDeviceHealth } from "./device-health.js";

describe("matrix device health", () => {
  it("detects NodoAssist-managed device names", () => {
    expect(isNodoAssistManagedMatrixDevice("NodoAssist Gateway")).toBe(true);
    expect(isNodoAssistManagedMatrixDevice("NodoAssist Debug")).toBe(true);
    expect(isNodoAssistManagedMatrixDevice("Element iPhone")).toBe(false);
    expect(isNodoAssistManagedMatrixDevice(null)).toBe(false);
  });

  it("summarizes stale NodoAssist-managed devices separately from the current device", () => {
    const summary = summarizeMatrixDeviceHealth([
      {
        deviceId: "du314Zpw3A",
        displayName: "NodoAssist Gateway",
        current: true,
      },
      {
        deviceId: "BritdXC6iL",
        displayName: "NodoAssist Gateway",
        current: false,
      },
      {
        deviceId: "G6NJU9cTgs",
        displayName: "NodoAssist Debug",
        current: false,
      },
      {
        deviceId: "phone123",
        displayName: "Element iPhone",
        current: false,
      },
    ]);

    expect(summary).toEqual({
      currentDeviceId: "du314Zpw3A",
      currentNodoAssistDevices: [
        {
          deviceId: "du314Zpw3A",
          displayName: "NodoAssist Gateway",
          current: true,
        },
      ],
      staleNodoAssistDevices: [
        {
          deviceId: "BritdXC6iL",
          displayName: "NodoAssist Gateway",
          current: false,
        },
        {
          deviceId: "G6NJU9cTgs",
          displayName: "NodoAssist Debug",
          current: false,
        },
      ],
    });
  });
});
