// Matrix plugin module implements limits behavior.
import { resolveIntegerOption } from "nodoassist/plugin-sdk/number-runtime";

export function resolveMatrixActionLimit(raw: unknown, fallback: number): number {
  return resolveIntegerOption(raw, fallback, { min: 1 });
}
