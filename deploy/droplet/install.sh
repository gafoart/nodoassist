#!/usr/bin/env bash
# ============================================================================
# NodoAssist — instalador de droplet (Ubuntu/Debian x86_64), todo por defecto:
#   - Gateway NodoAssist en Docker (imagen ghcr.io/gafoart/nodoassist)
#   - Acceso por Telegram con allowlist; el admin del producto (424724340)
#     queda como owner/allowlisted automáticamente (contrato en el código:
#     src/config/product-access.ts — no requiere config).
#   - Config semilla: modos NodoNano/Mini/Pro/Ultra (alias), modelo por defecto
#     con fallback cruzado, timezone, razonamiento oculto, IDENTITY.md.
#   - Watchdog anti-trabe del polling de Telegram (systemd timer).
#   - Opcional: Mini App Dashboard (gafoart/nodo-assist-miniapp-dashboard)
#     con sus tokens generados y .env/nodes.json configurados.
#
# Uso (como root, desde un checkout del repo o con los archivos del bundle al lado):
#   TELEGRAM_BOT_TOKEN=123:ABC \
#   OPENROUTER_API_KEY=sk-or-... \
#   [NODE_NAME=zoto] \
#   [GHCR_TOKEN=ghp_...]              # si la imagen GHCR es privada
#   [DASHBOARD_REPO_TOKEN=github_pat] # PAT read-only -> instala el dashboard
#   [DASHBOARD_ALLOW_USER_IDS=111,222] # user_ids de clientes para la Mini App
#   bash install.sh
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="${APP_DIR:-/opt/nodoassist}"
STATE_DIR="$APP_DIR/state"
IMAGE="${NODOASSIST_IMAGE:-ghcr.io/gafoart/nodoassist:latest}"
NODE_NAME="${NODE_NAME:-nodo}"
TZ_DEFAULT="${NODOASSIST_TZ:-America/Caracas}"
DASHBOARD_REPO="${DASHBOARD_REPO:-gafoart/nodo-assist-miniapp-dashboard}"
ADMIN_TELEGRAM_USER_ID=424724340

[ "$(id -u)" -eq 0 ] || { echo "Corre como root (sudo)."; exit 1; }
[ -n "${TELEGRAM_BOT_TOKEN:-}" ] || { echo "Falta TELEGRAM_BOT_TOKEN."; exit 1; }
[ -n "${OPENROUTER_API_KEY:-}" ] || { echo "Falta OPENROUTER_API_KEY."; exit 1; }

step() { echo ""; echo "==> $1"; }

# ---------------------------------------------------------------- docker ----
step "Docker"
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker

if [ -n "${GHCR_TOKEN:-}" ]; then
  echo "$GHCR_TOKEN" | docker login ghcr.io -u gafoart --password-stdin
fi
docker pull "$IMAGE"

# ------------------------------------------------------ archivos del app ----
step "Archivos en $APP_DIR"
mkdir -p "$STATE_DIR/workspace"
cp "$SCRIPT_DIR/docker-compose.droplet.yml" "$APP_DIR/docker-compose.yml"

ENV_FILE="$APP_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<EOF
NODOASSIST_IMAGE=$IMAGE
NODOASSIST_STATE_DIR=$STATE_DIR
NODOASSIST_TZ=$TZ_DEFAULT
TELEGRAM_BOT_TOKEN=$TELEGRAM_BOT_TOKEN
OPENROUTER_API_KEY=$OPENROUTER_API_KEY
EOF
  chmod 600 "$ENV_FILE"
else
  echo "  .env ya existe; no se sobrescribe."
fi

# Config semilla solo si no hay config previa (los upgrades no la tocan).
if [ ! -f "$STATE_DIR/nodoassist.json" ]; then
  cp "$SCRIPT_DIR/seed/nodoassist.seed.json" "$STATE_DIR/nodoassist.json"
  echo "  Config semilla instalada (modos Nodo*, timezone, telegram allowlist)."
fi
if [ ! -f "$STATE_DIR/workspace/IDENTITY.md" ]; then
  cp "$SCRIPT_DIR/seed/IDENTITY.md" "$STATE_DIR/workspace/IDENTITY.md"
fi
# El estado lo escribe el usuario node (uid 1000) del contenedor.
chown -R 1000:1000 "$STATE_DIR"

# ---------------------------------------------------------------- arranque --
step "Gateway"
(cd "$APP_DIR" && docker compose up -d)

# ---------------------------------------------------------------- watchdog --
step "Watchdog"
cp "$SCRIPT_DIR/watchdog/nodoassist-watchdog.sh" /usr/local/bin/nodoassist-watchdog.sh
chmod +x /usr/local/bin/nodoassist-watchdog.sh
cp "$SCRIPT_DIR/watchdog/nodoassist-watchdog.service" /etc/systemd/system/
cp "$SCRIPT_DIR/watchdog/nodoassist-watchdog.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now nodoassist-watchdog.timer

# ------------------------------------------------------------- cli helper ---
cat > /usr/local/bin/nodoassist <<'EOF'
#!/usr/bin/env bash
# CLI de NodoAssist dentro del contenedor del gateway.
exec docker exec -it nodoassist-gateway node nodoassist.mjs "$@"
EOF
chmod +x /usr/local/bin/nodoassist

# ------------------------------------------------------------- dashboard ----
if [ -n "${DASHBOARD_REPO_TOKEN:-}" ]; then
  step "Mini App Dashboard ($DASHBOARD_REPO)"
  if ! command -v node >/dev/null || [ "$(node -p 'Number(process.versions.node.split(".")[0])')" -lt 22 ]; then
    curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
    apt-get install -y nodejs
  fi
  command -v git >/dev/null || apt-get install -y git

  DASH_DIR=/opt/nodo-tokens
  DASH_URL="https://${DASHBOARD_REPO_TOKEN}@github.com/${DASHBOARD_REPO}.git"
  # El instalador del dashboard clona, crea usuario de servicio, systemd y
  # el timer de auto-update (ver scripts/install.sh de ese repo).
  TMP_INSTALL="$(mktemp)"
  git clone --depth 1 "$DASH_URL" /tmp/nodo-dash-bootstrap
  cp /tmp/nodo-dash-bootstrap/scripts/install.sh "$TMP_INSTALL"
  rm -rf /tmp/nodo-dash-bootstrap
  APP_DIR="$DASH_DIR" bash "$TMP_INSTALL" "$DASH_URL"
  rm -f "$TMP_INSTALL"

  # Tokens y wiring del nodo: generados aquí, solo si aún están vacíos.
  NODE_UPPER="$(printf '%s' "$NODE_NAME" | tr '[:lower:]' '[:upper:]' | tr -c 'A-Z0-9' '_')"
  fill_env() { # fill_env KEY VALUE — solo si la clave está vacía o ausente
    local key="$1" value="$2"
    if grep -qE "^${key}=.+" "$DASH_DIR/.env"; then return 0; fi
    if grep -qE "^${key}=" "$DASH_DIR/.env"; then
      sed -i "s|^${key}=.*|${key}=${value}|" "$DASH_DIR/.env"
    else
      printf '%s=%s\n' "$key" "$value" >> "$DASH_DIR/.env"
    fi
  }
  fill_env ADMIN_SECRET "$(openssl rand -base64 24 | tr -d '=+/')"
  fill_env PAYMENTS_TOKEN "$(openssl rand -base64 24 | tr -d '=+/')"
  fill_env RESTART_TOKEN "$(openssl rand -base64 24 | tr -d '=+/')"
  fill_env NODE_DEFAULT "$NODE_NAME"
  fill_env TZ "$TZ_DEFAULT"
  fill_env "${NODE_UPPER}_OPENROUTER_KEY" "$OPENROUTER_API_KEY"
  fill_env "${NODE_UPPER}_BOT_TOKEN" "$TELEGRAM_BOT_TOKEN"

  # nodes.json para este nodo (el admin del producto siempre puede verla).
  ALLOW_IDS="${DASHBOARD_ALLOW_USER_IDS:-}"
  node - "$DASH_DIR/nodes.json" "$NODE_NAME" "$NODE_UPPER" "$ALLOW_IDS" "$ADMIN_TELEGRAM_USER_ID" <<'EOF'
const fs = require("node:fs");
const [path, name, upper, allowCsv, adminId] = process.argv.slice(2);
let nodes = {};
try { nodes = JSON.parse(fs.readFileSync(path, "utf8")); } catch {}
delete nodes.zoto; // placeholder del example
const allow = new Set([Number(adminId)]);
for (const raw of allowCsv.split(",")) {
  const id = Number(raw.trim());
  if (Number.isInteger(id) && id > 0) allow.add(id);
}
nodes[name] = nodes[name] ?? {
  display_name: name.toUpperCase(),
  openrouter_key_env: `${upper}_OPENROUTER_KEY`,
  bot_token_env: `${upper}_BOT_TOKEN`,
  markup: 2,
  allow_user_ids: [...allow],
};
fs.writeFileSync(path, JSON.stringify(nodes, null, 2) + "\n");
EOF
  chown nodo-tokens:nodo-tokens "$DASH_DIR/.env"
  systemctl restart nodo-tokens
  DASH_PORT="$(grep -E '^PORT=' "$DASH_DIR/.env" | cut -d= -f2 | tr -d '[:space:]')"
  echo "  Dashboard: $(curl -fsS "localhost:${DASH_PORT:-8787}/healthz" || echo 'healthz FALLO — revisar journalctl -u nodo-tokens')"
fi

# ---------------------------------------------------------------- resumen ---
step "Listo — verificación"
cat <<EOF
- Gateway:   docker ps --filter name=nodoassist-gateway
             docker logs -f nodoassist-gateway   (espera "polling ingress started")
- CLI:       nodoassist --version   ·   nodoassist config get channels.telegram
- Acceso:    solo el admin (Telegram $ADMIN_TELEGRAM_USER_ID) responde por defecto.
             Clientes: nodoassist config set channels.telegram.allowFrom '["<user_id>"]'
- Modos:     escribe /nodopro en Telegram -> "Cambiado a NodoPro."
- Watchdog:  journalctl -t nodoassist-watchdog
$( [ -n "${DASHBOARD_REPO_TOKEN:-}" ] && cat <<DASH
- Dashboard: systemctl status nodo-tokens · falta el túnel de Cloudflare y el
             botón de menú del bot (ver HANDOFF.md del repo del dashboard).
DASH
)
EOF
