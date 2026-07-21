// Logger browser import tests cover safe import behavior in browser-like runtimes.
import { importFreshModule } from "nodoassist/plugin-sdk/test-fixtures";
import { afterEach, describe, expect, it, vi } from "vitest";

type LoggerModule = typeof import("./logger.js");

const originalGetBuiltinModule = (
  process as NodeJS.Process & { getBuiltinModule?: (id: string) => unknown }
).getBuiltinModule;

async function importBrowserSafeLogger(params?: {
  resolvePreferredNodoAssistTmpDir?: ReturnType<typeof vi.fn>;
}): Promise<{
  module: LoggerModule;
  resolvePreferredNodoAssistTmpDir: ReturnType<typeof vi.fn>;
}> {
  const resolvePreferredNodoAssistTmpDir =
    params?.resolvePreferredNodoAssistTmpDir ??
    vi.fn(() => {
      throw new Error("resolvePreferredNodoAssistTmpDir should not run during browser-safe import");
    });

  vi.doMock("../infra/tmp-nodoassist-dir.js", async () => {
    const actual = await vi.importActual<typeof import("../infra/tmp-nodoassist-dir.js")>(
      "../infra/tmp-nodoassist-dir.js",
    );
    return {
      ...actual,
      resolvePreferredNodoAssistTmpDir,
    };
  });

  Object.defineProperty(process, "getBuiltinModule", {
    configurable: true,
    value: undefined,
  });

  const module = await importFreshModule<LoggerModule>(
    import.meta.url,
    "./logger.js?scope=browser-safe",
  );
  return { module, resolvePreferredNodoAssistTmpDir };
}

describe("logging/logger browser-safe import", () => {
  afterEach(() => {
    vi.doUnmock("../infra/tmp-nodoassist-dir.js");
    Object.defineProperty(process, "getBuiltinModule", {
      configurable: true,
      value: originalGetBuiltinModule,
    });
  });

  it("does not resolve the preferred temp dir at import time when node fs is unavailable", async () => {
    const { module, resolvePreferredNodoAssistTmpDir } = await importBrowserSafeLogger();

    expect(resolvePreferredNodoAssistTmpDir).not.toHaveBeenCalled();
    expect(module.DEFAULT_LOG_DIR).toBe("/tmp/nodoassist");
    expect(module.DEFAULT_LOG_FILE).toBe("/tmp/nodoassist/nodoassist.log");
  });

  it("disables file logging when imported in a browser-like environment", async () => {
    const { module, resolvePreferredNodoAssistTmpDir } = await importBrowserSafeLogger();

    expect(module.getResolvedLoggerSettings()).toStrictEqual({
      level: "silent",
      file: "/tmp/nodoassist/nodoassist.log",
      maxFileBytes: 100 * 1024 * 1024,
    });
    expect(module.isFileLogLevelEnabled("info")).toBe(false);
    expect(module.getLogger().info("browser-safe")).toBeUndefined();
    expect(resolvePreferredNodoAssistTmpDir).not.toHaveBeenCalled();
  });
});
