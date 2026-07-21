import type { ConfigFileSnapshot } from "../../../config/types.js";
import type { NodoAssistConfig } from "../../../config/types.nodoassist.js";
import { migrateLegacyConfig } from "./legacy-config-migrate.js";

export type StateMigrationConfigInput = {
  cfg?: NodoAssistConfig;
  pluginDoctorConfig?: NodoAssistConfig;
};

export function resolveStateMigrationConfigInput(params: {
  snapshot: ConfigFileSnapshot;
  baseConfig: NodoAssistConfig;
}): StateMigrationConfigInput | null {
  const pluginDoctorConfig = (params.snapshot.sourceConfig ??
    params.snapshot.config ??
    params.snapshot.parsed) as NodoAssistConfig | undefined;
  if (params.snapshot.valid) {
    return params.snapshot.legacyIssues.length > 0 && pluginDoctorConfig !== undefined
      ? { cfg: params.baseConfig, pluginDoctorConfig }
      : { cfg: params.baseConfig };
  }
  const migrationSource = pluginDoctorConfig ?? params.snapshot.parsed;
  if (params.snapshot.legacyIssues.length === 0 || migrationSource === undefined) {
    return null;
  }
  const migrated = migrateLegacyConfig(migrationSource);
  if (!migrated.config) {
    return null;
  }
  if (migrated.partiallyValid) {
    return {
      pluginDoctorConfig: (pluginDoctorConfig ?? migrationSource) as NodoAssistConfig,
    };
  }
  return {
    cfg: migrated.config,
    ...(pluginDoctorConfig ? { pluginDoctorConfig } : {}),
  };
}
