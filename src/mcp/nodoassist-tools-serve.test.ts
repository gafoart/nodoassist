// NodoAssist MCP tools tests cover core tool server startup and registration.
import { describe, expect, it } from "vitest";
import {
  buildCrestodianToolsMcpServerConfig,
  NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV,
  NODOASSIST_TOOLS_MCP_TOOLS_ENV,
  resolveNodoAssistToolsMcpCrestodianSurface,
  resolveNodoAssistToolsMcpToolSelection,
} from "./nodoassist-tools-serve-config.js";
import {
  NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
  resolveNodoAssistToolsForMcp,
  resolveNodoAssistToolsMcpAgentSessionKey,
} from "./nodoassist-tools-serve.js";
import { createPluginToolsMcpHandlers } from "./plugin-tools-handlers.js";

describe("NodoAssist tools MCP server", () => {
  it("exposes cron", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveNodoAssistToolsForMcp({ agentSessionKey: "agent:worker:main" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toContain("cron");
  });

  it("requires the managed bridge to pass a real agent session key", () => {
    expect(() => resolveNodoAssistToolsForMcp({ agentSessionKey: "" })).toThrow(
      NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV,
    );
  });

  it("reads the managed bridge agent session key from env", () => {
    expect(
      resolveNodoAssistToolsMcpAgentSessionKey({
        [NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV]: " agent:worker:main ",
      }),
    ).toBe("agent:worker:main");
  });

  it("serves the ring-zero crestodian tool without an agent session key", async () => {
    const handlers = createPluginToolsMcpHandlers(
      resolveNodoAssistToolsForMcp({ tools: ["crestodian"], crestodianSurface: "cli" }),
    );

    const listed = await handlers.listTools();
    expect(listed.tools.map((tool) => tool.name)).toEqual(["crestodian"]);
  });

  it("parses the served tool selection from env and defaults to cron", () => {
    expect(resolveNodoAssistToolsMcpToolSelection({})).toEqual(["cron"]);
    expect(
      resolveNodoAssistToolsMcpToolSelection({
        [NODOASSIST_TOOLS_MCP_TOOLS_ENV]: " crestodian , cron ",
      }),
    ).toEqual(["crestodian", "cron"]);
    expect(() =>
      resolveNodoAssistToolsMcpToolSelection({ [NODOASSIST_TOOLS_MCP_TOOLS_ENV]: "exec" }),
    ).toThrow(NODOASSIST_TOOLS_MCP_TOOLS_ENV);
  });

  it("parses the crestodian surface from env and defaults to cli", () => {
    expect(resolveNodoAssistToolsMcpCrestodianSurface({})).toBe("cli");
    expect(
      resolveNodoAssistToolsMcpCrestodianSurface({
        [NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "gateway",
      }),
    ).toBe("gateway");
    expect(() =>
      resolveNodoAssistToolsMcpCrestodianSurface({
        [NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "remote",
      }),
    ).toThrow(NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV);
  });

  it("builds a crestodian-only stdio server config under the nodoassist name", () => {
    const config = buildCrestodianToolsMcpServerConfig({ surface: "gateway" });

    expect(Object.keys(config.mcpServers)).toEqual(["nodoassist"]);
    const server = config.mcpServers.nodoassist as {
      command?: string;
      args?: string[];
      env?: Record<string, string>;
    };
    expect(server.command).toBe(process.execPath);
    expect(server.args?.at(-1)).toMatch(/nodoassist-tools-serve\.(js|ts)$/);
    expect(server.env).toEqual({
      [NODOASSIST_TOOLS_MCP_TOOLS_ENV]: "crestodian",
      [NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV]: "gateway",
    });
  });
});
