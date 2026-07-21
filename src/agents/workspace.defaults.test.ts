// Workspace default tests cover environment-variable precedence for the
// built-in agent workspace location.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { withEnv } from "../test-utils/env.js";
import { resolveDefaultAgentWorkspaceDir } from "./workspace.js";

describe("DEFAULT_AGENT_WORKSPACE_DIR", () => {
  it("uses NODOASSIST_HOME when resolving the default workspace dir", () => {
    const home = path.join(path.sep, "srv", "nodoassist-home");

    const resolved = withEnv(
      {
        NODOASSIST_WORKSPACE_DIR: undefined,
        NODOASSIST_PROFILE: undefined,
        NODOASSIST_HOME: home,
        HOME: path.join(path.sep, "home", "other"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.join(path.resolve(home), ".nodoassist", "workspace"));
  });

  it("uses NODOASSIST_WORKSPACE_DIR before NODOASSIST_HOME", () => {
    const workspaceDir = path.join(path.sep, "srv", "nodoassist-workspace");

    const resolved = withEnv(
      {
        NODOASSIST_WORKSPACE_DIR: workspaceDir,
        NODOASSIST_HOME: path.join(path.sep, "srv", "nodoassist-home"),
      },
      () => resolveDefaultAgentWorkspaceDir(),
    );

    expect(resolved).toBe(path.resolve(workspaceDir));
  });
});
