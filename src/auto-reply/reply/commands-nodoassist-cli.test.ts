import { createRequire } from "node:module";
// Verifies chat-facing CLI snippets execute the NodoAssist CLI even from harness-hosted gateways.
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  buildCurrentNodoAssistCliArgv,
  buildCurrentNodoAssistCliExecEnv,
} from "./commands-nodoassist-cli.js";

const requireFromHere = createRequire(import.meta.url);
const originalArgv = [...process.argv];
const repoSourceEntry = path.join(process.cwd(), "src", "entry.ts");
const trustedTsxLoader = requireFromHere.resolve("tsx", { paths: [process.cwd()] });

function setArgv1(value: string): void {
  process.argv.splice(0, process.argv.length, process.execPath, value);
}

describe("buildCurrentNodoAssistCliArgv", () => {
  afterEach(() => {
    process.argv.splice(0, process.argv.length, ...originalArgv);
  });

  it("falls back to the package CLI entry when hosted by a test harness", () => {
    setArgv1(path.join(process.cwd(), "scripts", "test-live.mjs"));

    expect(buildCurrentNodoAssistCliArgv(["sessions", "export-trajectory"])).toEqual([
      process.execPath,
      "--import",
      trustedTsxLoader,
      repoSourceEntry,
      "sessions",
      "export-trajectory",
    ]);
  });

  it("preserves a real NodoAssist launcher entry", () => {
    setArgv1("/opt/nodoassist/nodoassist.mjs");

    expect(buildCurrentNodoAssistCliArgv(["sessions", "export-trajectory"])).toEqual([
      process.execPath,
      ...process.execArgv,
      "/opt/nodoassist/nodoassist.mjs",
      "sessions",
      "export-trajectory",
    ]);
  });

  it("preserves NodoAssist dist entries from the package root", () => {
    const distEntry = path.join(process.cwd(), "dist", "entry.js");
    setArgv1(distEntry);

    expect(buildCurrentNodoAssistCliArgv(["sessions", "export-trajectory"])).toEqual([
      process.execPath,
      ...process.execArgv,
      distEntry,
      "sessions",
      "export-trajectory",
    ]);
  });

  it("preserves NodoAssist source entries from the package root", () => {
    const sourceEntry = path.join(process.cwd(), "src", "entry.ts");
    setArgv1(sourceEntry);

    expect(buildCurrentNodoAssistCliArgv(["sessions", "export-trajectory"])).toEqual([
      process.execPath,
      ...process.execArgv,
      sourceEntry,
      "sessions",
      "export-trajectory",
    ]);
  });

  it("does not treat foreign dist entries as NodoAssist launchers", () => {
    setArgv1("/app/dist/index.js");

    expect(buildCurrentNodoAssistCliArgv(["sessions", "export-trajectory"])).toEqual([
      process.execPath,
      "--import",
      trustedTsxLoader,
      repoSourceEntry,
      "sessions",
      "export-trajectory",
    ]);
  });

  it("clears inherited Vitest runner environment for CLI child processes", () => {
    expect(
      buildCurrentNodoAssistCliExecEnv({
        PATH: "/usr/bin",
        VITEST: "true",
        VITEST_POOL_ID: "pool",
        NODOASSIST_VITEST_MAX_WORKERS: "1",
      }),
    ).toEqual({
      VITEST: "",
      VITEST_POOL_ID: "",
      NODOASSIST_VITEST_MAX_WORKERS: "",
    });
  });
});
