// Verifies video-generation tool registration through the shared generation harness.
import { describeNodoAssistGenerationToolRegistration } from "./nodoassist-tools.generation.test-support.js";

describeNodoAssistGenerationToolRegistration({
  suiteName: "nodoassist tools video generation registration",
  toolName: "video_generate",
  toolLabel: "a video-generation tool",
});
