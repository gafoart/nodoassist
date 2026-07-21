// Diagnostics Prometheus API module exposes the plugin public contract.
export type {
  DiagnosticEventMetadata,
  DiagnosticEventPayload,
} from "nodoassist/plugin-sdk/diagnostic-runtime";
export { isInternalDiagnosticEventMetadata } from "nodoassist/plugin-sdk/diagnostic-runtime";
export {
  emptyPluginConfigSchema,
  type NodoAssistPluginApi,
  type NodoAssistPluginHttpRouteHandler,
  type NodoAssistPluginService,
  type NodoAssistPluginServiceContext,
} from "nodoassist/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "nodoassist/plugin-sdk/security-runtime";
