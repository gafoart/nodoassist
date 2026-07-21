// Mattermost plugin module implements secret input behavior.
export type { SecretInput } from "nodoassist/plugin-sdk/secret-input";
export {
  buildSecretInputSchema,
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "nodoassist/plugin-sdk/secret-input";
