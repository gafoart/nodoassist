// Profile CLI tests cover profile selection, persistence, and command wiring.
import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "nodoassist", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("leaves gateway --dev for subcommands after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nodoassist",
      "--no-color",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "nodoassist", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "nodoassist", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "nodoassist", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "status"]);
  });

  it("parses interleaved --profile after the command token", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "status",
      "--profile",
      "work",
      "--deep",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "status", "--deep"]);
  });

  it("preserves Matrix QA --profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nodoassist",
      "qa",
      "matrix",
      "--profile",
      "fast",
      "--fail-fast",
    ]);
  });

  it("preserves Matrix QA --profile after leading root options", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nodoassist",
      "--no-color",
      "qa",
      "matrix",
      "--profile=fast",
    ]);
  });

  it("parses qa run --profile smoke-ci as a root profile", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--profile",
      "smoke-ci",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("smoke-ci");
    expect(res.argv).toEqual([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--category",
      "agent-runtime-and-provider-execution.agent-turn-execution",
    ]);
  });

  it("parses qa run --profile=release self-check invocations as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--profile=release",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("release");
    expect(res.argv).toEqual(["node", "nodoassist", "qa", "run", "--output", "qa-report.md"]);
  });

  it("preserves qa run --qa-profile for the command parser", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
      "--surface",
      "agent-runtime-and-provider-execution",
    ]);
  });

  it("parses arbitrary qa run --profile values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--profile",
      "work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "qa", "run", "--output", "qa-report.md"]);
  });

  it("parses arbitrary qa run --profile= values as root profiles", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "qa",
      "run",
      "--profile=work",
      "--output",
      "qa-report.md",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "qa", "run", "--output", "qa-report.md"]);
  });

  it("still parses root --profile before qa run", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "--profile",
      "work",
      "qa",
      "run",
      "--qa-profile",
      "smoke-ci",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "qa", "run", "--qa-profile", "smoke-ci"]);
  });

  it("still parses root --profile before Matrix QA", () => {
    const res = parseCliProfileArgs([
      "node",
      "nodoassist",
      "--profile",
      "work",
      "qa",
      "matrix",
      "--fail-fast",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "nodoassist", "qa", "matrix", "--fail-fast"]);
  });

  it("parses interleaved --dev after the command token", () => {
    const res = parseCliProfileArgs(["node", "nodoassist", "status", "--dev"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "nodoassist", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "nodoassist", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "nodoassist", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "nodoassist", "--profile", "work", "--dev", "status"]],
    ["interleaved after command", ["node", "nodoassist", "status", "--profile", "work", "--dev"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".nodoassist-dev");
    expect(env.NODOASSIST_PROFILE).toBe("dev");
    expect(env.NODOASSIST_STATE_DIR).toBe(expectedStateDir);
    expect(env.NODOASSIST_CONFIG_PATH).toBe(path.join(expectedStateDir, "nodoassist.json"));
    expect(env.NODOASSIST_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      NODOASSIST_PROFILE: "prod",
      NODOASSIST_STATE_DIR: "/custom",
      NODOASSIST_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.NODOASSIST_PROFILE).toBe("dev");
    expect(env.NODOASSIST_STATE_DIR).toBe("/custom");
    expect(env.NODOASSIST_GATEWAY_PORT).toBe("19099");
    expect(env.NODOASSIST_CONFIG_PATH).toBe(path.join("/custom", "nodoassist.json"));
  });

  it("uses NODOASSIST_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      NODOASSIST_HOME: "/srv/nodoassist-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/nodoassist-home");
    expect(env.NODOASSIST_STATE_DIR).toBe(path.join(resolvedHome, ".nodoassist-work"));
    expect(env.NODOASSIST_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".nodoassist-work", "nodoassist.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "nodoassist doctor --fix",
      env: {},
      expected: "nodoassist doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "nodoassist doctor --fix",
      env: { NODOASSIST_PROFILE: "default" },
      expected: "nodoassist doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "nodoassist doctor --fix",
      env: { NODOASSIST_PROFILE: "Default" },
      expected: "nodoassist doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "nodoassist doctor --fix",
      env: { NODOASSIST_PROFILE: "bad profile" },
      expected: "nodoassist doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "nodoassist --profile work doctor --fix",
      env: { NODOASSIST_PROFILE: "work" },
      expected: "nodoassist --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "nodoassist --dev doctor",
      env: { NODOASSIST_PROFILE: "dev" },
      expected: "nodoassist --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("nodoassist doctor --fix", { NODOASSIST_PROFILE: "work" })).toBe(
      "nodoassist --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(
      formatCliCommand("nodoassist doctor --fix", { NODOASSIST_PROFILE: "  jbnodoassist  " }),
    ).toBe("nodoassist --profile jbnodoassist doctor --fix");
  });

  it("handles command with no args after nodoassist", () => {
    expect(formatCliCommand("nodoassist", { NODOASSIST_PROFILE: "test" })).toBe(
      "nodoassist --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm nodoassist doctor", { NODOASSIST_PROFILE: "work" })).toBe(
      "pnpm nodoassist --profile work doctor",
    );
  });

  it("inserts --container when a container hint is set", () => {
    expect(
      formatCliCommand("nodoassist gateway status --deep", { NODOASSIST_CONTAINER_HINT: "demo" }),
    ).toBe("nodoassist --container demo gateway status --deep");
  });

  it("ignores unsafe container hints", () => {
    expect(
      formatCliCommand("nodoassist gateway status --deep", {
        NODOASSIST_CONTAINER_HINT: "demo; rm -rf /",
      }),
    ).toBe("nodoassist gateway status --deep");
  });

  it("preserves both --container and --profile hints", () => {
    expect(
      formatCliCommand("nodoassist doctor", {
        NODOASSIST_CONTAINER_HINT: "demo",
        NODOASSIST_PROFILE: "work",
      }),
    ).toBe("nodoassist --container demo doctor");
  });

  it("does not prepend --container for update commands", () => {
    expect(formatCliCommand("nodoassist update", { NODOASSIST_CONTAINER_HINT: "demo" })).toBe(
      "nodoassist update",
    );
    expect(
      formatCliCommand("pnpm nodoassist update --channel beta", {
        NODOASSIST_CONTAINER_HINT: "demo",
      }),
    ).toBe("pnpm nodoassist update --channel beta");
  });
});
