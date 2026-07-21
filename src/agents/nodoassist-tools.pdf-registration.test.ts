// Verifies PDF tool factory output is included in NodoAssist tool registration.
import { describe, expect, it } from "vitest";
import { collectPresentNodoAssistTools } from "./nodoassist-tools.registration.js";
import { createPdfTool } from "./tools/pdf-tool.js";

describe("createNodoAssistTools PDF registration", () => {
  it("includes the pdf tool when the pdf factory returns a tool", () => {
    const pdfTool = createPdfTool({
      agentDir: "/tmp/nodoassist-agent-main",
      config: {
        agents: {
          defaults: {
            pdfModel: { primary: "openai/gpt-5.4-mini" },
          },
        },
      },
    });

    expect(pdfTool?.name).toBe("pdf");
    expect(collectPresentNodoAssistTools([pdfTool]).map((tool) => tool.name)).toEqual(["pdf"]);
  });
});
