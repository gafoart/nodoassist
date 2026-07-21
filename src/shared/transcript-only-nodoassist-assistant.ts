// Identifies NodoAssist-authored assistant rows that are transcript bookkeeping,
// not provider model output. Some history surfaces keep gateway-injected rows
// visible, so use the narrower delivery-mirror predicate when visibility matters.
export const NODOASSIST_TRANSCRIPT_ARTIFACT_API = "nodoassist-transcript" as const;
export const NODOASSIST_TRANSCRIPT_ARTIFACT_PROVIDER = "nodoassist" as const;
export const NODOASSIST_DELIVERY_MIRROR_MODEL = "delivery-mirror" as const;
const NODOASSIST_GATEWAY_INJECTED_MODEL = "gateway-injected" as const;

const TRANSCRIPT_ONLY_NODOASSIST_ASSISTANT_MODELS = new Set<string>([
  NODOASSIST_DELIVERY_MIRROR_MODEL,
  NODOASSIST_GATEWAY_INJECTED_MODEL,
]);

export function isTranscriptOnlyNodoAssistAssistantModel(
  provider: unknown,
  model: unknown,
): boolean {
  return (
    provider === NODOASSIST_TRANSCRIPT_ARTIFACT_PROVIDER &&
    typeof model === "string" &&
    TRANSCRIPT_ONLY_NODOASSIST_ASSISTANT_MODELS.has(model)
  );
}

export function isTranscriptOnlyNodoAssistAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    isTranscriptOnlyNodoAssistAssistantModel(entry.provider, entry.model)
  );
}

export function isNodoAssistDeliveryMirrorAssistantMessage(message: unknown): boolean {
  if (!message || typeof message !== "object" || Array.isArray(message)) {
    return false;
  }
  const entry = message as { role?: unknown; provider?: unknown; model?: unknown };
  return (
    entry.role === "assistant" &&
    entry.provider === NODOASSIST_TRANSCRIPT_ARTIFACT_PROVIDER &&
    entry.model === NODOASSIST_DELIVERY_MIRROR_MODEL
  );
}
