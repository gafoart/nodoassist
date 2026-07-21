// Resolves cleanup inputs from current NodoAssist config and state paths.
import {
  getRuntimeConfig,
  resolveConfigPath,
  resolveOAuthDir,
  resolveStateDir,
} from "../config/config.js";
import type { NodoAssistConfig } from "../config/types.nodoassist.js";
import { buildCleanupPlan } from "./cleanup-utils.js";

/** Build the cleanup plan for the current runtime config/state/credential paths on disk. */
export function resolveCleanupPlanFromDisk(): {
  cfg: NodoAssistConfig;
  stateDir: string;
  configPath: string;
  oauthDir: string;
  configInsideState: boolean;
  oauthInsideState: boolean;
  workspaceDirs: string[];
} {
  const cfg = getRuntimeConfig();
  const stateDir = resolveStateDir();
  const configPath = resolveConfigPath();
  const oauthDir = resolveOAuthDir();
  const plan = buildCleanupPlan({ cfg, stateDir, configPath, oauthDir });
  return { cfg, stateDir, configPath, oauthDir, ...plan };
}
