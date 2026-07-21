// Zalouser plugin module implements runtime behavior.
import type { PluginRuntime } from "nodoassist/plugin-sdk/core";
import { createPluginRuntimeStore } from "nodoassist/plugin-sdk/runtime-store";

const { setRuntime: setZalouserRuntime, getRuntime: getZalouserRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "zalouser",
    errorMessage: "Zalouser runtime not initialized",
  });
export { getZalouserRuntime, setZalouserRuntime };
