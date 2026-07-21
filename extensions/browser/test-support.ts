/**
 * Browser test-support re-exports from shared plugin-sdk test fixtures.
 */
export {
  createCliRuntimeCapture,
  expectGeneratedTokenPersistedToGatewayAuth,
  type CliMockOutputRuntime,
  type CliRuntimeCapture,
} from "nodoassist/plugin-sdk/test-fixtures";
export {
  createTempHomeEnv,
  withEnv,
  withEnvAsync,
  withFetchPreconnect,
  isLiveTestEnabled,
} from "nodoassist/plugin-sdk/test-env";
export type { FetchMock, TempHomeEnv } from "nodoassist/plugin-sdk/test-env";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
