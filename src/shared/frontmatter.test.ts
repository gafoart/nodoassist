// Frontmatter tests cover shared Markdown frontmatter parsing helpers.
import { describe, expect, it, test } from "vitest";
import {
  applyNodoAssistManifestInstallCommonFields,
  getFrontmatterString,
  normalizeStringList,
  parseFrontmatterBool,
  parseNodoAssistManifestInstallBase,
  resolveNodoAssistManifestBlock,
  resolveNodoAssistManifestInstall,
  resolveNodoAssistManifestOs,
  resolveNodoAssistManifestRequires,
} from "./frontmatter.js";

function expectInstallBase(
  parsed: ReturnType<typeof parseNodoAssistManifestInstallBase>,
): NonNullable<ReturnType<typeof parseNodoAssistManifestInstallBase>> {
  if (parsed === undefined) {
    throw new Error("Expected manifest install base");
  }
  return parsed;
}

describe("shared/frontmatter", () => {
  test("normalizeStringList handles strings, arrays, and non-list values", () => {
    expect(normalizeStringList("a, b,,c")).toEqual(["a", "b", "c"]);
    expect(normalizeStringList([" a ", "", "b", 42])).toEqual(["a", "b", "42"]);
    expect(normalizeStringList(null)).toStrictEqual([]);
  });

  test("getFrontmatterString extracts strings only", () => {
    expect(getFrontmatterString({ a: "b" }, "a")).toBe("b");
    expect(getFrontmatterString({ a: 1 }, "a")).toBeUndefined();
  });

  test("parseFrontmatterBool respects explicit values and fallback", () => {
    expect(parseFrontmatterBool("true", false)).toBe(true);
    expect(parseFrontmatterBool("false", true)).toBe(false);
    expect(parseFrontmatterBool(undefined, true)).toBe(true);
    expect(parseFrontmatterBool("maybe", false)).toBe(false);
  });

  test("resolveNodoAssistManifestBlock reads current manifest keys and custom metadata fields", () => {
    expect(
      resolveNodoAssistManifestBlock({
        frontmatter: {
          metadata: "{ nodoassist: { foo: 1, bar: 'baz' } }",
        },
      }),
    ).toEqual({ foo: 1, bar: "baz" });

    expect(
      resolveNodoAssistManifestBlock({
        frontmatter: {
          pluginMeta: "{ nodoassist: { foo: 2 } }",
        },
        key: "pluginMeta",
      }),
    ).toEqual({ foo: 2 });
  });

  test("resolveNodoAssistManifestBlock reads legacy manifest keys", () => {
    expect(
      resolveNodoAssistManifestBlock({
        frontmatter: {
          metadata: "{ clawdbot: { requires: { bins: ['op'] }, install: [] } }",
        },
      }),
    ).toEqual({ requires: { bins: ["op"] }, install: [] });
  });

  test("resolveNodoAssistManifestBlock prefers current manifest keys over legacy keys", () => {
    expect(
      resolveNodoAssistManifestBlock({
        frontmatter: {
          metadata:
            "{ nodoassist: { requires: { bins: ['current'] } }, clawdbot: { requires: { bins: ['legacy'] } } }",
        },
      }),
    ).toEqual({ requires: { bins: ["current"] } });
  });

  test("resolveNodoAssistManifestBlock returns undefined for invalid input", () => {
    expect(resolveNodoAssistManifestBlock({ frontmatter: {} })).toBeUndefined();
    expect(
      resolveNodoAssistManifestBlock({ frontmatter: { metadata: "not-json5" } }),
    ).toBeUndefined();
    expect(resolveNodoAssistManifestBlock({ frontmatter: { metadata: "123" } })).toBeUndefined();
    expect(resolveNodoAssistManifestBlock({ frontmatter: { metadata: "[]" } })).toBeUndefined();
    expect(
      resolveNodoAssistManifestBlock({ frontmatter: { metadata: "{ nope: { a: 1 } }" } }),
    ).toBeUndefined();
  });

  it("normalizes manifest requirement and os lists", () => {
    expect(
      resolveNodoAssistManifestRequires({
        requires: {
          bins: "bun, node",
          anyBins: [" ffmpeg ", ""],
          env: ["NODOASSIST_TOKEN", " NODOASSIST_URL "],
          config: null,
        },
      }),
    ).toEqual({
      bins: ["bun", "node"],
      anyBins: ["ffmpeg"],
      env: ["NODOASSIST_TOKEN", "NODOASSIST_URL"],
      config: [],
    });
    expect(resolveNodoAssistManifestRequires({})).toBeUndefined();
    expect(resolveNodoAssistManifestOs({ os: [" darwin ", "linux", ""] })).toEqual([
      "darwin",
      "linux",
    ]);
  });

  it("parses and applies install common fields", () => {
    const parsed = parseNodoAssistManifestInstallBase(
      {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        type: " Brew ",
        id: "brew.git",
        label: "Git",
        bins: [" git ", "git"],
      },
      kind: "brew",
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
    expect(parseNodoAssistManifestInstallBase({ kind: "bad" }, ["brew"])).toBeUndefined();
    expect(
      applyNodoAssistManifestInstallCommonFields<{
        extra: boolean;
        id?: string;
        label?: string;
        bins?: string[];
      }>({ extra: true }, expectInstallBase(parsed)),
    ).toEqual({
      extra: true,
      id: "brew.git",
      label: "Git",
      bins: ["git", "git"],
    });
  });

  it("prefers explicit kind, ignores invalid common fields, and leaves missing ones untouched", () => {
    const parsed = parseNodoAssistManifestInstallBase(
      {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      ["brew", "npm"],
    );

    expect(parsed).toEqual({
      raw: {
        kind: " npm ",
        type: "brew",
        id: 42,
        label: null,
        bins: [" ", ""],
      },
      kind: "npm",
    });
    expect(
      applyNodoAssistManifestInstallCommonFields(
        { id: "keep", label: "Keep", bins: ["bun"] },
        parsed!,
      ),
    ).toEqual({
      id: "keep",
      label: "Keep",
      bins: ["bun"],
    });
  });

  it("maps install entries through the parser and filters rejected specs", () => {
    expect(
      resolveNodoAssistManifestInstall(
        {
          install: [{ id: "keep" }, { id: "drop" }, "bad"],
        },
        (entry) => {
          if (
            typeof entry === "object" &&
            entry !== null &&
            (entry as { id?: string }).id === "keep"
          ) {
            return { id: "keep" };
          }
          return undefined;
        },
      ),
    ).toEqual([{ id: "keep" }]);
  });
});
