// Control UI tests cover theme behavior.
import { describe, expect, it, vi } from "vitest";
import { parseThemeSelection, resolveTheme } from "./theme.ts";

describe("resolveTheme", () => {
  it("resolves the brand family and the imported slot per mode", () => {
    expect(resolveTheme("nodo", "dark")).toBe("dark");
    expect(resolveTheme("nodo", "light")).toBe("light");
    expect(resolveTheme("custom", "dark")).toBe("custom");
    expect(resolveTheme("custom", "light")).toBe("custom-light");
  });

  it("uses system preference when mode is system", () => {
    vi.stubGlobal("matchMedia", vi.fn().mockReturnValue({ matches: true }));
    expect(resolveTheme("nodo", "system")).toBe("light");
    expect(resolveTheme("custom", "system")).toBe("custom-light");
    vi.unstubAllGlobals();
  });
});

describe("parseThemeSelection", () => {
  it("maps legacy stored values onto theme + mode", () => {
    expect(parseThemeSelection("system", undefined)).toEqual({
      theme: "nodo",
      mode: "system",
    });
    expect(parseThemeSelection("fieldmanual", undefined)).toEqual({
      theme: "nodo",
      mode: "dark",
    });
  });

  it("collapses retired theme families onto the brand family", () => {
    expect(parseThemeSelection("knot", undefined)).toEqual({ theme: "nodo", mode: "dark" });
    expect(parseThemeSelection("dash", undefined)).toEqual({ theme: "nodo", mode: "dark" });
    expect(parseThemeSelection("claw", undefined)).toEqual({ theme: "nodo", mode: "system" });
  });
});
