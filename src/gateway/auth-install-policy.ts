// Gateway install auth policy used by service/install flows.
import { normalizeOptionalString } from "@nodoassist/normalization-core/string-coerce";
import { collectDurableServiceEnvVars } from "../config/state-dir-dotenv.js";
import type { NodoAssistConfig } from "../config/types.nodoassist.js";
import { hasConfiguredSecretInput } from "../config/types.secrets.js";

type GatewayInstallAuthMode = NonNullable<NonNullable<NodoAssistConfig["gateway"]>["auth"]>["mode"];

function hasExplicitGatewayInstallAuthMode(
  mode: GatewayInstallAuthMode | undefined,
): boolean | undefined {
  if (mode === "token") {
    return true;
  }
  if (mode === "password" || mode === "none" || mode === "trusted-proxy") {
    return false;
  }
  return undefined;
}

function hasConfiguredGatewayPasswordForInstall(cfg: NodoAssistConfig): boolean {
  return hasConfiguredSecretInput(cfg.gateway?.auth?.password, cfg.secrets?.defaults);
}

function hasDurableGatewayPasswordEnvForInstall(
  cfg: NodoAssistConfig,
  env: NodeJS.ProcessEnv,
): boolean {
  const durableServiceEnv = collectDurableServiceEnvVars({ env, config: cfg });
  return Boolean(
    normalizeOptionalString(durableServiceEnv.NODOASSIST_GATEWAY_PASSWORD) ||
    normalizeOptionalString(durableServiceEnv.CLAWDBOT_GATEWAY_PASSWORD),
  );
}

/** Decide whether install should require token auth when no durable password source exists. */
export function shouldRequireGatewayTokenForInstall(
  cfg: NodoAssistConfig,
  env: NodeJS.ProcessEnv,
): boolean {
  const explicitModeDecision = hasExplicitGatewayInstallAuthMode(cfg.gateway?.auth?.mode);
  if (explicitModeDecision !== undefined) {
    return explicitModeDecision;
  }

  if (hasConfiguredGatewayPasswordForInstall(cfg)) {
    return false;
  }

  // Service install should only infer password mode from durable sources that
  // survive outside the invoking shell.
  if (hasDurableGatewayPasswordEnvForInstall(cfg, env)) {
    return false;
  }

  return true;
}
