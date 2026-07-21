// Googlechat plugin module implements group policy behavior.
import { resolveChannelGroupRequireMention } from "nodoassist/plugin-sdk/channel-policy";
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/core";

type GoogleChatGroupContext = {
  cfg: NodoAssistConfig;
  accountId?: string | null;
  groupId?: string | null;
};

export function resolveGoogleChatGroupRequireMention(params: GoogleChatGroupContext): boolean {
  return resolveChannelGroupRequireMention({
    cfg: params.cfg,
    channel: "googlechat",
    groupId: params.groupId,
    accountId: params.accountId,
  });
}
