/** ACP runtime error exports wired to NodoAssist secret redaction. */
import { configureAcpErrorRedactor } from "@nodoassist/acp-core";
import { redactSensitiveText } from "../../logging/redact.js";

// Ensure ACP-core runtime errors use NodoAssist's secret redaction before re-export.
configureAcpErrorRedactor(redactSensitiveText);

export * from "@nodoassist/acp-core/runtime/errors";
