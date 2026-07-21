/**
 * Active runtime config provider for the QQBot engine.
 *
 * Routing must re-evaluate `bindings[]` on every inbound message so that
 * peer/account binding edits made via the CLI take effect without
 * restarting the gateway. The provider hides the per-event lookup
 * behind a typed seam and falls back to the startup snapshot when the
 * runtime registry getter throws (e.g. snapshot not yet initialised).
 *
 * Issue #69546.
 */

import type { NodoAssistConfig } from "nodoassist/plugin-sdk/core";
import { getRuntimeConfig } from "nodoassist/plugin-sdk/runtime-config-snapshot";

export type GatewayCfgLoader = () => NodoAssistConfig;

interface ActiveCfgProvider {
  getActiveCfg(): NodoAssistConfig;
}

interface ActiveCfgProviderOptions {
  fallback: NodoAssistConfig;
  load?: GatewayCfgLoader;
}

export function createActiveCfgProvider(options: ActiveCfgProviderOptions): ActiveCfgProvider {
  const loader = options.load ?? defaultGatewayCfgLoader;
  const fallback = options.fallback;
  return {
    getActiveCfg(): NodoAssistConfig {
      return resolveActiveCfg(loader, fallback);
    },
  };
}

export function resolveActiveCfg(
  loader: GatewayCfgLoader,
  fallback: NodoAssistConfig,
): NodoAssistConfig {
  try {
    return loader();
  } catch {
    return fallback;
  }
}

function defaultGatewayCfgLoader(): NodoAssistConfig {
  return getRuntimeConfig();
}
