/**
 * Resolves whether Codex app-server profiling instrumentation is enabled by
 * NodoAssist diagnostic flags.
 */
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { isDiagnosticFlagEnabled } from "nodoassist/plugin-sdk/diagnostic-runtime";

const PROFILER_FLAGS = ["profiler", "codex.profiler"] as const;

/** Checks the generic and Codex-specific profiler diagnostic flags. */
export function isCodexAppServerProfilerEnabled(
  config?: NodoAssistConfig,
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return PROFILER_FLAGS.some((flag) => isDiagnosticFlagEnabled(flag, config, env));
}
