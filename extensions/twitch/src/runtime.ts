// Twitch plugin module implements runtime behavior.
import type { PluginRuntime } from "nodoassist/plugin-sdk/core";
import { createPluginRuntimeStore } from "nodoassist/plugin-sdk/runtime-store";

const { setRuntime: setTwitchRuntime, getRuntime: getTwitchRuntime } =
  createPluginRuntimeStore<PluginRuntime>({
    pluginId: "twitch",
    errorMessage: "Twitch runtime not initialized",
  });
export { getTwitchRuntime, setTwitchRuntime };
