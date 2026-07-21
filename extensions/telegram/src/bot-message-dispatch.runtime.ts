// Telegram plugin module implements bot message dispatch behavior.
export {
  getSessionEntry,
  resolveStorePath,
  type SessionEntry,
} from "nodoassist/plugin-sdk/session-store-runtime";
export { resolveMarkdownTableMode } from "nodoassist/plugin-sdk/markdown-table-runtime";
export { getAgentScopedMediaLocalRoots } from "nodoassist/plugin-sdk/media-runtime";
export { resolveChunkMode } from "nodoassist/plugin-sdk/reply-dispatch-runtime";
export {
  generateTelegramTopicLabel as generateTopicLabel,
  resolveAutoTopicLabelConfig,
} from "./auto-topic-label.js";
