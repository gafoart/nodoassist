// Whatsapp plugin entrypoint registers its NodoAssist integration.
import {
  defineBundledChannelEntry,
  loadBundledEntryExportSync,
} from "nodoassist/plugin-sdk/channel-entry-contract";
import type { NodoAssistPluginApi } from "nodoassist/plugin-sdk/channel-entry-contract";

function registerWhatsAppCallTool(api: NodoAssistPluginApi): void {
  const registerTool = loadBundledEntryExportSync<(api: NodoAssistPluginApi) => void>(
    import.meta.url,
    {
      specifier: "./call-tool-api.js",
      exportName: "registerWhatsAppCallTool",
    },
  );
  registerTool(api);
}

export default defineBundledChannelEntry({
  id: "whatsapp",
  name: "WhatsApp",
  description: "WhatsApp channel plugin",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "whatsappPlugin",
  },
  runtime: {
    specifier: "./runtime-setter-api.js",
    exportName: "setWhatsAppRuntime",
  },
  registerFull: registerWhatsAppCallTool,
});
