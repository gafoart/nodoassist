# @nodoassist/openshell-sandbox

Official NVIDIA OpenShell sandbox backend for NodoAssist.

This plugin lets NodoAssist use OpenShell-managed sandboxes with mirrored local workspaces and SSH command execution.

## Install

```bash
nodoassist plugins install @nodoassist/openshell-sandbox
```

Restart the Gateway after installing or updating the plugin.

## Configure

Use the OpenShell docs for credentials, workspace mirroring, runtime selection, and troubleshooting:

- https://docs.openclaw.ai/gateway/openshell

## Package

- Plugin id: `openshell`
- Package: `@nodoassist/openshell-sandbox`
- Minimum NodoAssist host: `2026.5.12-beta.1`
