// Text format tests cover command-facing shortening helpers.
import { describe, expect, it } from "vitest";
import { shortenText } from "./text-format.js";

describe("shortenText", () => {
  it("returns original text when it fits", () => {
    expect(shortenText("nodoassist", 16)).toBe("nodoassist");
  });

  it("truncates and appends ellipsis when over limit", () => {
    expect(shortenText("nodoassist-status-output", 10)).toBe("nodoassist-…");
  });

  it("returns an empty string for non-positive limits", () => {
    expect(shortenText("nodoassist", 0)).toBe("");
    expect(shortenText("nodoassist", -1)).toBe("");
  });

  it("counts multi-byte characters correctly", () => {
    expect(shortenText("hello🙂world", 7)).toBe("hello🙂…");
  });
});
