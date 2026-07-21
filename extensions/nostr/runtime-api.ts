// Private runtime barrel for the bundled Nostr extension.
// Keep this barrel thin and aligned with the local extension surface.

export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export { getPluginRuntimeGatewayRequestScope } from "nodoassist/plugin-sdk/plugin-runtime";
export type { PluginRuntime } from "nodoassist/plugin-sdk/runtime-store";
