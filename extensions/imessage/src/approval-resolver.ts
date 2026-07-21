// Imessage plugin module implements approval resolver behavior.
import { resolveApprovalOverGateway } from "nodoassist/plugin-sdk/approval-gateway-runtime";
import type { ExecApprovalReplyDecision } from "nodoassist/plugin-sdk/approval-reply-runtime";
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { isApprovalNotFoundError } from "nodoassist/plugin-sdk/error-runtime";

export { isApprovalNotFoundError };

export async function resolveIMessageApproval(params: {
  cfg: NodoAssistConfig;
  approvalId: string;
  decision: ExecApprovalReplyDecision;
  senderId?: string | null;
  gatewayUrl?: string;
}): Promise<void> {
  await resolveApprovalOverGateway({
    cfg: params.cfg,
    approvalId: params.approvalId,
    decision: params.decision,
    senderId: params.senderId,
    gatewayUrl: params.gatewayUrl,
    clientDisplayName: `iMessage approval (${params.senderId?.trim() || "unknown"})`,
  });
}
