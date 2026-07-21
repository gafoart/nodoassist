/** Process env key that marks child commands as launched by the NodoAssist CLI. */
export const NODOASSIST_CLI_ENV_VAR = "NODOASSIST_CLI";

/** Stable marker value used for NodoAssist-launched subprocess detection. */
export const NODOASSIST_CLI_ENV_VALUE = "1";

/** Returns a cloned env object with the NodoAssist CLI marker set. */
export function markNodoAssistExecEnv<T extends Record<string, string | undefined>>(
  /** Source environment to clone before adding the subprocess marker. */
  env: T,
): T {
  return {
    ...env,
    [NODOASSIST_CLI_ENV_VAR]: NODOASSIST_CLI_ENV_VALUE,
  };
}

/** Mutates an existing process env object so current-process children inherit the marker. */
export function ensureNodoAssistExecMarkerOnProcess(
  /** Process env object to mutate; defaults to the current process environment. */
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  env[NODOASSIST_CLI_ENV_VAR] = NODOASSIST_CLI_ENV_VALUE;
  return env;
}
