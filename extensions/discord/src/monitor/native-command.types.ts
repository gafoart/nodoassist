// Discord type declarations define plugin contracts.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import type { CommandArgValues } from "nodoassist/plugin-sdk/native-command-registry";

export type DiscordConfig = NonNullable<NodoAssistConfig["channels"]>["discord"];

export type DiscordCommandArgs = {
  raw?: string;
  values?: CommandArgValues;
};
