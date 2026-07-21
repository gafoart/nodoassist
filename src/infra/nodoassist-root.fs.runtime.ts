// NodoAssist root resolution imports fs through this facade so tests can replace
// filesystem behavior without mocking node:fs globally.
export { default as nodoAssistRootFsSync } from "node:fs";
export { default as nodoAssistRootFs } from "node:fs/promises";
