// Verifies image-generation tool registration through the shared generation harness.
import { describeNodoAssistGenerationToolRegistration } from "./nodoassist-tools.generation.test-support.js";

describeNodoAssistGenerationToolRegistration({
  suiteName: "nodoassist tools image generation registration",
  toolName: "image_generate",
  toolLabel: "an image-generation tool",
});
