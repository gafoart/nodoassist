---
title: "Agent runtime architecture"
summary: "How NodoAssist structures the built-in agent runtime: code layout, boundaries, resource manifests, and runtime selection."
---

NodoAssist owns the built-in agent runtime. Runtime code lives under `src/agents/`, model/provider transport lives under `src/llm/`, and plugin-facing contracts are exposed through `nodoassist/plugin-sdk/*` barrels.

## Runtime Layout

| Path                                | Owns                                                                                                                                                                                                                      |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/agents/embedded-agent-runner/` | Built-in attempt loop (`run.ts`, `run/`), model selection and provider normalization (`model*.ts`), per-provider request params (`extra-params.*`), compaction, transcript and session wiring.                            |
| `src/agents/sessions/`              | Session persistence (`session-manager.ts`), resource discovery (`package-manager.ts`, `resource-loader.ts`), in-session `extensions` loading, prompt templates, skills, themes, and TUI-backed tool renderers (`tools/`). |
| `packages/agent-core/`              | Reusable agent core (`@nodoassist/agent-core`): agent loop, harness types, messages, compaction helpers, prompt templates, skills, and session storage contracts.                                                         |
| `src/agents/runtime/`               | NodoAssist facade that wires `@nodoassist/agent-core` to the plugin SDK LLM runtime and re-exports it plus local proxy utilities.                                                                                         |
| `src/agents/agent-tools*.ts`        | NodoAssist-owned tool definitions, parameter schemas, tool policy, before/after tool-call adapters, and host/sandbox edit tools.                                                                                          |
| `src/agents/agent-hooks/`           | Built-in runtime hooks: compaction safeguard, compaction instructions, context pruning.                                                                                                                                   |
| `src/agents/harness/`               | Harness registry, selection policy, and lifecycle for the built-in and plugin-registered harnesses.                                                                                                                       |
| `src/llm/`                          | Model/provider registry, transport helpers, and provider-specific stream implementations (`src/llm/providers/`).                                                                                                          |

## Boundaries

Core calls the built-in runtime through NodoAssist modules and SDK barrels; no external agent framework packages remain. Plugins use documented `nodoassist/plugin-sdk/*` entrypoints and do not import `src/**` internals.

`@earendil-works/pi-tui` remains a third-party dependency: a terminal component toolkit used by the local TUI and session tool renderers. Internalizing it would be a separate vendoring effort.

## Manifests

Resource packages declare NodoAssist resources in `package.json` metadata. Entries are file paths or globs relative to the package root:

```json
{
  "nodoassist": {
    "extensions": ["extensions/index.ts"],
    "skills": ["skills/*.md"],
    "prompts": ["prompts/*.md"],
    "themes": ["themes/*.json"]
  }
}
```

Resource types not listed in a manifest fall back to discovery of conventional `extensions/`, `skills/`, `prompts/`, and `themes/` directories.

## Runtime Selection

- The built-in runtime id is `nodoassist`. The legacy alias `pi` normalizes to `nodoassist`; `codex-app-server` normalizes to `codex`.
- Plugin harnesses register additional runtime ids (for example `codex`).
- Runtime policy is model/provider-scoped `agentRuntime.id` config (model entry wins over provider entry). Unset or `default` resolves to `auto`.
- `auto` selects a registered plugin harness that supports the provider/model, otherwise the built-in NodoAssist runtime.
- The `openai` provider on the official API endpoint defaults to the `codex` harness; custom `baseUrl` values keep their configured behavior.

## Related

- [NodoAssist agent runtime workflow](/nodoassist-agent-runtime)
- [Agent runtimes](/concepts/agent-runtimes)
