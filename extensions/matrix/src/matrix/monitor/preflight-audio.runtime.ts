import { sendDurableMessageBatch as sendDurableMessageBatchImpl } from "nodoassist/plugin-sdk/channel-outbound";
import { transcribeFirstAudio as transcribeFirstAudioImpl } from "nodoassist/plugin-sdk/media-runtime";

type TranscribeFirstAudio =
  typeof import("nodoassist/plugin-sdk/media-runtime").transcribeFirstAudio;
type SendDurableMessageBatch =
  typeof import("nodoassist/plugin-sdk/channel-outbound").sendDurableMessageBatch;

export async function transcribeFirstAudio(
  ...args: Parameters<TranscribeFirstAudio>
): ReturnType<TranscribeFirstAudio> {
  return await transcribeFirstAudioImpl(...args);
}

export async function sendDurableMessageBatch(
  ...args: Parameters<SendDurableMessageBatch>
): ReturnType<SendDurableMessageBatch> {
  return await sendDurableMessageBatchImpl(...args);
}
