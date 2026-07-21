// Error output tests cover program-level error display and exit messaging.
import { describe, expect, it } from "vitest";
import { formatCliParseErrorOutput } from "./error-output.js";

describe("formatCliParseErrorOutput", () => {
  it("explains unknown commands with root help and plugin hints", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'wat'\n", {
      argv: ["node", "nodoassist", "wat"],
    });

    expect(output).toBe(
      'NodoAssist does not know the command "wat".\nTry: nodoassist --help\nPlugin command? nodoassist plugins list\nDocs: https://docs.openclaw.ai/cli\n',
    );
  });

  it("suggests close known commands for unknown commands", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upate'\n", {
      argv: ["node", "nodoassist", "upate"],
    });

    expect(output).toBe(
      'NodoAssist does not know the command "upate".\nDid you mean this?\n  nodoassist update\nTry: nodoassist --help\nPlugin command? nodoassist plugins list\nDocs: https://docs.openclaw.ai/cli\n',
    );
  });

  it("suggests explicit aliases for common adjacent terminology", () => {
    const output = formatCliParseErrorOutput("error: unknown command 'upgrade'\n", {
      argv: ["node", "nodoassist", "upgrade"],
    });

    expect(output).toContain("Did you mean this?\n  nodoassist update\n");
  });

  it("preserves active profile context in command suggestions", () => {
    const originalProfile = process.env.NODOASSIST_PROFILE;
    process.env.NODOASSIST_PROFILE = "work";
    try {
      const output = formatCliParseErrorOutput("error: unknown command 'doctr'\n", {
        argv: ["node", "nodoassist", "doctr"],
      });

      expect(output).toContain("Did you mean this?\n  nodoassist --profile work doctor\n");
    } finally {
      if (originalProfile === undefined) {
        delete process.env.NODOASSIST_PROFILE;
      } else {
        process.env.NODOASSIST_PROFILE = originalProfile;
      }
    }
  });

  it("points unknown options at the active command help", () => {
    const output = formatCliParseErrorOutput("error: unknown option '--wat'\n", {
      argv: ["node", "nodoassist", "channels", "status", "--wat"],
    });

    expect(output).toBe(
      'NodoAssist does not recognize option "--wat".\nTry: nodoassist channels status --help\n',
    );
  });

  it("points missing required arguments at command help", () => {
    const output = formatCliParseErrorOutput("error: missing required argument 'name'\n", {
      argv: ["node", "nodoassist", "plugins", "install"],
    });

    expect(output).toBe(
      'Missing required argument "name".\nTry: nodoassist plugins install --help\n',
    );
  });
});
