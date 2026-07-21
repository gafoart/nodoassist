// Qqbot API module exposes the plugin public contract.
export type { ChannelPlugin, NodoAssistPluginApi, PluginRuntime } from "nodoassist/plugin-sdk/core";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export type {
  NodoAssistPluginService,
  NodoAssistPluginServiceContext,
  PluginLogger,
} from "nodoassist/plugin-sdk/core";
export type { ResolvedQQBotAccount, QQBotAccountConfig } from "./src/types.js";
export { getQQBotRuntime, setQQBotRuntime } from "./src/bridge/runtime.js";
