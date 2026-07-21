/**
 * Trash helpers for Browser-owned files constrained to user and NodoAssist temp
 * roots.
 */
import os from "node:os";
import { movePathToTrash as movePathToTrashWithAllowedRoots } from "nodoassist/plugin-sdk/browser-config";
import { resolvePreferredNodoAssistTmpDir } from "nodoassist/plugin-sdk/temp-path";

/** Moves a path to trash only when it lives under allowed Browser roots. */
export async function movePathToTrash(targetPath: string): Promise<string> {
  return await movePathToTrashWithAllowedRoots(targetPath, {
    allowedRoots: [os.homedir(), resolvePreferredNodoAssistTmpDir()],
  });
}
