// Telegram plugin module implements exec approval resolver behavior.
import { resolveApprovalOverGateway } from "nodoassist/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "nodoassist/plugin-sdk/approval-reply-runtime";
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";

type ResolveTelegramExecApprovalParams = {
  cfg: NodoAssistConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  allowPluginFallback?: boolean;
  gatewayUrl?: string;
};

export async function resolveTelegramExecApproval(
  params: ResolveTelegramExecApprovalParams,
): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    allowPluginFallback: params.allowPluginFallback,
    clientDisplayName: `Telegram approval (${params.senderId?.trim() || "unknown"})`,
  });
}
