// Imessage plugin module implements conversation bindings behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import {
  createAccountScopedConversationBindingManager,
  resetAccountScopedConversationBindingsForTests,
  type AccountScopedConversationBindingManager,
  type BindingTargetKind,
} from "nodoassist/plugin-sdk/thread-bindings-runtime";

type IMessageBindingTargetKind = "subagent" | "acp";

type IMessageConversationBindingManager =
  AccountScopedConversationBindingManager<IMessageBindingTargetKind>;

const IMESSAGE_CONVERSATION_BINDINGS_STATE_KEY = Symbol.for(
  "nodoassist.imessageConversationBindingsState",
);

function toSessionBindingTargetKind(raw: IMessageBindingTargetKind): BindingTargetKind {
  return raw === "subagent" ? "subagent" : "session";
}

function toIMessageTargetKind(raw: BindingTargetKind): IMessageBindingTargetKind {
  return raw === "subagent" ? "subagent" : "acp";
}

export function createIMessageConversationBindingManager(params: {
  accountId?: string;
  cfg: NodoAssistConfig;
}): IMessageConversationBindingManager {
  return createAccountScopedConversationBindingManager({
    channel: "imessage",
    cfg: params.cfg,
    accountId: params.accountId,
    stateKey: IMESSAGE_CONVERSATION_BINDINGS_STATE_KEY,
    toStoredTargetKind: toIMessageTargetKind,
    toSessionBindingTargetKind,
  });
}

export const testing = {
  resetIMessageConversationBindingsForTests() {
    resetAccountScopedConversationBindingsForTests({
      stateKey: IMESSAGE_CONVERSATION_BINDINGS_STATE_KEY,
    });
  },
};
