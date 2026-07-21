import { describe, expect, it } from "vitest";
import {
  nodoAssistNpmPrepublishVerifyUsage,
  parseNodoAssistNpmPrepublishVerifyArgs,
  usesPreparedLocalDependencyInstall,
} from "../scripts/nodoassist-npm-prepublish-verify.ts";

describe("parseNodoAssistNpmPrepublishVerifyArgs", () => {
  it("supports help, optional versions, and package-manager separators", () => {
    expect(parseNodoAssistNpmPrepublishVerifyArgs(["--help"])).toEqual({
      dependencyTarballPaths: [],
      help: true,
      tarballPath: "",
    });
    expect(parseNodoAssistNpmPrepublishVerifyArgs(["nodoassist.tgz"])).toEqual({
      dependencyTarballPaths: [],
      help: false,
      tarballPath: "nodoassist.tgz",
    });
    expect(parseNodoAssistNpmPrepublishVerifyArgs(["--", "nodoassist.tgz", "2026.3.23"])).toEqual({
      dependencyTarballPaths: [],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "nodoassist.tgz",
    });
  });

  it("rejects missing, option-like, and extra arguments before installing", () => {
    expect(() => parseNodoAssistNpmPrepublishVerifyArgs([])).toThrow(
      nodoAssistNpmPrepublishVerifyUsage(),
    );
    expect(() => parseNodoAssistNpmPrepublishVerifyArgs(["--tag"])).toThrow(
      "Unknown nodoassist npm prepublish verifier option: --tag",
    );
    expect(() => parseNodoAssistNpmPrepublishVerifyArgs(["nodoassist.tgz", "--tag"])).toThrow(
      "Unknown nodoassist npm prepublish verifier option: --tag",
    );
    expect(
      parseNodoAssistNpmPrepublishVerifyArgs([
        "nodoassist.tgz",
        "2026.3.23",
        "llm-core.tgz",
        "ai.tgz",
      ]),
    ).toEqual({
      dependencyTarballPaths: ["llm-core.tgz", "ai.tgz"],
      expectedVersion: "2026.3.23",
      help: false,
      tarballPath: "nodoassist.tgz",
    });
    expect(() =>
      parseNodoAssistNpmPrepublishVerifyArgs(["nodoassist.tgz", "2026.3.23", "--bad"]),
    ).toThrow("Invalid dependency tarball path: --bad");
  });
});

describe("usesPreparedLocalDependencyInstall", () => {
  it("uses the prepared local project only for the single AI tarball release path", () => {
    expect(usesPreparedLocalDependencyInstall(0)).toBe(false);
    expect(usesPreparedLocalDependencyInstall(1)).toBe(true);
    expect(usesPreparedLocalDependencyInstall(2)).toBe(false);
  });
});
