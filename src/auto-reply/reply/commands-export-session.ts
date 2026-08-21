// Builds export bundles for a session transcript and runtime context.
import fsp from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readAcpSessionMetaForEntry } from "../../acp/runtime/session-meta.js";
import {
  parseSessionFileEntriesWithWarnings,
  type SessionFileParseWarning,
} from "../../agents/sessions/session-file-parser.js";
import {
  migrateSessionEntries,
  type SessionEntry as AgentSessionEntry,
  type SessionHeader,
  type SessionMessageEntry,
} from "../../agents/sessions/session-manager.js";
import { scanSessionTranscriptTree } from "../../config/sessions/transcript-tree.js";
import type { SessionEntry as StoredSessionEntry } from "../../config/sessions/types.js";
import { pathExists } from "../../infra/fs-safe.js";
import type { ReplyPayload } from "../types.js";
import {
  isReplyPayload,
  parseExportCommandOutputPath,
  resolveExportCommandSessionTarget,
} from "./commands-export-common.js";
import { resolveCommandsSystemPromptBundle } from "./commands-system-prompt.js";
import type { HandleCommandsParams } from "./commands-types.js";

// Export HTML templates are bundled with this module
const EXPORT_HTML_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "export-html");

interface SessionData {
  header: SessionHeader | null;
  entries: AgentSessionEntry[];
  leafId: string | null;
  hasLeafControl: boolean;
  systemPrompt?: string;
  tools?: Array<{ name: string; description?: string; parameters?: unknown }>;
  warning?: string;
}

const BACKEND_DELEGATED_WARNING =
  "This session was handled by a backend runtime (e.g. CLI/ACP). Assistant replies, tool calls, and usage data are stored in the backend transcript and are not included in this export.";

function hasNonEmptyString(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasBackendSession(entry: StoredSessionEntry, hasStoredAcpSession: boolean): boolean {
  return (
    hasStoredAcpSession ||
    hasNonEmptyString(entry.claudeCliSessionId) ||
    Object.values(entry.cliSessionBindings ?? {}).some((binding) =>
      hasNonEmptyString(binding?.sessionId),
    ) ||
    Object.values(entry.cliSessionIds ?? {}).some(hasNonEmptyString)
  );
}

function hasPersistedAcpSession(params: {
  sessionKey: string;
  entry: StoredSessionEntry;
}): boolean {
  if (params.entry.acp) {
    return true;
  }
  try {
    return Boolean(readAcpSessionMetaForEntry(params));
  } catch {
    return false;
  }
}

function isBackendDelegatedSession(
  entry: StoredSessionEntry,
  entries: AgentSessionEntry[],
  hasStoredAcpSession: boolean,
): boolean {
  if (!hasBackendSession(entry, hasStoredAcpSession)) {
    return false;
  }
  if (entries.length === 0) {
    return false;
  }
  const messages = entries.filter(
    (transcriptEntry): transcriptEntry is SessionMessageEntry => transcriptEntry.type === "message",
  );
  return (
    messages.length > 0 &&
    messages.every((transcriptEntry) => transcriptEntry.message.role === "user")
  );
}

type SessionExportWarningSummary = {
  code: SessionFileParseWarning["code"];
  count: number;
  rows: number[];
};

async function loadTemplate(fileName: string): Promise<string> {
  return await fsp.readFile(path.join(EXPORT_HTML_DIR, fileName), "utf-8");
}

function replaceHtmlPlaceholder(template: string, name: string, value: string): string {
  let replaced = false;
  const placeholder = new RegExp(
    `(<(?:script|style)\\b(?=[^>]*\\bdata-nodoassist-export-placeholder="${name}")[^>]*>)(</(?:script|style)>)`,
  );
  const next = template.replace(
    placeholder,
    (_match: string, openTag: string, closeTag: string) => {
      replaced = true;
      const finalOpenTag = openTag.replace(/\sdata-nodoassist-export-placeholder="[^"]*"/, "");
      return `${finalOpenTag}${value}${closeTag}`;
    },
  );
  if (!replaced) {
    throw new Error(`Export HTML template missing ${name} placeholder`);
  }
  return next;
}

async function generateHtml(sessionData: SessionData): Promise<string> {
  const [template, templateCss, templateJs, markedJs, hljsJs] = await Promise.all([
    loadTemplate("template.html"),
    loadTemplate("template.css"),
    loadTemplate("template.js"),
    loadTemplate(path.join("vendor", "marked.min.js")),
    loadTemplate(path.join("vendor", "highlight.min.js")),
  ]);

  // Mirrors the bundled dark TUI theme (src/agents/modes/interactive/theme/dark.json).
  // Session exports are static HTML with no theme loader, so the palette is
  // inlined here; keep both in sync when the brand palette moves.
  const themeVars = `
    --cyan: #bde4a8;
    --blue: #3b82f6;
    --green: #22c55e;
    --red: #ef4444;
    --yellow: #f59e0b;
    --gray: #999ca3;
    --dimGray: #6f747f;
    --darkGray: #3a4150;
    --accent: #9ed77b;
    --selectedBg: #1a2030;
    --userMsgBg: #131823;
    --toolPendingBg: #161c28;
    --toolSuccessBg: #16241c;
    --toolErrorBg: #2a1719;
    --customMsgBg: #1c1830;
    --text: #e6e9f0;
    --dim: #6f747f;
    --muted: #999ca3;
    --border: #3a4150;
    --borderAccent: #9ed77b;
    --borderMuted: #252c3a;
    --success: #22c55e;
    --error: #ef4444;
    --warning: #f59e0b;
    --thinkingText: #999ca3;
    --userMessageBg: #131823;
    --userMessageText: #e6e9f0;
    --customMessageBg: #1c1830;
    --customMessageText: #e6e9f0;
    --customMessageLabel: #9575cd;
    --toolTitle: #e6e9f0;
    --toolOutput: #999ca3;
    --mdHeading: #bde4a8;
    --mdLink: #9ed77b;
    --mdLinkUrl: #6f747f;
    --mdCode: #9ed77b;
    --mdCodeBlock: #72b74e;
  `;
  const bodyBg = "#0b0e14";
  const containerBg = "#131823";
  const infoBg = "#1e2a17";

  // Base64 encode session data
  const sessionDataBase64 = Buffer.from(JSON.stringify(sessionData)).toString("base64");

  // Build CSS with theme variables
  const css = templateCss
    .replace("/* {{THEME_VARS}} */", themeVars.trim())
    .replace("/* {{BODY_BG_DECL}} */", `--body-bg: ${bodyBg};`)
    .replace("/* {{CONTAINER_BG_DECL}} */", `--container-bg: ${containerBg};`)
    .replace("/* {{INFO_BG_DECL}} */", `--info-bg: ${infoBg};`);

  return [
    ["CSS", css],
    ["SESSION_DATA", sessionDataBase64],
    ["MARKED_JS", markedJs],
    ["HIGHLIGHT_JS", hljsJs],
    ["JS", templateJs],
  ].reduce((html, [name, value]) => replaceHtmlPlaceholder(html, name, value), template);
}

function addCollisionSuffix(filePath: string, suffix: number): string {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  return path.join(path.dirname(filePath), `${baseName}-${suffix}${ext}`);
}

async function writeNewDefaultExportFile(filePath: string, html: string): Promise<string> {
  for (let suffix = 1; suffix <= 100; suffix++) {
    const candidate = suffix === 1 ? filePath : addCollisionSuffix(filePath, suffix);
    try {
      await fsp.writeFile(candidate, html, { encoding: "utf-8", flag: "wx" });
      return candidate;
    } catch (error) {
      if (typeof error === "object" && error && "code" in error && error.code === "EEXIST") {
        continue;
      }
      throw error;
    }
  }
  throw new Error(`Could not find an unused export filename near ${filePath}`);
}

function summarizeSessionExportWarnings(
  warnings: SessionFileParseWarning[],
): SessionExportWarningSummary[] {
  const summaries = new Map<SessionFileParseWarning["code"], SessionExportWarningSummary>();
  for (const warning of warnings) {
    const summary = summaries.get(warning.code);
    if (summary) {
      summary.count += 1;
      if (summary.rows.length < 20) {
        summary.rows.push(warning.row);
      }
      continue;
    }
    summaries.set(warning.code, {
      code: warning.code,
      count: 1,
      rows: [warning.row],
    });
  }
  return [...summaries.values()];
}

function formatSkippedRows(count: number): string {
  return `${count.toLocaleString()} malformed transcript ${count === 1 ? "row" : "rows"}`;
}

function formatSessionExportWarning(summary: SessionExportWarningSummary): string {
  const rows = summary.rows.length > 0 ? ` rows ${summary.rows.join(", ")}` : "";
  const verb = summary.count === 1 ? "was" : "were";
  switch (summary.code) {
    case "invalid-session-json":
      return `⚠️ Skipped ${formatSkippedRows(summary.count)} that ${verb} not valid JSON.${rows}`;
    case "invalid-session-row":
      return summary.count === 1
        ? `⚠️ Skipped ${formatSkippedRows(summary.count)} that was not a session entry.${rows}`
        : `⚠️ Skipped ${formatSkippedRows(summary.count)} that were not session entries.${rows}`;
  }
  const unreachable: never = summary.code;
  return unreachable;
}

async function readSessionDataFromTranscript(sessionFile: string): Promise<{
  header: SessionHeader | null;
  entries: AgentSessionEntry[];
  leafId: string | null;
  hasLeafControl: boolean;
  warnings: SessionExportWarningSummary[];
}> {
  const raw = await fsp.readFile(sessionFile, "utf-8");
  const { entries: fileEntries, warnings } = parseSessionFileEntriesWithWarnings(raw);
  migrateSessionEntries(fileEntries);
  const header =
    fileEntries.find((entry): entry is SessionHeader => entry.type === "session") ?? null;
  const rawEntries = fileEntries.filter(
    (entry): entry is AgentSessionEntry => entry.type !== "session",
  );
  const tree = scanSessionTranscriptTree(rawEntries);
  const hasLeafControl = tree.hasLeafControl;
  const entries = hasLeafControl
    ? rawEntries.map((entry) => {
        const node = tree.byId.get(entry.id);
        return node && entry.parentId !== node.parentId
          ? ({ ...entry, parentId: node.parentId } as AgentSessionEntry)
          : entry;
      })
    : rawEntries;
  return {
    header,
    entries,
    leafId: tree.leafId,
    hasLeafControl,
    warnings: summarizeSessionExportWarnings(warnings),
  };
}

export async function buildExportSessionReply(params: HandleCommandsParams): Promise<ReplyPayload> {
  const args = parseExportCommandOutputPath(params.command.commandBodyNormalized, [
    "export-session",
    "export",
  ]);
  if (args.error) {
    return { text: args.error };
  }
  const sessionTarget = resolveExportCommandSessionTarget(params);
  if (isReplyPayload(sessionTarget)) {
    return sessionTarget;
  }
  const { entry, sessionFile } = sessionTarget;

  if (!(await pathExists(sessionFile))) {
    return { text: `❌ Session file not found: ${sessionFile}` };
  }

  // 2. Load session entries
  const { entries, header, leafId, hasLeafControl, warnings } =
    await readSessionDataFromTranscript(sessionFile);

  // 3. Build full system prompt
  const { systemPrompt, tools } = await resolveCommandsSystemPromptBundle({
    ...params,
    sessionEntry: entry as HandleCommandsParams["sessionEntry"],
  });

  // 4. Prepare session data
  const hasStoredAcpSession = hasPersistedAcpSession({
    sessionKey: params.sessionKey,
    entry,
  });
  const backendWarning = isBackendDelegatedSession(entry, entries, hasStoredAcpSession)
    ? BACKEND_DELEGATED_WARNING
    : undefined;
  const sessionData: SessionData = {
    header,
    entries,
    leafId,
    hasLeafControl,
    systemPrompt,
    tools: tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    })),
    warning: backendWarning,
  };

  // 5. Generate HTML
  const html = await generateHtml(sessionData);

  // 6. Determine output path
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  const defaultFileName = `nodoassist-session-${entry.sessionId.slice(0, 8)}-${timestamp}.html`;
  let outputPath = args.outputPath
    ? path.resolve(
        args.outputPath.startsWith("~")
          ? args.outputPath.replace("~", process.env.HOME ?? "")
          : args.outputPath,
      )
    : path.join(params.workspaceDir, defaultFileName);

  // Ensure directory exists
  const outputDir = path.dirname(outputPath);
  await fsp.mkdir(outputDir, { recursive: true });

  // 7. Write file
  if (args.outputPath) {
    await fsp.writeFile(outputPath, html, "utf-8");
  } else {
    outputPath = await writeNewDefaultExportFile(outputPath, html);
  }

  const relativePath = path.relative(params.workspaceDir, outputPath);
  const displayPath = relativePath.startsWith("..") ? outputPath : relativePath;

  return {
    text: [
      "✅ Session exported!",
      "",
      `📄 File: ${displayPath}`,
      `📊 Entries: ${entries.length}`,
      ...warnings.map(formatSessionExportWarning),
      ...(backendWarning ? [`⚠️ ${backendWarning}`] : []),
      `🧠 System prompt: ${systemPrompt.length.toLocaleString()} chars`,
      `🔧 Tools: ${tools.length}`,
    ].join("\n"),
  };
}
