import { commitConfigWithPendingPluginInstalls } from "../../cli/plugins-install-record-commit.js";
import { refreshPluginRegistryAfterConfigMutation } from "../../cli/plugins-registry-refresh.js";
import { replaceConfigFile } from "../../config/config.js";
import type { NodoAssistConfig } from "../../config/types.nodoassist.js";
import type { RuntimeEnv } from "../../runtime.js";

export async function persistResolvedChannelPluginConfig(params: {
  resolved: {
    cfg: NodoAssistConfig;
    configChanged: boolean;
    pluginInstalled: boolean;
  };
  baseHash?: string;
  runtime: RuntimeEnv;
}): Promise<NodoAssistConfig> {
  if (!params.resolved.configChanged) {
    return params.resolved.cfg;
  }

  const cfg = params.resolved.cfg;
  const shouldMovePluginInstalls = Boolean(
    cfg.plugins?.installs && Object.keys(cfg.plugins.installs).length > 0,
  );
  if (shouldMovePluginInstalls) {
    const committed = await commitConfigWithPendingPluginInstalls({
      nextConfig: cfg,
      baseHash: params.baseHash,
    });
    await refreshPluginRegistryAfterConfigMutation({
      config: committed.config,
      reason: "source-changed",
      installRecords: committed.installRecords,
      logger: { warn: (message) => params.runtime.log(message) },
    });
    return committed.config;
  }

  await replaceConfigFile({
    nextConfig: cfg,
    baseHash: params.baseHash,
  });
  if (params.resolved.pluginInstalled) {
    await refreshPluginRegistryAfterConfigMutation({
      config: cfg,
      reason: "source-changed",
      logger: { warn: (message) => params.runtime.log(message) },
    });
  }
  return cfg;
}
