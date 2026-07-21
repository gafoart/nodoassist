---
summary: "CLI reference for `nodoassist tui` (Gateway-backed or local embedded terminal UI)"
read_when:
  - You want a terminal UI for the Gateway (remote-friendly)
  - You want to pass url/token/session from scripts
  - You want to run the TUI in local embedded mode without a Gateway
  - You want to use nodoassist chat or nodoassist tui --local
title: "TUI"
---

# `nodoassist tui`

Open the terminal UI connected to the Gateway, or run it in local embedded
mode.

Related guide: [TUI](/web/tui)

## Options

| Flag                  | Default                                   | Description                                                                        |
| --------------------- | ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `--local`             | `false`                                   | Run against the local embedded agent runtime instead of a Gateway.                 |
| `--url <url>`         | `gateway.remote.url` from config          | Gateway WebSocket URL.                                                             |
| `--token <token>`     | (none)                                    | Gateway token if required.                                                         |
| `--password <pass>`   | (none)                                    | Gateway password if required.                                                      |
| `--session <key>`     | `main` (or `global` when scope is global) | Session key. Inside an agent workspace it auto-selects that agent unless prefixed. |
| `--deliver`           | `false`                                   | Deliver assistant replies through configured channels.                             |
| `--thinking <level>`  | (model default)                           | Thinking level override.                                                           |
| `--message <text>`    | (none)                                    | Send an initial message after connecting.                                          |
| `--timeout-ms <ms>`   | `agents.defaults.timeoutSeconds`          | Agent timeout. Invalid values log a warning and are ignored.                       |
| `--history-limit <n>` | `200`                                     | History entries to load on attach.                                                 |

Aliases: `nodoassist chat` and `nodoassist terminal` invoke this command with
`--local` implied.

## Notes

- `--local` cannot combine with `--url`, `--token`, or `--password`.
- `tui` resolves configured Gateway auth SecretRefs for token/password auth
  when possible (`env`/`file`/`exec` providers).
- With no explicit URL or port, `tui` follows the active local Gateway port
  recorded by the running Gateway. Explicit `--url`, `NODOASSIST_GATEWAY_URL`,
  `NODOASSIST_GATEWAY_PORT`, and remote Gateway config keep precedence.
- Launched from inside a configured agent workspace directory, TUI auto-selects
  that agent for the session key default (unless `--session` is explicitly
  `agent:<id>:...`).
- To show the Gateway hostname in the footer for non-local URL-backed
  connections, run `nodoassist config set tui.footer.showRemoteHost true`. Off by
  default; never shown for loopback or embedded local connections.
- Local mode uses the embedded agent runtime directly. Most local tools work,
  but Gateway-only features are unavailable.
- Local mode adds `/auth [provider]` to the TUI command surface.
- Plugin approval gates still apply in local mode: tools that require approval
  prompt for a decision in the terminal, nothing is silently auto-approved.
- Session [goals](/tools/goal) appear in the footer and can be managed with
  `/goal`.

## Examples

```bash
nodoassist chat
nodoassist tui --local
nodoassist tui
nodoassist tui --url ws://127.0.0.1:18789 --token <token>
nodoassist tui --session main --deliver
nodoassist chat --message "Compare my config to the docs and tell me what to fix"
# when run inside an agent workspace, infers that agent automatically
nodoassist tui --session bugfix
```

## Config repair loop

Use local mode to have the embedded agent inspect the current config, compare
it against the docs, and help repair it from the same terminal.

If `nodoassist config validate` is already failing, run `nodoassist configure` or
`nodoassist doctor --fix` first; `nodoassist chat` does not bypass the
invalid-config guard.

```bash
nodoassist chat
```

Then inside the TUI:

```text
!nodoassist config file
!nodoassist docs gateway auth token secretref
!nodoassist config validate
!nodoassist doctor
```

Apply targeted fixes with `nodoassist config set` or `nodoassist configure`, then
rerun `nodoassist config validate`. See [TUI](/web/tui) and
[Config](/cli/config).

## Related

- [CLI reference](/cli)
- [TUI](/web/tui)
- [Goal](/tools/goal)
