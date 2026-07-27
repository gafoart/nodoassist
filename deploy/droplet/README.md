# NodoAssist — despliegue por defecto en droplet

Instalación estándar de un nodo NodoAssist en un droplet Ubuntu/Debian x86_64,
con el modelo de acceso del producto y las optimizaciones del handoff del
agente aplicadas por defecto.

## Qué instala

| Pieza                         | Cómo                                                                                                                                                                                                                             |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gateway NodoAssist            | Docker (`ghcr.io/gafoart/nodoassist:latest`, `linux/amd64`), loopback-only, restart + healthcheck                                                                                                                                |
| Acceso Telegram               | `dmPolicy: allowlist` por defecto; el admin del producto (Telegram `424724340`) siempre es owner y allowlisted — contrato en código (`src/config/product-access.ts`), no config                                                  |
| Niveles admin/client          | Clients (IDs añadidos a `channels.telegram.allowFrom`) chatean sin comandos y sin tools de control del host                                                                                                                      |
| Modos de modelo               | Alias `NodoNano` / `NodoMini` / `NodoPro` / `NodoUltra` (OpenRouter), primario Nano con fallback cruzado a Mini                                                                                                                  |
| Confidencialidad              | `reasoningDefault: off` + regla en `workspace/IDENTITY.md` (nunca revelar modelo real)                                                                                                                                           |
| Fecha/hora                    | `agents.defaults.userTimezone: America/Caracas` (+ `TZ` del contenedor)                                                                                                                                                          |
| Watchdog                      | Timer systemd cada 2 min: detecta el polling de Telegram trabado (`restarting (reason:` sin `polling ingress started`) o contenedor unhealthy y reinicia con cooldown de 6 min                                                   |
| CLI                           | Wrapper `nodoassist` en el host (exec dentro del contenedor)                                                                                                                                                                     |
| Skill `archivos`              | Guardar archivos del cliente con etiqueta natural y recuperarlos (xlsx/xls/csv/PDF); índice en `workspace/archivos/`                                                                                                             |
| Skill `dolar-venezuela`       | Tasa BCV/paralelo, histórico, brecha y conversión USD/Bs vía ve.dolarapi.com, con cache y fallback offline                                                                                                                       |
| Mini App Dashboard (opcional) | Clona e instala `gafoart/nodo-assist-miniapp-dashboard` con su propio installer/systemd/auto-update, genera `ADMIN_SECRET`/`PAYMENTS_TOKEN`/`RESTART_TOKEN`, y escribe `<NODO>_OPENROUTER_KEY`/`<NODO>_BOT_TOKEN` + `nodes.json` |

## Uso

```bash
# en el droplet, como root, con este directorio copiado (scp -r deploy/droplet root@droplet:)
TELEGRAM_BOT_TOKEN="123456:ABC..." \
OPENROUTER_API_KEY="sk-or-..." \
NODE_NAME="zoto" \
GHCR_TOKEN="<PAT read:packages si la imagen es privada>" \
DASHBOARD_REPO_TOKEN="<PAT read-only del repo del dashboard (omitir para no instalarlo)>" \
DASHBOARD_ALLOW_USER_IDS="111111111,222222222" \
bash droplet/install.sh
```

Idempotente: `.env`, `nodoassist.json`, `IDENTITY.md` y los secretos del
dashboard no se sobrescriben si ya existen; imagen, compose y watchdog sí se
actualizan. Para actualizar el gateway: `docker compose -f /opt/nodoassist/docker-compose.yml pull && docker compose -f /opt/nodoassist/docker-compose.yml up -d`.

## Checklist post-instalación (del handoff)

- [ ] `docker logs nodoassist-gateway` muestra `polling ingress started`.
- [ ] Escribirle al bot desde el admin (424724340) → responde. Desde otro ID → silencio.
- [ ] `/nodopro` → responde el cambio de modo sin exponer el ID real del modelo.
- [ ] Preguntar la fecha → día/hora de Venezuela correctos.
- [ ] `journalctl -t nodoassist-watchdog` tras 15 min → sin falsos positivos.
- [ ] (Dashboard) `curl localhost:8787/healthz` OK; falta túnel Cloudflare + botón de menú del bot (HANDOFF.md del repo del dashboard).

## Qué cambia respecto al handoff original (nodo OpenClaw viejo)

- **Sin parches al dist.** Los parches 1–2 del handoff (ocultar `/model`,
  `/models` y el ack con ID real) eran necesarios porque cualquier usuario con
  acceso podía ejecutar comandos. En NodoAssist los comandos de Telegram están
  gateados a admins por contrato de producto, así que los clients no pueden
  ejecutar ni ver salida de `/model`. No hay nada que reaplicar tras actualizar.
- **Allowlist/owner sin config.** El admin va horneado en el código; `doctor`,
  upgrades o configs nuevas no pueden dejarlo fuera.
- **systemd --user → Docker.** El servicio corre en Docker con restart y
  healthcheck; el watchdog corre en el host contra `docker logs`.
- La skill `archivos` del kit viejo está reimplementada aquí (sin pandas; usa
  openpyxl/xlrd/csv/pdftotext ya incluidos en la imagen). El matcher SAINT es
  específico de clientes SAINT y NO va por defecto: cópialo del tarball del
  nodo viejo a `/opt/nodoassist/state/` solo en nodos que lo usen.
- El ack de cambio de modo es solo-alias en el producto ("Cambiado a NodoX."),
  y el menú de comandos de Telegram solo se registra en los chats de los
  admins — sin parches, es comportamiento del código.

## Añadir un client

```bash
nodoassist config set channels.telegram.allowFrom '["<user_id>"]'
docker restart nodoassist-gateway
```

El client podrá chatear (texto, media, web, memoria) pero sin comandos slash y
sin tools de control del host (`group:runtime`, `group:fs`, `group:automation`,
`group:sessions`, `group:agents`, `group:nodes`).
