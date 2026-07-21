// Qa Matrix plugin entrypoint registers its NodoAssist integration.
import { definePluginEntry } from "nodoassist/plugin-sdk/plugin-entry";

export default definePluginEntry({
  id: "qa-matrix",
  name: "QA Matrix",
  description: "Matrix QA transport runner and substrate",
  register() {},
});
