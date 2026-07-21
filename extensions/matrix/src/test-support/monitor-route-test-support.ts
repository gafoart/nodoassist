// Matrix plugin module implements monitor route test support behavior.
export {
  registerSessionBindingAdapter,
  testing,
} from "nodoassist/plugin-sdk/session-binding-runtime";
export { resolveAgentRoute } from "nodoassist/plugin-sdk/routing";
export {
  createTestRegistry,
  setActivePluginRegistry,
} from "nodoassist/plugin-sdk/plugin-test-runtime";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
