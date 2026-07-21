// Whatsapp tests cover ack emoji plugin behavior.
import type { NodoAssistConfig } from "nodoassist/plugin-sdk/config-contracts";
import { describe, expect, it } from "vitest";
import { resolveWhatsAppAckEmoji } from "./ack-emoji.js";

function createConfig(
  ackReaction?: NonNullable<
    NonNullable<NonNullable<NodoAssistConfig["channels"]>["whatsapp"]>["ackReaction"]
  >,
): NodoAssistConfig {
  const cfg: NodoAssistConfig = {
    agents: {
      list: [{ id: "agent", identity: { emoji: "🔥" } }],
    },
    channels: {
      whatsapp: {},
    },
  } as NodoAssistConfig;
  if (ackReaction !== undefined) {
    cfg.channels!.whatsapp!.ackReaction = ackReaction;
  }
  return cfg;
}

describe("resolveWhatsAppAckEmoji", () => {
  it("keeps missing ackReaction config disabled", () => {
    expect(
      resolveWhatsAppAckEmoji({
        cfg: createConfig(),
        agentId: "agent",
        ackConfig: undefined,
      }),
    ).toBe("");
  });

  it("uses the configured WhatsApp emoji when present", () => {
    const cfg = createConfig({ emoji: " 👀 ", direct: true, group: "mentions" });

    expect(
      resolveWhatsAppAckEmoji({
        cfg,
        agentId: "agent",
        ackConfig: cfg.channels?.whatsapp?.ackReaction,
      }),
    ).toBe("👀");
  });

  it("keeps an explicit empty emoji disabled", () => {
    const cfg = createConfig({ emoji: " ", direct: true, group: "mentions" });

    expect(
      resolveWhatsAppAckEmoji({
        cfg,
        agentId: "agent",
        ackConfig: cfg.channels?.whatsapp?.ackReaction,
      }),
    ).toBe("");
  });

  it("falls back to the routed agent identity emoji when the ack object has no emoji", () => {
    const cfg = createConfig({ direct: true, group: "mentions" });

    expect(
      resolveWhatsAppAckEmoji({
        cfg,
        agentId: "agent",
        ackConfig: cfg.channels?.whatsapp?.ackReaction,
      }),
    ).toBe("🔥");
  });

  it("uses normalized agent ids for the identity fallback", () => {
    const cfg: NodoAssistConfig = {
      agents: {
        list: [{ id: "Agent", identity: { emoji: "🔥" } }],
      },
      channels: {
        whatsapp: {
          ackReaction: { direct: true, group: "mentions" },
        },
      },
    } as NodoAssistConfig;

    expect(
      resolveWhatsAppAckEmoji({
        cfg,
        agentId: "agent",
        ackConfig: cfg.channels?.whatsapp?.ackReaction,
      }),
    ).toBe("🔥");
  });

  it("uses the default ack emoji when configured without an emoji or agent identity", () => {
    const cfg: NodoAssistConfig = {
      channels: {
        whatsapp: {
          ackReaction: { direct: true, group: "mentions" },
        },
      },
    } as NodoAssistConfig;

    expect(
      resolveWhatsAppAckEmoji({
        cfg,
        agentId: "agent",
        ackConfig: cfg.channels?.whatsapp?.ackReaction,
      }),
    ).toBe("👀");
  });
});
