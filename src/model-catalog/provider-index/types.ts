// Provider-index types describe install hints, auth choices, and preview catalogs for discoverable providers.
import type { ModelCatalogProvider } from "@nodoassist/model-catalog-core/model-catalog-types";

// Normalized provider-index schema. It describes providers discoverable before
// plugin install, including install hints, auth choices, and preview catalogs.
export type NodoAssistProviderIndexPluginInstall = {
  clawhubSpec?: string;
  npmSpec?: string;
  defaultChoice?: "clawhub" | "npm";
  minHostVersion?: string;
  expectedIntegrity?: string;
};

export type NodoAssistProviderIndexPlugin = {
  id: string;
  package?: string;
  source?: string;
  install?: NodoAssistProviderIndexPluginInstall;
};

export type NodoAssistProviderIndexProviderAuthChoice = {
  method: string;
  choiceId: string;
  choiceLabel: string;
  choiceHint?: string;
  assistantPriority?: number;
  assistantVisibility?: "visible" | "manual-only";
  groupId?: string;
  groupLabel?: string;
  groupHint?: string;
  optionKey?: string;
  cliFlag?: string;
  cliOption?: string;
  cliDescription?: string;
  onboardingScopes?: readonly ("text-inference" | "image-generation" | "music-generation")[];
};

export type NodoAssistProviderIndexProvider = {
  id: string;
  name: string;
  plugin: NodoAssistProviderIndexPlugin;
  docs?: string;
  categories?: readonly string[];
  authChoices?: readonly NodoAssistProviderIndexProviderAuthChoice[];
  previewCatalog?: ModelCatalogProvider;
};

export type NodoAssistProviderIndex = {
  version: number;
  providers: Readonly<Record<string, NodoAssistProviderIndexProvider>>;
};
