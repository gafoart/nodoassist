// OC Path plugin entrypoint registers its NodoAssist integration.
import { definePluginEntry } from "nodoassist/plugin-sdk/plugin-entry";
import { registerOcPathCli } from "./cli-registration.js";

export default definePluginEntry({
  id: "oc-path",
  name: "OC Path",
  description: "Adds the nodoassist path CLI for oc:// workspace file addressing.",
  register(api) {
    registerOcPathCli(api);
  },
});
