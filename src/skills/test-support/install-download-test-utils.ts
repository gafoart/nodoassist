// Install download test utilities provide isolated state and workspace paths.
import {
  createNodoAssistTestState,
  type NodoAssistTestState,
} from "../../test-utils/nodoassist-test-state.js";

/** Creates isolated NodoAssist state for install download tests. */
export async function createInstallDownloadTestState(): Promise<NodoAssistTestState> {
  return await createNodoAssistTestState({
    layout: "state-only",
    prefix: "nodoassist-skills-install-",
  });
}
