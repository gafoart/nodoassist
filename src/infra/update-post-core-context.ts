import type { NodoAssistConfig } from "../config/types.nodoassist.js";

export const POST_CORE_UPDATE_SOURCE_CONFIG_PATH_ENV =
  "NODOASSIST_UPDATE_POST_CORE_SOURCE_CONFIG_PATH";

export type PreUpdateConfigRestoreInput = {
  sourceConfig: NodoAssistConfig;
  authoredConfig: NodoAssistConfig;
};
