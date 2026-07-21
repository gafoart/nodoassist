/** ACP protocol helpers and NodoAssist agent identity metadata. */
export { normalizeAcpProvenanceMode } from "@nodoassist/acp-core/types";
import { VERSION } from "../version.js";

/** ACP agent identity advertised during protocol initialization. */
export const ACP_AGENT_INFO = {
  name: "nodoassist-acp",
  title: "NodoAssist ACP Gateway",
  version: VERSION,
};
