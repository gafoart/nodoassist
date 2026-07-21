// Tests install shell script version references stay aligned with package metadata.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { cleanupTempDirs, makeTempDir } from "../test/helpers/temp-dir.js";

const tempRoots: string[] = [];
const installerPath = path.join(process.cwd(), "scripts", "install.sh");
const installerSource = fs.readFileSync(installerPath, "utf-8");
const versionHelperStart = installerSource.indexOf("load_install_version_helpers() {");
const versionHelperEnd = installerSource.indexOf("\nis_gateway_daemon_loaded() {");

if (versionHelperStart < 0 || versionHelperEnd < 0) {
  throw new Error("install.sh version helper block not found");
}

const versionHelperSource = installerSource.slice(versionHelperStart, versionHelperEnd);

function resolveInstallerVersionCases(params: { stdinCwd: string }): string[] {
  const output = execFileSync(
    "bash",
    [
      "-c",
      `${versionHelperSource}
fake_nodoassist_decorated() { printf '%s\\n' 'NodoAssist 2026.3.10 (abcdef0)'; }
fake_nodoassist_raw() { printf '%s\\n' "NodoAssist dev's build"; }
NODOASSIST_BIN=fake_nodoassist_decorated resolve_nodoassist_version
NODOASSIST_BIN=fake_nodoassist_raw resolve_nodoassist_version
(
  cd "$1"
  source /dev/stdin <<'NODOASSIST_STDIN_INSTALLER'
${versionHelperSource}
fake_nodoassist_stdin() { printf '%s\\n' 'NodoAssist 2026.3.10 (abcdef0)'; }
NODOASSIST_BIN=fake_nodoassist_stdin
resolve_nodoassist_version
NODOASSIST_STDIN_INSTALLER
)`,
      "nodoassist-version-test",
      params.stdinCwd,
    ],
    {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: {
        ...process.env,
        NODOASSIST_INSTALL_SH_NO_RUN: "1",
      },
    },
  );
  return output.trimEnd().split("\n");
}

describe("install.sh version resolution", () => {
  afterEach(() => {
    cleanupTempDirs(tempRoots);
  });

  it.runIf(process.platform !== "win32")(
    "parses CLI versions and keeps stdin helpers isolated from cwd",
    () => {
      const hostileCwd = makeTempDir(tempRoots, "nodoassist-install-stdin-");
      const hostileHelper = path.join(
        hostileCwd,
        "docker",
        "install-sh-common",
        "version-parse.sh",
      );
      fs.mkdirSync(path.dirname(hostileHelper), { recursive: true });
      fs.writeFileSync(
        hostileHelper,
        `#!/usr/bin/env bash
extract_nodoassist_semver() {
  printf '%s' 'poisoned'
}
`,
        "utf-8",
      );

      expect(
        resolveInstallerVersionCases({
          stdinCwd: hostileCwd,
        }),
      ).toEqual(["2026.3.10", "NodoAssist dev's build", "2026.3.10"]);
    },
  );
});
