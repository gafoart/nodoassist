import fs from "node:fs/promises";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useAutoCleanupTempDirTracker } from "../../test/helpers/temp-dir.js";

const resolvePreferredNodoAssistTmpDirMock = vi.hoisted(() => vi.fn());

vi.mock("./tmp-nodoassist-dir.js", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./tmp-nodoassist-dir.js")>();
  return {
    ...actual,
    resolvePreferredNodoAssistTmpDir: resolvePreferredNodoAssistTmpDirMock,
  };
});

import { withTempDir } from "./install-source-utils.js";

describe("withTempDir private root", () => {
  const tempDirs = useAutoCleanupTempDirTracker(afterEach);

  it.runIf(process.platform !== "win32")(
    "preserves parent temp root permissions when using private NodoAssist temp root",
    async () => {
      const mockParentRoot = tempDirs.make("nodoassist-chmod-test-");
      const mockNodoAssistDir = path.join(mockParentRoot, "nodoassist");

      await fs.mkdir(mockNodoAssistDir, { recursive: true });
      await fs.chmod(mockParentRoot, 0o1777);
      const canonicalNodoAssistDir = await fs.realpath(mockNodoAssistDir);

      resolvePreferredNodoAssistTmpDirMock.mockReturnValue(mockNodoAssistDir);

      let observedDir = "";
      const value = await withTempDir("nodoassist-test-", async (tmpDir) => {
        observedDir = tmpDir;
        expect(path.dirname(tmpDir)).toBe(canonicalNodoAssistDir);
        await fs.writeFile(path.join(tmpDir, "marker.txt"), "ok");
        return "done";
      });

      expect(value).toBe("done");

      await expect(
        fs.stat(observedDir).then(
          () => true,
          () => false,
        ),
      ).resolves.toBe(false);

      const privateRootStat = await fs.stat(mockNodoAssistDir);
      expect(privateRootStat.mode & 0o7777).toBe(0o700);

      const parentStat = await fs.stat(mockParentRoot);
      expect(parentStat.mode & 0o7777).toBe(0o1777);
    },
  );
});
