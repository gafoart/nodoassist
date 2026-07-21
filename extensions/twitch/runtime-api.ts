// Private runtime barrel for the bundled Twitch extension.
// Keep this barrel thin and aligned with the local extension surface.

export type {
  ChannelAccountSnapshot,
  ChannelCapabilities,
  ChannelGatewayContext,
  ChannelLogSink,
  ChannelMessageActionAdapter,
  ChannelMessageActionContext,
  ChannelMeta,
  ChannelOutboundAdapter,
  ChannelOutboundContext,
  ChannelResolveKind,
  ChannelResolveResult,
  ChannelStatusAdapter,
} from "nodoassist/plugin-sdk/channel-contract";
export type { ChannelPlugin } from "nodoassist/plugin-sdk/channel-core";
export type { OutboundDeliveryResult } from "nodoassist/plugin-sdk/channel-send-result";
export type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
export type { RuntimeEnv } from "nodoassist/plugin-sdk/runtime";
export type { WizardPrompter } from "nodoassist/plugin-sdk/setup";
