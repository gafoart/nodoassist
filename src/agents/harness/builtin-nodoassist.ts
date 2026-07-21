/**
 * Built-in NodoAssist harness registration.
 *
 * Harness selection uses this factory to expose the embedded NodoAssist runtime
 * through the same AgentHarness contract as external harness plugins.
 */
import { NODOASSIST_EMBEDDED_CONTEXT_ENGINE_HOST } from "../../context-engine/host-compat.js";
import { runEmbeddedAttempt } from "../embedded-agent-runner/run/attempt.js";
import type { AgentHarness } from "./types.js";

/** Creates the built-in harness backed by the embedded NodoAssist agent runner. */
export function createNodoAssistAgentHarness(): AgentHarness {
  return {
    id: "nodoassist",
    label: "NodoAssist embedded agent",
    contextEngineHostCapabilities: NODOASSIST_EMBEDDED_CONTEXT_ENGINE_HOST.capabilities,
    supports: () => ({ supported: true, priority: 0 }),
    runAttempt: runEmbeddedAttempt,
  };
}
