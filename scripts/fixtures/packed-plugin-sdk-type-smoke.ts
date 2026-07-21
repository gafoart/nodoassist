// Packed Plugin Sdk Type Smoke script supports NodoAssist repository automation.
type PublicPluginSdkModules = [
  typeof import("nodoassist/plugin-sdk"),
  typeof import("nodoassist/plugin-sdk/channel-entry-contract"),
  typeof import("nodoassist/plugin-sdk/config-contracts"),
  typeof import("nodoassist/plugin-sdk/provider-entry"),
  typeof import("nodoassist/plugin-sdk/runtime-env"),
];

const resolvedModules = null as unknown as PublicPluginSdkModules;

void resolvedModules;
