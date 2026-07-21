// Open Prose plugin entrypoint registers its NodoAssist integration.
import { definePluginEntry, type NodoAssistPluginApi } from "./runtime-api.js";

export default definePluginEntry({
  id: "open-prose",
  name: "OpenProse",
  description: "Plugin-shipped prose skills bundle",
  register(_api: NodoAssistPluginApi) {
    // OpenProse is delivered via plugin-shipped skills.
  },
});
