// Memory Core plugin module implements public artifacts behavior.
import {
  listMemoryHostPublicArtifacts,
  type MemoryPluginPublicArtifact,
} from "nodoassist/plugin-sdk/memory-host-core";
import type { NodoAssistConfig } from "../api.js";

export async function listMemoryCorePublicArtifacts(params: {
  cfg: NodoAssistConfig;
}): Promise<MemoryPluginPublicArtifact[]> {
  return await listMemoryHostPublicArtifacts(params);
}
