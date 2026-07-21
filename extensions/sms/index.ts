// Sms plugin entrypoint registers its NodoAssist integration.
import { defineBundledChannelEntry } from "nodoassist/plugin-sdk/channel-entry-contract";

export default defineBundledChannelEntry({
  id: "sms",
  name: "SMS",
  description: "Twilio SMS channel plugin for NodoAssist text messages.",
  importMetaUrl: import.meta.url,
  plugin: {
    specifier: "./channel-plugin-api.js",
    exportName: "smsPlugin",
  },
  runtime: {
    specifier: "./api.js",
    exportName: "setSmsRuntime",
  },
});
