// Tests shared utility helpers used by CLI and runtime modules.
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { MAX_TIMER_TIMEOUT_MS } from "./shared/number-coercion.js";
import { withTempDir } from "./test-helpers/temp-dir.js";
import { withEnv } from "./test-utils/env.js";
import {
  CONFIG_DIR,
  ensureDir,
  normalizeE164,
  pinConfigDir,
  resolveConfigDir,
  resolveHomeDir,
  resolveUserPath,
  shortenHomeInString,
  shortenHomePath,
  sleep,
} from "./utils.js";

describe("ensureDir", () => {
  it("creates nested directory", async () => {
    await withTempDir({ prefix: "nodoassist-test-" }, async (tmp) => {
      const target = path.join(tmp, "nested", "dir");
      await ensureDir(target);
      expect(fs.existsSync(target)).toBe(true);
    });
  });
});

describe("sleep", () => {
  it("resolves after delay using fake timers", async () => {
    vi.useFakeTimers();
    try {
      const promise = sleep(1000);
      vi.advanceTimersByTime(1000);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it("clamps oversized sleep delays before scheduling", async () => {
    vi.useFakeTimers();
    const setTimeoutSpy = vi.spyOn(globalThis, "setTimeout");
    try {
      const promise = sleep(Number.MAX_SAFE_INTEGER);

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), MAX_TIMER_TIMEOUT_MS);

      vi.advanceTimersByTime(MAX_TIMER_TIMEOUT_MS);
      await expect(promise).resolves.toBeUndefined();
    } finally {
      setTimeoutSpy.mockRestore();
      vi.useRealTimers();
    }
  });
});

describe("normalizeE164", () => {
  it.each([
    ["+1234567890", "+1234567890"],
    ["++1234567890", "+1234567890"],
    ["1+234+567", "+1234567"],
    ["whatsapp:+1 (234) 567-8900", "+12345678900"],
    ["signal: 1 234 567", "+1234567"],
    ["not a phone number", ""],
  ])("normalizes %s", (input, expected) => {
    expect(normalizeE164(input)).toBe(expected);
  });
});

describe("resolveConfigDir", () => {
  it("prefers ~/.nodoassist when legacy dir is missing", async () => {
    await withTempDir({ prefix: "nodoassist-config-dir-" }, async (root) => {
      const newDir = path.join(root, ".nodoassist");
      await fs.promises.mkdir(newDir, { recursive: true });
      const resolved = resolveConfigDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("expands NODOASSIST_STATE_DIR using the provided env", () => {
    const env = {
      HOME: "/tmp/nodoassist-home",
      NODOASSIST_STATE_DIR: "~/state",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/nodoassist-home", "state"));
  });

  it("falls back to the config file directory when only NODOASSIST_CONFIG_PATH is set", () => {
    const env = {
      HOME: "/tmp/nodoassist-home",
      NODOASSIST_CONFIG_PATH: "~/profiles/dev/nodoassist.json",
    } as NodeJS.ProcessEnv;

    expect(resolveConfigDir(env)).toBe(path.resolve("/tmp/nodoassist-home", "profiles", "dev"));
  });

  it("re-pins the exported configuration root after startup environment selection", () => {
    const originalConfigDir = CONFIG_DIR;
    const selectedConfigDir = path.resolve("/tmp/nodoassist-selected-config-root");
    try {
      expect(
        pinConfigDir({
          NODOASSIST_STATE_DIR: selectedConfigDir,
          NODOASSIST_TEST_FAST: "1",
        }),
      ).toBe(selectedConfigDir);
      expect(CONFIG_DIR).toBe(selectedConfigDir);
    } finally {
      pinConfigDir({
        NODOASSIST_STATE_DIR: originalConfigDir,
        NODOASSIST_TEST_FAST: "1",
      });
    }
  });
});

describe("resolveHomeDir", () => {
  it("prefers NODOASSIST_HOME over HOME", () => {
    withEnv({ NODOASSIST_HOME: "/srv/nodoassist-home", HOME: "/home/other" }, () => {
      expect(resolveHomeDir()).toBe(path.resolve("/srv/nodoassist-home"));
    });
  });
});

describe("shortenHomePath", () => {
  it("uses $NODOASSIST_HOME prefix when NODOASSIST_HOME is set", () => {
    withEnv({ NODOASSIST_HOME: "/srv/nodoassist-home", HOME: "/home/other" }, () => {
      expect(
        shortenHomePath(`${path.resolve("/srv/nodoassist-home")}/.nodoassist/nodoassist.json`),
      ).toBe("$NODOASSIST_HOME/.nodoassist/nodoassist.json");
    });
  });
});

describe("shortenHomeInString", () => {
  it("uses $NODOASSIST_HOME replacement when NODOASSIST_HOME is set", () => {
    withEnv({ NODOASSIST_HOME: "/srv/nodoassist-home", HOME: "/home/other" }, () => {
      expect(
        shortenHomeInString(
          `config: ${path.resolve("/srv/nodoassist-home")}/.nodoassist/nodoassist.json`,
        ),
      ).toBe("config: $NODOASSIST_HOME/.nodoassist/nodoassist.json");
    });
  });
});

describe("resolveUserPath", () => {
  it("expands ~ to home dir", () => {
    expect(resolveUserPath("~", {}, () => "/Users/thoffman")).toBe(path.resolve("/Users/thoffman"));
  });

  it("expands ~/ to home dir", () => {
    expect(resolveUserPath("~/nodoassist", {}, () => "/Users/thoffman")).toBe(
      path.resolve("/Users/thoffman", "nodoassist"),
    );
  });

  it("resolves relative paths", () => {
    expect(resolveUserPath("tmp/dir")).toBe(path.resolve("tmp/dir"));
  });

  it("prefers NODOASSIST_HOME for tilde expansion", () => {
    withEnv({ NODOASSIST_HOME: "/srv/nodoassist-home", HOME: "/home/other" }, () => {
      expect(resolveUserPath("~/nodoassist")).toBe(
        path.resolve("/srv/nodoassist-home", "nodoassist"),
      );
    });
  });

  it("uses the provided env for tilde expansion", () => {
    const env = {
      HOME: "/tmp/nodoassist-home",
      NODOASSIST_HOME: "/srv/nodoassist-home",
    } as NodeJS.ProcessEnv;

    expect(resolveUserPath("~/nodoassist", env)).toBe(
      path.resolve("/srv/nodoassist-home", "nodoassist"),
    );
  });

  it("keeps blank paths blank", () => {
    expect(resolveUserPath("")).toBe("");
    expect(resolveUserPath("   ")).toBe("");
  });

  it("returns empty string for undefined/null input", () => {
    expect(resolveUserPath(undefined as unknown as string)).toBe("");
    expect(resolveUserPath(null as unknown as string)).toBe("");
  });
});
