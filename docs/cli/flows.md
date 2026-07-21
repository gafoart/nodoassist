---
summary: "Redirect: flow commands live under `nodoassist tasks flow`"
read_when:
  - You encounter `nodoassist flows` in older docs or release notes
  - You want a quick TaskFlow inspection reference
title: "Flows (redirect)"
---

# `nodoassist tasks flow`

There is no top-level `nodoassist flows` command. Durable TaskFlow inspection lives under `nodoassist tasks flow`.

## Subcommands

```bash
nodoassist tasks flow list   [--json] [--status <name>]
nodoassist tasks flow show   <lookup> [--json]
nodoassist tasks flow cancel <lookup>
```

| Subcommand | Description                | Arguments / options                                                                   |
| ---------- | -------------------------- | ------------------------------------------------------------------------------------- |
| `list`     | List tracked TaskFlows.    | `--json` machine-readable output; `--status <name>` filter (see status values below). |
| `show`     | Show one TaskFlow.         | `<lookup>` flow id or owner key; `--json` machine-readable output.                    |
| `cancel`   | Cancel a running TaskFlow. | `<lookup>` flow id or owner key.                                                      |

`<lookup>` accepts either a flow id (returned by `list` / `show`) or the flow's owner key (the stable identifier the owning subsystem uses to track the flow).

### Status filter values

`--status` on `list` accepts one of: `queued`, `running`, `waiting`, `blocked`, `succeeded`, `failed`, `cancelled`, `lost`.

## Examples

```bash
nodoassist tasks flow list
nodoassist tasks flow list --status running
nodoassist tasks flow list --json
nodoassist tasks flow show flow_abc123
nodoassist tasks flow show flow_abc123 --json
nodoassist tasks flow cancel flow_abc123
```

For TaskFlow concepts and authoring, see [TaskFlow](/automation/taskflow). For the parent `tasks` command, see [tasks CLI reference](/cli/tasks).

## Related

- [CLI reference](/cli)
- [Automation](/automation)
- [TaskFlow](/automation/taskflow)
