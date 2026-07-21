// Streams LLM responses through registered providers and normalizes events.
// This facade owns the process-default AI runtime wiring: it installs the
// NodoAssist host policy ports and registers built-in providers exactly once,
// before any caller imports the stream API.
import { defaultApiRegistry } from "@nodoassist/ai/internal/runtime";
import { registerBuiltInApiProviders } from "@nodoassist/ai/providers";
import "./ai-transport-host.js";

registerBuiltInApiProviders(defaultApiRegistry);

export {
  complete,
  completeSimple,
  getEnvApiKey,
  stream,
  streamSimple,
} from "@nodoassist/ai/internal/runtime";
