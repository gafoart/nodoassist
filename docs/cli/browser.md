---
summary: "CLI reference for `nodoassist browser` (lifecycle, profiles, tabs, actions, state, and debugging)"
read_when:
  - You use `nodoassist browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to attach to your local signed-in Chrome via Chrome MCP
title: "Browser"
---

# `nodoassist browser`

Manage NodoAssist's browser control surface and run browser actions: lifecycle, profiles, tabs, snapshots, screenshots, navigation, input, state emulation, and debugging.

Related: [Browser tool](/tools/browser)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout in ms (default: `30000`).
- `--expect-final`: wait for a final Gateway response.
- `--browser-profile <name>`: choose a browser profile (default: `nodoassist`, or `browser.defaultProfile`).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
nodoassist browser profiles
nodoassist browser --browser-profile nodoassist start
nodoassist browser --browser-profile nodoassist open https://example.com
nodoassist browser --browser-profile nodoassist snapshot
```

Agents can run the same readiness check with `browser({ action: "doctor" })`.

## Quick troubleshooting

If `start` fails with `not reachable after start`, troubleshoot CDP readiness first. If `start` and `tabs` succeed but `open` or `navigate` fails, the browser control plane is healthy and the failure is usually a navigation SSRF policy block.

Minimal sequence:

```bash
nodoassist browser --browser-profile nodoassist doctor
nodoassist browser --browser-profile nodoassist start
nodoassist browser --browser-profile nodoassist tabs
nodoassist browser --browser-profile nodoassist open https://example.com
```

Detailed guidance: [Browser troubleshooting](/tools/browser#cdp-startup-failure-vs-navigation-ssrf-block)

## Lifecycle

```bash
nodoassist browser status
nodoassist browser doctor
nodoassist browser doctor --deep
nodoassist browser start
nodoassist browser start --headless
nodoassist browser stop
nodoassist browser --browser-profile nodoassist reset-profile
```

- `doctor --deep` adds a live snapshot probe: useful when basic CDP readiness is green but you want proof the current tab can be inspected.
- `stop` closes the active control session and clears temporary emulation overrides even for `attachOnly` and remote CDP profiles where NodoAssist did not launch the browser process itself. For local managed profiles, `stop` also stops the spawned browser process.
- `start --headless` applies only to that start request, and only when NodoAssist launches a local managed browser. It does not rewrite `browser.headless` or profile config, and is a no-op for an already-running browser.
- On Linux hosts without `DISPLAY` or `WAYLAND_DISPLAY`, local managed profiles run headless automatically unless `NODOASSIST_BROWSER_HEADLESS=0`, `browser.headless=false`, or `browser.profiles.<name>.headless=false` explicitly requests a visible browser.

## If the command is missing

If `nodoassist browser` is an unknown command, check `plugins.allow` in `~/.nodoassist/nodoassist.json`. When `plugins.allow` is present, list the bundled browser plugin explicitly unless the config already has a root `browser` block:

```json5
{
  plugins: {
    allow: ["telegram", "browser"],
  },
}
```

An explicit root `browser` block (for example `browser.enabled=true` or `browser.profiles.<name>`) also activates the bundled browser plugin under a restrictive plugin allowlist.

Related: [Browser tool](/tools/browser#missing-browser-command-or-tool)

## Profiles

Profiles are named browser routing configs:

- `nodoassist` (default): launches or attaches to a dedicated NodoAssist-managed Chrome instance (isolated user data dir).
- `user`: controls your existing signed-in Chrome session via Chrome DevTools MCP.
- custom CDP profiles: point at a local or remote CDP endpoint.

```bash
nodoassist browser profiles
nodoassist browser create-profile --name work --color "#FF5A36"
nodoassist browser create-profile --name chrome-live --driver existing-session
nodoassist browser create-profile --name remote --cdp-url https://browser-host.example.com
nodoassist browser delete-profile --name work
```

Use a specific profile with `--browser-profile <name>` on any subcommand, for example `nodoassist browser --browser-profile work tabs`.

## Tabs

```bash
nodoassist browser tabs
nodoassist browser tab new --label docs
nodoassist browser tab label t1 docs
nodoassist browser tab select 2
nodoassist browser tab close 2
nodoassist browser open https://docs.openclaw.ai --label docs
nodoassist browser focus docs
nodoassist browser close t1
```

`tabs` returns `suggestedTargetId` first, then the stable `tabId` (such as `t1`), the optional label, and the raw `targetId`. Pass `suggestedTargetId` back into `focus`, `close`, snapshots, and actions. Assign a label with `open --label`, `tab new --label`, or `tab label`; labels, tab ids, raw target ids, and unique target-id prefixes are all accepted. The request field is still named `targetId` for compatibility, but it accepts any of these tab references.

Raw target ids are volatile diagnostic handles, not durable agent memory: when Chromium replaces the underlying raw target during a navigation or form submit, NodoAssist keeps the stable `tabId`/label attached to the replacement tab when it can prove the match. Prefer `suggestedTargetId`.

## Snapshot / screenshot / actions

Snapshot:

```bash
nodoassist browser snapshot
nodoassist browser snapshot --urls
```

Screenshot:

```bash
nodoassist browser screenshot
nodoassist browser screenshot --full-page
nodoassist browser screenshot --ref e12
nodoassist browser screenshot --labels
```

- `--full-page` is for page captures only; it cannot be combined with `--ref` or `--element`.
- `existing-session` / `user` profiles support page screenshots and `--ref` screenshots from snapshot output, but not CSS `--element` screenshots.
- `--labels` overlays current snapshot refs on the screenshot. On Playwright-backed profiles it works with `--full-page` (full-page overlay), `--ref` (element-clip overlay by ARIA ref), and `--element` (element-clip overlay by CSS selector); in element-clip modes labels are projected relative to the element. The response also includes an `annotations` array (omitted when empty) with each ref's bounding box: `ref`, `number`, `role`, optional `name`, and `box: {x, y, width, height}` in the captured image's coordinate space (viewport / fullpage / element-relative).
  `existing-session` profiles render a chrome-mcp overlay on page screenshots but do not use the Playwright projection helper and do not include `annotations`; CSS `--element` screenshots are unsupported there. Without Playwright or chrome-mcp, labeled screenshots are not available.
- `snapshot --urls` appends discovered link destinations to AI snapshots so agents can choose direct navigation targets instead of guessing from link text alone.

Navigate/click/type (ref-based UI automation):

```bash
nodoassist browser navigate https://example.com
nodoassist browser click <ref>
nodoassist browser click-coords 120 340
nodoassist browser type <ref> "hello"
nodoassist browser press Enter
nodoassist browser hover <ref>
nodoassist browser scrollintoview <ref>
nodoassist browser drag <startRef> <endRef>
nodoassist browser select <ref> OptionA OptionB
nodoassist browser fill --fields '[{"ref":"1","value":"Ada"}]'
nodoassist browser wait --text "Done"
nodoassist browser evaluate --fn '(el) => el.textContent' --ref <ref>
nodoassist browser evaluate --fn 'const title = document.title; return title;'
nodoassist browser evaluate --timeout-ms 30000 --fn 'async () => { await window.ready; return true; }'
```

`evaluate --fn` accepts a function source, an expression, or a statement body. Statement bodies are wrapped as async functions, so use `return` for the value you want back. Use `--timeout-ms` when the page-side function may need longer than the default evaluate timeout. `browser.evaluateEnabled=false` (default: `true`) disables both `evaluate` and `wait --fn`.

Action responses return the current raw `targetId` after action-triggered page replacement when NodoAssist can prove the replacement tab. Scripts should still store and pass `suggestedTargetId`/labels for long-lived workflows.

File + dialog helpers:

```bash
nodoassist browser upload /tmp/nodoassist/uploads/file.pdf --ref <ref>
nodoassist browser upload media://inbound/file.pdf --ref <ref>
nodoassist browser waitfordownload
nodoassist browser download <ref> report.pdf
nodoassist browser dialog --accept
nodoassist browser dialog --dismiss --dialog-id d1
```

Managed Chrome profiles save ordinary click-triggered downloads into the NodoAssist downloads directory (`/tmp/nodoassist/downloads` by default, or the configured temp root). Use `waitfordownload` or `download` when the agent needs to wait for a specific file and return its path; those explicit waiters own the next download. Uploads accept files from the NodoAssist temp uploads root and NodoAssist-managed inbound media, including `media://inbound/<id>` and sandbox-relative `media/inbound/<id>` references. Nested media refs, traversal, and arbitrary local paths are rejected.

When an action opens a modal dialog, the action response returns `blockedByDialog` with `browserState.dialogs.pending`; pass `--dialog-id` to answer it directly. Dialogs handled outside NodoAssist appear under `browserState.dialogs.recent`.

## State and storage

Viewport + emulation:

```bash
nodoassist browser resize 1280 720
nodoassist browser set viewport 1280 720
nodoassist browser set offline on
nodoassist browser set media dark
nodoassist browser set timezone Europe/London
nodoassist browser set locale en-GB
nodoassist browser set geo 51.5074 -0.1278 --accuracy 25
nodoassist browser set device "iPhone 14"
nodoassist browser set headers '{"x-test":"1"}'
nodoassist browser set credentials myuser mypass
```

Cookies + storage:

```bash
nodoassist browser cookies
nodoassist browser cookies set session abc123 --url https://example.com
nodoassist browser cookies clear
nodoassist browser storage local get
nodoassist browser storage local set token abc123
nodoassist browser storage session clear
```

## Debugging

```bash
nodoassist browser console --level error
nodoassist browser pdf
nodoassist browser responsebody "**/api"
nodoassist browser highlight <ref>
nodoassist browser errors --clear
nodoassist browser requests --filter api
nodoassist browser trace start
nodoassist browser trace stop --out trace.zip
```

## Existing Chrome via MCP

Use the built-in `user` profile, or create your own `existing-session` profile:

```bash
nodoassist browser --browser-profile user tabs
nodoassist browser create-profile --name chrome-live --driver existing-session
nodoassist browser create-profile --name brave-live --driver existing-session --user-data-dir "~/Library/Application Support/BraveSoftware/Brave-Browser"
nodoassist browser create-profile --name chrome-port --driver existing-session --cdp-url http://127.0.0.1:9222
nodoassist browser --browser-profile chrome-live tabs
```

The default existing-session path is host-only Chrome MCP auto-connect. If the browser is already running with a DevTools endpoint, pass `--cdp-url` so Chrome MCP attaches to that endpoint instead. For Docker, Browserless, or other remote setups where Chrome MCP semantics are not needed, use a CDP profile instead.

Current existing-session limits:

- Snapshot-driven actions use refs, not CSS selectors.
- `browser.actionTimeoutMs` defaults supported `act` requests to 60000 ms when callers omit `timeoutMs`; per-call `timeoutMs` still wins.
- `click` is left-click only.
- `type` does not support `slowly=true`.
- `press` does not support `delayMs`.
- `hover`, `scrollintoview`, `drag`, `select`, `fill`, and `evaluate` reject per-call timeout overrides.
- `select` supports one value only.
- `wait --load networkidle` is not supported (works on managed and raw/remote CDP profiles).
- File uploads require `--ref` / `--input-ref`, do not support CSS `--element`, and support one file at a time.
- Dialog hooks do not support `--timeout`.
- Screenshots support page captures and `--ref`, but not CSS `--element`.
- `responsebody`, download interception, PDF export, and batch actions still require a managed browser or raw CDP profile.

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway proxies browser actions to that node; no separate browser control server is required.

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)

## Related

- [CLI reference](/cli)
- [Browser](/tools/browser)
