# @nodoassist/acpx

Official ACP runtime backend for NodoAssist.

ACPx lets NodoAssist run external coding harnesses through the Agent Client Protocol while NodoAssist still owns sessions, channels, delivery, permissions, and Gateway state.

## Install

```bash
nodoassist plugins install @nodoassist/acpx
```

Restart the Gateway after installing or updating the plugin.

## What it provides

- ACP-backed agent runtime sessions.
- Plugin-owned session and transport management.
- MCP bridge helpers for NodoAssist tools and plugin tools.
- Static runtime assets used by the ACP process bridge.

## Configure

Use the ACP docs for harness-specific setup, permission modes, and model/runtime selection:

- https://docs.openclaw.ai/tools/acp-agents-setup
- https://docs.openclaw.ai/tools/acp-agents

## Package

- Plugin id: `acpx`
- Package: `@nodoassist/acpx`
- Minimum NodoAssist host: `2026.4.25`
