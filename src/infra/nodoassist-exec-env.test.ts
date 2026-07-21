// Tests NodoAssist execution environment construction.
import { describe, expect, it } from "vitest";
import { deleteTestEnvValue, setTestEnvValue } from "../test-utils/env.js";
import {
  ensureNodoAssistExecMarkerOnProcess,
  markNodoAssistExecEnv,
  NODOASSIST_CLI_ENV_VALUE,
  NODOASSIST_CLI_ENV_VAR,
} from "./nodoassist-exec-env.js";

describe("markNodoAssistExecEnv", () => {
  it("returns a cloned env object with the exec marker set", () => {
    const env = { PATH: "/usr/bin", NODOASSIST_CLI: "0" };
    const marked = markNodoAssistExecEnv(env);

    expect(marked).toEqual({
      PATH: "/usr/bin",
      NODOASSIST_CLI: NODOASSIST_CLI_ENV_VALUE,
    });
    expect(marked).not.toBe(env);
    expect(env.NODOASSIST_CLI).toBe("0");
  });
});

describe("ensureNodoAssistExecMarkerOnProcess", () => {
  it.each([
    {
      name: "mutates and returns the provided process env",
      env: { PATH: "/usr/bin" } as NodeJS.ProcessEnv,
    },
    {
      name: "overwrites an existing marker on the provided process env",
      env: { PATH: "/usr/bin", [NODOASSIST_CLI_ENV_VAR]: "0" } as NodeJS.ProcessEnv,
    },
  ])("$name", ({ env }) => {
    expect(ensureNodoAssistExecMarkerOnProcess(env)).toBe(env);
    expect(env[NODOASSIST_CLI_ENV_VAR]).toBe(NODOASSIST_CLI_ENV_VALUE);
  });

  it("defaults to mutating process.env when no env object is provided", () => {
    const previous = process.env[NODOASSIST_CLI_ENV_VAR];
    deleteTestEnvValue(NODOASSIST_CLI_ENV_VAR);

    try {
      expect(ensureNodoAssistExecMarkerOnProcess()).toBe(process.env);
      expect(process.env[NODOASSIST_CLI_ENV_VAR]).toBe(NODOASSIST_CLI_ENV_VALUE);
    } finally {
      if (previous === undefined) {
        deleteTestEnvValue(NODOASSIST_CLI_ENV_VAR);
      } else {
        setTestEnvValue(NODOASSIST_CLI_ENV_VAR, previous);
      }
    }
  });
});
