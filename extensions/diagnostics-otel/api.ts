// Diagnostics Otel API module exposes the plugin public contract.
export {
  createChildDiagnosticTraceContext,
  createDiagnosticTraceContext,
  emitDiagnosticEvent,
  formatDiagnosticTraceparent,
  isValidDiagnosticSpanId,
  isValidDiagnosticTraceFlags,
  isValidDiagnosticTraceId,
  onDiagnosticEvent,
  parseDiagnosticTraceparent,
  type DiagnosticEventMetadata,
  type DiagnosticEventPayload,
  type DiagnosticEventPrivateData,
  type DiagnosticTraceContext,
} from "nodoassist/plugin-sdk/diagnostic-runtime";
export {
  emptyPluginConfigSchema,
  type NodoAssistPluginApi,
} from "nodoassist/plugin-sdk/plugin-entry";
export type {
  NodoAssistPluginService,
  NodoAssistPluginServiceContext,
} from "nodoassist/plugin-sdk/plugin-entry";
export { redactSensitiveText } from "nodoassist/plugin-sdk/security-runtime";
