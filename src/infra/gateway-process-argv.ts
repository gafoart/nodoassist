// Parses gateway process command lines for process discovery.
import { normalizeLowercaseStringOrEmpty } from "@nodoassist/normalization-core/string-coerce";
import { normalizeStringEntries } from "@nodoassist/normalization-core/string-normalization";

function normalizeProcArg(arg: string): string {
  return normalizeLowercaseStringOrEmpty(arg.replaceAll("\\", "/"));
}

export function parseProcCmdline(raw: string): string[] {
  return normalizeStringEntries(raw.split("\0"));
}

export function isGatewayArgv(args: string[], opts?: { allowGatewayBinary?: boolean }): boolean {
  const normalized = args.map(normalizeProcArg);
  const exe = (normalized[0] ?? "").replace(/\.(bat|cmd|exe)$/i, "");
  const isGatewayBinary = exe.endsWith("/nodoassist-gateway") || exe === "nodoassist-gateway";
  if (!normalized.includes("gateway")) {
    return opts?.allowGatewayBinary === true && isGatewayBinary;
  }

  const entryCandidates = [
    "dist/index.js",
    "dist/entry.js",
    "nodoassist.mjs",
    "scripts/run-node.mjs",
    "src/entry.ts",
    "src/index.ts",
  ];
  if (normalized.some((arg) => entryCandidates.some((entry) => arg.endsWith(entry)))) {
    return true;
  }

  return (
    exe.endsWith("/nodoassist") ||
    exe === "nodoassist" ||
    (opts?.allowGatewayBinary === true && isGatewayBinary)
  );
}
