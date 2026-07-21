/**
 * Standalone MCP server for selected built-in NodoAssist tools.
 *
 * Run via: node --import tsx src/mcp/nodoassist-tools-serve.ts
 * Or: bun src/mcp/nodoassist-tools-serve.ts
 */
import { pathToFileURL } from "node:url";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import type { AnyAgentTool } from "../agents/tools/common.js";
import { createCrestodianTool } from "../agents/tools/crestodian-tool.js";
import type { CrestodianToolOptions } from "../agents/tools/crestodian-tool.js";
import { createCronTool } from "../agents/tools/cron-tool.js";
import { formatErrorMessage } from "../infra/errors.js";
import {
  resolveNodoAssistToolsMcpCrestodianApproval,
  resolveNodoAssistToolsMcpCrestodianSurface,
  resolveNodoAssistToolsMcpToolSelection,
  type NodoAssistToolsMcpToolId,
} from "./nodoassist-tools-serve-config.js";
import { connectToolsMcpServerToStdio, createToolsMcpServer } from "./tools-stdio-server.js";

export {
  NODOASSIST_TOOLS_MCP_CRESTODIAN_SURFACE_ENV,
  NODOASSIST_TOOLS_MCP_TOOLS_ENV,
} from "./nodoassist-tools-serve-config.js";

export const NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV = "NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY";

export function resolveNodoAssistToolsMcpAgentSessionKey(
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return env[NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV]?.trim() || undefined;
}

export function resolveNodoAssistToolsForMcp(
  params: {
    agentSessionKey?: string;
    tools?: NodoAssistToolsMcpToolId[];
    crestodianSurface?: CrestodianToolOptions["surface"];
  } = {},
): AnyAgentTool[] {
  const selection = params.tools ?? resolveNodoAssistToolsMcpToolSelection();
  return selection.map((tool) => {
    if (tool === "crestodian") {
      return createCrestodianTool({
        surface: params.crestodianSurface ?? resolveNodoAssistToolsMcpCrestodianSurface(),
        ...resolveNodoAssistToolsMcpCrestodianApproval(),
      });
    }
    const agentSessionKey = (
      params.agentSessionKey ?? resolveNodoAssistToolsMcpAgentSessionKey()
    )?.trim();
    if (!agentSessionKey) {
      throw new Error(`${NODOASSIST_TOOLS_MCP_AGENT_SESSION_KEY_ENV} is required`);
    }
    return createCronTool({ agentSessionKey, creatorToolAllowlist: [{ name: "cron" }] });
  });
}

function createNodoAssistToolsMcpServer(
  params: {
    tools?: AnyAgentTool[];
  } = {},
): Server {
  const tools = params.tools ?? resolveNodoAssistToolsForMcp();
  return createToolsMcpServer({ name: "nodoassist-tools", tools });
}

async function serveNodoAssistToolsMcp(): Promise<void> {
  const server = createNodoAssistToolsMcpServer();
  await connectToolsMcpServerToStdio(server);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  serveNodoAssistToolsMcp().catch((err: unknown) => {
    process.stderr.write(`nodoassist-tools-serve: ${formatErrorMessage(err)}\n`);
    process.exit(1);
  });
}
