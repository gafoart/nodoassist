---
summary: "Updating NodoAssist safely (global install or source), plus rollback strategy"
read_when:
  - Updating NodoAssist
  - Something breaks after an update
title: "Updating"
---

Keep NodoAssist up to date.

For Docker, Podman, and Kubernetes image replacements, see
[Upgrading container images](/install/docker#upgrading-container-images). The
gateway runs startup-safe upgrade work before readiness and exits if mounted
state needs manual repair.

## Recommended: `nodoassist update`

Detects your install type (npm or git), fetches the latest version, runs `nodoassist doctor`, and restarts the gateway.

```bash
nodoassist update
```

Switch channels or target a specific version:

```bash
nodoassist update --channel beta
nodoassist update --channel extended-stable
nodoassist update --channel dev
nodoassist update --dry-run   # preview without applying
```

`nodoassist update` has no `--verbose` flag (the installer does). For diagnostics use
`--dry-run` to preview planned actions, `--json` for structured results, or
`nodoassist update status --json` to inspect channel and availability state.

`--channel beta` prefers the beta npm dist-tag, but falls back to stable/latest
when the beta tag is missing or its version is older than the latest stable
release. Use `--tag beta` for a one-off package update pinned to the raw npm
beta dist-tag instead.

`--channel extended-stable` is package-only, and installation remains
foreground-only. NodoAssist reads the public npm `extended-stable` selector,
verifies the selected exact package, and installs that exact version. Missing
or inconsistent registry data fails closed; it never falls back to `latest`.
If the selected version is older than the installed version, the normal
downgrade confirmation still applies. The CLI persists the channel after a
successful core update; a direct `npm install -g nodoassist@extended-stable`
does not update `update.channel`.
After the core swap, eligible official npm plugins with bare/default or
`latest` intent converge to that exact core version. Exact pins and explicit
non-`latest` tags, third-party plugins, and non-npm sources remain unchanged.
Catalog installs created by current NodoAssist versions retain that default
intent. Older records that contain only an exact version remain pinned because
NodoAssist cannot safely distinguish an old automatic pin from a user pin; run
`nodoassist plugins update @nodoassist/name` once on the extended-stable channel
to opt that plugin back into exact-core tracking.

`--channel dev` gives a persistent moving GitHub `main` checkout. For a one-off
package update, `--tag main` maps to the `github:nodoassist/nodoassist#main` package
spec and installs it directly through the target package manager (npm/pnpm/bun).

For managed plugins, a missing beta release is a warning, not a failure: the
core update can still succeed while a plugin falls back to its recorded
default/latest release.

See [Release channels](/install/development-channels) for channel semantics.

## Switch between npm and git installs

Use channels to change the install type. The updater keeps your state, config,
credentials, and workspace in `~/.nodoassist`; it only changes which NodoAssist
code install the CLI and gateway use.

```bash
# npm package install -> editable git checkout
nodoassist update --channel dev

# git checkout -> npm package install
nodoassist update --channel stable
```

Preview the install-mode switch first:

```bash
nodoassist update --channel dev --dry-run
nodoassist update --channel stable --dry-run
```

`dev` ensures a git checkout, builds it, and installs the global CLI from that
checkout. The `stable`, `extended-stable`, and `beta` channels use package
installs. Extended-stable is rejected on a git checkout without mutating or
converting it. If the gateway is already installed, `nodoassist update` refreshes
the service metadata and restarts it unless you pass `--no-restart`.

For package installs with a managed Gateway service, `nodoassist update` targets
the package root used by that service. If the shell `nodoassist` command comes
from a different install, the updater prints both roots and the managed
service's Node path, and checks that Node version against the target release's
`engines.node` requirement before replacing the package.

## Alternative: re-run the installer

```bash
curl -fsSL https://openclaw.ai/install.sh | bash
```

Add `--no-onboard` to skip onboarding. To force a specific install type, pass
`--install-method git --no-onboard` or `--install-method npm --no-onboard`.

If `nodoassist update` fails after the npm package install phase, re-run the
installer instead. It does not call the updater; it runs the global package
install directly and can recover a partially updated npm install.

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method npm
```

Pin the recovery to a specific version or dist-tag with `--version`:

```bash
curl -fsSL https://openclaw.ai/install.sh | bash -s -- --install-method npm --version <version-or-dist-tag>
```

## Alternative: manual npm, pnpm, or bun

```bash
npm i -g nodoassist@latest
```

Prefer `nodoassist update` for supervised installs: it can coordinate the package
swap with the running Gateway service. If you update manually on a supervised
install, stop the managed Gateway first. Package managers replace files in
place, and a running Gateway can otherwise try to load core or plugin files
mid-swap. Restart the Gateway after the package manager finishes so it picks up
the new install.

For a root-owned Linux system-global install, if `nodoassist update` fails with
`EACCES`, recover with system npm while keeping the Gateway stopped for the
manual replacement. Use the same profile flags/environment you normally use for
that Gateway. Replace `/usr/bin/npm` with the system npm that owns the
root-owned global prefix on your host:

```bash
nodoassist gateway stop
sudo /usr/bin/npm i -g nodoassist@latest
nodoassist gateway install --force
nodoassist gateway restart
```

Then verify:

```bash
nodoassist --version
curl -fsS http://127.0.0.1:18789/readyz
nodoassist plugins list --json
nodoassist gateway status --deep --json
nodoassist doctor --lint --json
```

When `nodoassist update` manages a global npm install, it installs the target
into a temporary npm prefix first, verifies the packaged `dist` inventory, then
swaps the clean package tree into the real global prefix — avoiding npm
overlaying a new package onto stale files from the old one. If the install
command fails, NodoAssist retries once with `--omit=optional`, which helps hosts
where native optional dependencies cannot compile.

NodoAssist-managed npm update and plugin-update commands also clear npm's
`min-release-age` supply-chain quarantine (or the older `before` config key)
for the child npm process. That policy exists for general protection, but an
explicit NodoAssist update means "install the selected release now."

```bash
pnpm add -g nodoassist@latest
```

```bash
bun add -g nodoassist@latest
```

### Advanced npm install topics

<AccordionGroup>
  <Accordion title="Read-only package tree">
    NodoAssist treats packaged global installs as read-only at runtime, even when the global package directory is writable by the current user. Plugin package installs live in NodoAssist-owned npm/git roots under the user config directory, and Gateway startup does not mutate the NodoAssist package tree.

    Some Linux npm setups install global packages under root-owned directories such as `/usr/lib/node_modules/nodoassist`. NodoAssist supports that layout because plugin install/update commands write outside that global package directory.

  </Accordion>
  <Accordion title="Hardened systemd units">
    Give NodoAssist write access to its config/state roots so explicit plugin installs, plugin updates, and doctor cleanup can persist their changes:

    ```ini
    ReadWritePaths=/var/lib/nodoassist /home/nodoassist/.nodoassist /tmp
    ```

  </Accordion>
  <Accordion title="Disk-space preflight">
    Before package updates and explicit plugin installs, NodoAssist tries a best-effort disk-space check for the target volume. Low space produces a warning with the checked path, but does not block the update because filesystem quotas, snapshots, and network volumes can change after the check. The actual package-manager install and post-install verification remain authoritative.
  </Accordion>
</AccordionGroup>

## Auto-updater

Off by default. Enable it in `~/.nodoassist/nodoassist.json`:

```json5
{
  update: {
    channel: "stable",
    auto: {
      enabled: true,
      stableDelayHours: 6,
      stableJitterHours: 12,
      betaCheckIntervalHours: 1,
    },
  },
}
```

| Channel           | Behavior                                                                                                                                     |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `stable`          | Waits `stableDelayHours` (default: 6), then applies with deterministic jitter across `stableJitterHours` (default: 12) for a spread rollout. |
| `extended-stable` | Checks for a read-only update hint on startup and every 24 hours when `checkOnStart` is enabled. Never applies automatically.                |
| `beta`            | Checks every `betaCheckIntervalHours` (default: 1) and applies immediately.                                                                  |
| `dev`             | No automatic apply. Use `nodoassist update` manually.                                                                                        |

The gateway also logs an update hint on startup (disable with
`update.checkOnStart: false`). Stored extended-stable selections use this
read-only hint path and the existing 24-hour hint interval, but never invoke
automatic installation, handoff, restart, stable delay/jitter, or beta polling.
For downgrade or incident recovery, set `NODOASSIST_NO_AUTO_UPDATE=1` in the gateway environment to block automatic applies even when `update.auto.enabled` is configured. Startup update hints can still run unless `update.checkOnStart` is also disabled.

Package-manager updates requested through the live Gateway control-plane
(`update.run`) do not replace the package tree inside the running Gateway
process. On managed service installs, the Gateway starts a detached handoff,
exits, and lets the normal `nodoassist update --yes --json` CLI path stop the
service, replace the package, refresh service metadata, restart, verify the
Gateway version and reachability, and recover an installed-but-unloaded macOS
LaunchAgent when possible. If the Gateway cannot make that handoff safely,
`update.run` reports a safe shell command instead of running the package
manager in-process.

## After updating

<Steps>

### Run doctor

```bash
nodoassist doctor
```

Migrates config, audits DM policies, and checks gateway health. Details: [Doctor](/gateway/doctor)

### Restart the gateway

```bash
nodoassist gateway restart
```

### Verify

```bash
nodoassist health
```

</Steps>

## Rollback

### Pin a version (npm)

```bash
npm i -g nodoassist@<version>
nodoassist doctor
nodoassist gateway restart
```

<Tip>
`npm view nodoassist version` shows the current published version.
</Tip>

### Pin a commit (source)

```bash
git fetch origin
git checkout "$(git rev-list -n 1 --before=\"2026-01-01\" origin/main)"
pnpm install && pnpm build
nodoassist gateway restart
```

To return to latest: `git checkout main && git pull`.

## If you are stuck

- Run `nodoassist doctor` again and read the output carefully.
- For `nodoassist update --channel dev` on source checkouts, the updater auto-bootstraps `pnpm` when needed. If you see a pnpm/corepack bootstrap error, install `pnpm` manually (or re-enable `corepack`) and rerun the update.
- Check: [Troubleshooting](/gateway/troubleshooting)
- Ask in Discord: [https://discord.gg/clawd](https://discord.gg/clawd)

## Related

- [Install overview](/install): all installation methods.
- [Doctor](/gateway/doctor): health checks after updates.
- [Migrating](/install/migrating): major version migration guides.
