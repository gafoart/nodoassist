/** Resolves whether the metadata-only audit ledger records new events. */
import type { NodoAssistConfig } from "../config/types.nodoassist.js";

/**
 * The ledger is on by default: an audit trail enabled only after an incident
 * cannot explain the incident. `audit.enabled: false` stops new writes;
 * existing records remain readable through `audit.list` until they expire.
 */
export function isAuditLedgerEnabled(cfg: NodoAssistConfig | undefined): boolean {
  return cfg?.audit?.enabled !== false;
}
