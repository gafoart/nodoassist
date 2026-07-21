---
summary: "Run the NodoAssist Gateway on EasyRunner with Podman and Caddy"
read_when:
  - Deploying NodoAssist on EasyRunner
  - Running the Gateway behind EasyRunner's Caddy proxy
  - Choosing persistent volumes and auth for a hosted Gateway
title: "EasyRunner"
---

EasyRunner hosts the NodoAssist Gateway as a small containerized app behind its
Caddy proxy. This guide assumes an EasyRunner host that runs Podman-compatible
Compose apps and terminates HTTPS through Caddy.

## Before you begin

- An EasyRunner server with a domain routed to it.
- The official NodoAssist image (`ghcr.io/nodoassist/nodoassist`) or your own build.
- A persistent config volume for `/home/node/.nodoassist`.
- A persistent workspace volume for `/home/node/.nodoassist/workspace`.
- A strong Gateway token or password.

Keep device auth enabled when possible. If your reverse proxy cannot carry
device identity correctly, fix trusted-proxy settings first (see
[Trusted proxy auth](/gateway/trusted-proxy-auth)); use dangerous auth
bypasses only on a fully private, operator-controlled network.

## Compose app

Create an EasyRunner app with a Compose file shaped like this:

```yaml
services:
  nodoassist:
    image: ghcr.io/nodoassist/nodoassist:latest
    restart: unless-stopped
    environment:
      NODOASSIST_GATEWAY_TOKEN: ${NODOASSIST_GATEWAY_TOKEN}
      NODOASSIST_HOME: /home/node
      NODOASSIST_STATE_DIR: /home/node/.nodoassist
      NODOASSIST_CONFIG_PATH: /home/node/.nodoassist/nodoassist.json
      NODOASSIST_WORKSPACE_DIR: /home/node/.nodoassist/workspace
    volumes:
      - nodoassist-config:/home/node/.nodoassist
      - nodoassist-workspace:/home/node/.nodoassist/workspace
    labels:
      caddy: nodoassist.example.com
      caddy.reverse_proxy: "{{upstreams 1455}}"
    command: ["node", "nodoassist.mjs", "gateway", "--bind", "lan", "--port", "1455"]

volumes:
  nodoassist-config:
  nodoassist-workspace:
```

Replace `nodoassist.example.com` with your Gateway hostname. Store
`NODOASSIST_GATEWAY_TOKEN` in EasyRunner's secret/environment manager instead of
committing it to the app definition. The image binds to loopback by default,
so the explicit `--bind lan --port 1455` in `command` is required for Caddy to
reach the container.

## Configure NodoAssist

Inside the persistent config volume, keep the Gateway reachable only through
the proxy and require auth:

```json5
{
  gateway: {
    bind: "lan",
    port: 1455,
    auth: {
      token: "${NODOASSIST_GATEWAY_TOKEN}",
    },
  },
}
```

If Caddy terminates TLS for the Gateway, configure trusted-proxy settings for
the exact proxy path rather than disabling auth checks globally. See
[Trusted proxy auth](/gateway/trusted-proxy-auth).

## Verify

From your workstation:

```bash
nodoassist gateway probe --url https://openclaw.example.com --token <token>
nodoassist gateway status --url https://openclaw.example.com --token <token>
```

From the EasyRunner host, `GET /healthz` (liveness) and `GET /readyz`
(readiness) need no auth and back the image's built-in container health
check. Also check the app logs for a listening Gateway and no startup
SecretRef, plugin, or channel auth failures.

## Updates and backups

- Pull or build the new NodoAssist image, then redeploy the EasyRunner app.
- Back up the `nodoassist-config` volume before updates. It holds
  `nodoassist.json`, `agents/<agentId>/agent/auth-profiles.json`, and installed
  plugin package state.
- Back up `nodoassist-workspace` if agents write durable project data there.
- Run `nodoassist doctor` after major updates to catch config migrations and
  service warnings.

## Troubleshooting

- `gateway probe` cannot connect: confirm the Caddy hostname points at the app
  and that the container listens on `0.0.0.0:1455`.
- Auth fails: rotate the token in EasyRunner secrets and the local client
  command together.
- Files are root-owned after restore: the image runs as `node` (uid 1000);
  repair the mounted volumes so that user can write
  `/home/node/.nodoassist` and `/home/node/.nodoassist/workspace`.
- Browser or channel plugins fail: check whether the required external
  binaries, network egress, and mounted credentials are available inside the
  container.
