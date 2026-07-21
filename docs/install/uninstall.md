---
summary: "Uninstall NodoAssist completely (CLI, service, state, workspace)"
read_when:
  - You want to remove NodoAssist from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

Two paths:

- **Easy path** if `nodoassist` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
nodoassist uninstall
```

State removal preserves configured workspace directories unless you also select `--workspace`.

Preview what will be removed (safe):

```bash
nodoassist uninstall --dry-run --all
```

Non-interactive (automation / npx). Use with caution and only after confirming scopes:

```bash
nodoassist uninstall --all --yes --non-interactive
npx -y nodoassist uninstall --all --yes --non-interactive
```

Flags: `--service`, `--state`, `--workspace`, `--app` select individual scopes; `--all` selects all four.

Manual steps (same result):

1. Stop the gateway service:

```bash
nodoassist gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
nodoassist gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${NODOASSIST_STATE_DIR:-$HOME/.nodoassist}"
```

If you set `NODOASSIST_CONFIG_PATH` to a custom location outside the state dir, delete that file too.
If you want to keep a workspace inside the state dir, such as `~/.nodoassist/workspace`, move it aside before running `rm -rf` or delete state contents selectively.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.nodoassist/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g nodoassist
pnpm remove -g nodoassist
bun remove -g nodoassist
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/NodoAssist.app
```

Notes:

- If you used profiles (`--profile` / `NODOASSIST_PROFILE`), repeat step 3 for each state dir (defaults are `~/.nodoassist-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `nodoassist` is missing.

### macOS (launchd)

Default label is `ai.nodoassist.gateway` (or `ai.nodoassist.<profile>` with a profile):

```bash
launchctl bootout gui/$UID/ai.nodoassist.gateway
rm -f ~/Library/LaunchAgents/ai.nodoassist.gateway.plist
```

If you used a profile, replace the label and plist name with `ai.nodoassist.<profile>`.

### Linux (systemd user unit)

Default unit name is `nodoassist-gateway.service` (or `nodoassist-gateway-<profile>.service`). A pre-rename `clawdbot-gateway.service` unit may still exist on machines upgraded from very old installs; `nodoassist uninstall` / `nodoassist gateway uninstall` detects and removes it automatically.

```bash
systemctl --user disable --now nodoassist-gateway.service
rm -f ~/.config/systemd/user/nodoassist-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `NodoAssist Gateway` (or `NodoAssist Gateway (<profile>)`).
The task launches a windowless `gateway.vbs` script under your state dir, which in turn
runs `gateway.cmd`; remove both.

```powershell
schtasks /Delete /F /TN "NodoAssist Gateway"
Remove-Item -Force "$env:USERPROFILE\.nodoassist\gateway.cmd" -ErrorAction SilentlyContinue
Remove-Item -Force "$env:USERPROFILE\.nodoassist\gateway.vbs" -ErrorAction SilentlyContinue
```

If you used a profile, delete the matching task name and the `gateway.cmd` /
`gateway.vbs` files under `~\.nodoassist-<profile>`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://openclaw.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g nodoassist@latest`.
Remove it with `npm rm -g nodoassist` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `nodoassist ...` / `bun run nodoassist ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.

## Related

- [Install overview](/install)
- [Migration guide](/install/migrating)
