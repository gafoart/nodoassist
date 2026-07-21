// Imessage API module exposes the plugin public contract.
import { formatTrimmedAllowFromEntries } from "nodoassist/plugin-sdk/channel-config-helpers";
import { PAIRING_APPROVED_MESSAGE } from "nodoassist/plugin-sdk/channel-status";
import {
  DEFAULT_ACCOUNT_ID,
  getChatChannelMeta,
  type ChannelPlugin,
} from "nodoassist/plugin-sdk/core";
import { resolveChannelMediaMaxBytes } from "nodoassist/plugin-sdk/media-runtime";
import { collectStatusIssuesFromLastError } from "nodoassist/plugin-sdk/status-helpers";
import { normalizeIMessageMessagingTarget } from "./normalize.js";
export { chunkTextForOutbound } from "nodoassist/plugin-sdk/text-chunking";

export {
  collectStatusIssuesFromLastError,
  DEFAULT_ACCOUNT_ID,
  formatTrimmedAllowFromEntries,
  getChatChannelMeta,
  normalizeIMessageMessagingTarget,
  PAIRING_APPROVED_MESSAGE,
  resolveChannelMediaMaxBytes,
};

export type { ChannelPlugin };
