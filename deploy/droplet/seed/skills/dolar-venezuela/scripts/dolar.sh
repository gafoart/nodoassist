#!/usr/bin/env bash
# Tasa del dólar en Venezuela vía DolarApi (https://ve.dolarapi.com).
# Ver SKILL.md. Requiere: bash, curl, jq.
set -euo pipefail

BASE_URL="${DOLAR_VE_BASE_URL:-https://ve.dolarapi.com}"
CACHE_DIR="${DOLAR_VE_CACHE_DIR:-/tmp/dolar-ve-cache}"
TTL_HOY=900        # 15 min
TTL_HISTORICO=21600 # 6 h

err() { printf '%s\n' "$1" >&2; }

usage() {
  cat >&2 <<'EOF'
Uso:
  dolar.sh hoy [oficial|paralelo|todos] [--pretty]
  dolar.sh historico <oficial|paralelo> [--dias N] [--desde YYYY-MM-DD] [--hasta YYYY-MM-DD] [--pretty]
  dolar.sh brecha [--pretty]
  dolar.sh convertir <monto> <usd|bs> [oficial|paralelo] [--pretty]
EOF
  exit 2
}

# --- formato VE: coma decimal, punto de miles, 2 decimales -------------------
fmt_ve() {
  awk -v n="$1" 'BEGIN {
    s = sprintf("%.2f", n)
    split(s, p, ".")
    ent = p[1]; dec = p[2]
    neg = ""
    if (substr(ent, 1, 1) == "-") { neg = "-"; ent = substr(ent, 2) }
    out = ""
    while (length(ent) > 3) {
      out = "." substr(ent, length(ent) - 2) out
      ent = substr(ent, 1, length(ent) - 3)
    }
    printf "%s%s%s,%s", neg, ent, out, dec
  }'
}

fmt_fecha() { # ISO -> DD/MM/YYYY
  printf '%s' "$1" | awk -F'T' '{split($1, d, "-"); printf "%s/%s/%s", d[3], d[2], d[1]}'
}

# --- fetch con cache ---------------------------------------------------------
# fetch <ruta> <ttl_segundos> -> imprime el JSON; usa cache fresco, o API,
# o cache viejo con advertencia. Falla con exit != 0 solo sin API y sin cache.
fetch() {
  local route="$1" ttl="$2"
  local slug cache_file now age
  slug="$(printf '%s' "$route" | tr '/' '_' | tr -cd 'A-Za-z0-9_.-')"
  mkdir -p "$CACHE_DIR"
  cache_file="$CACHE_DIR/$slug.json"
  now="$(date +%s)"

  if [ -f "$cache_file" ]; then
    age=$((now - $(stat -c %Y "$cache_file" 2>/dev/null || stat -f %m "$cache_file")))
    if [ "$age" -lt "$ttl" ]; then
      cat "$cache_file"
      return 0
    fi
  fi

  local body=""
  for _attempt in 1 2; do
    if body="$(curl -fsS --max-time 10 "$BASE_URL$route" 2>/dev/null)" \
      && printf '%s' "$body" | jq -e . >/dev/null 2>&1; then
      printf '%s' "$body" > "$cache_file"
      printf '%s' "$body"
      return 0
    fi
  done

  if [ -f "$cache_file" ]; then
    err "⚠️  DolarApi no responde; usando cache del $(date -r "$cache_file" '+%d/%m/%Y %H:%M' 2>/dev/null || stat -f %Sm -t '%d/%m/%Y %H:%M' "$cache_file"). El dato puede estar viejo."
    cat "$cache_file"
    return 0
  fi
  err "❌ No se pudo consultar DolarApi ($BASE_URL$route) y no hay cache."
  return 1
}

nombre_fuente() {
  case "$1" in
    oficial) printf 'Dólar BCV' ;;
    paralelo) printf 'Dólar paralelo' ;;
    *) printf 'Dólar %s' "$1" ;;
  esac
}

# --- comandos ----------------------------------------------------------------
cmd_hoy() {
  local fuente="oficial" pretty=0
  for arg in "$@"; do
    case "$arg" in
      oficial | paralelo | todos) fuente="$arg" ;;
      --pretty) pretty=1 ;;
      *) usage ;;
    esac
  done

  if [ "$fuente" = "todos" ]; then
    local json
    json="$(fetch "/v1/dolares" "$TTL_HOY")"
    if [ "$pretty" = 0 ]; then
      printf '%s\n' "$json" | jq .
      return
    fi
    printf '%s\n' "$json" | jq -r '.[] | [.fuente, .promedio, .fechaActualizacion] | @tsv' |
      while IFS=$'\t' read -r f promedio fecha; do
        printf '%s: Bs. %s — actualizado %s\n' "$(nombre_fuente "$f")" "$(fmt_ve "$promedio")" "$(fmt_fecha "$fecha")"
      done
    return
  fi

  local json promedio fecha
  json="$(fetch "/v1/dolares/$fuente" "$TTL_HOY")"
  if [ "$pretty" = 0 ]; then
    printf '%s\n' "$json" | jq .
    return
  fi
  promedio="$(printf '%s' "$json" | jq -r '.promedio')"
  fecha="$(printf '%s' "$json" | jq -r '.fechaActualizacion')"
  printf '%s: Bs. %s — actualizado %s\n' "$(nombre_fuente "$fuente")" "$(fmt_ve "$promedio")" "$(fmt_fecha "$fecha")"
}

cmd_historico() {
  local fuente="" dias=0 desde="" hasta="" pretty=0
  while [ $# -gt 0 ]; do
    case "$1" in
      oficial | paralelo) fuente="$1" ;;
      --dias) shift; dias="${1:-}" ;;
      --desde) shift; desde="${1:-}" ;;
      --hasta) shift; hasta="${1:-}" ;;
      --pretty) pretty=1 ;;
      *) usage ;;
    esac
    shift
  done
  # Nunca /v1/historicos/dolares sin fuente: el histórico completo pesa ~2MB.
  [ -n "$fuente" ] || usage

  local json
  json="$(fetch "/v1/historicos/dolares/$fuente" "$TTL_HISTORICO")"
  if [ -n "$desde" ]; then
    json="$(printf '%s' "$json" | jq --arg d "$desde" --arg h "${hasta:-9999-12-31}" \
      '[.[] | select(.fecha >= $d and .fecha <= $h)]')"
  elif [ "${dias:-0}" -gt 0 ] 2>/dev/null; then
    json="$(printf '%s' "$json" | jq --argjson n "$dias" '.[-$n:]')"
  else
    json="$(printf '%s' "$json" | jq '.[-30:]')"
  fi

  if [ "$pretty" = 0 ]; then
    printf '%s\n' "$json" | jq .
    return
  fi
  printf '%s\n' "$json" | jq -r '.[] | [.fecha, .promedio] | @tsv' |
    while IFS=$'\t' read -r fecha promedio; do
      printf '%s  Bs. %s\n' "$fecha" "$(fmt_ve "$promedio")"
    done
}

cmd_brecha() {
  local pretty=0
  [ "${1:-}" = "--pretty" ] && pretty=1
  local oficial paralelo t_oficial t_paralelo brecha
  oficial="$(fetch "/v1/dolares/oficial" "$TTL_HOY")"
  paralelo="$(fetch "/v1/dolares/paralelo" "$TTL_HOY")"
  t_oficial="$(printf '%s' "$oficial" | jq -r '.promedio')"
  t_paralelo="$(printf '%s' "$paralelo" | jq -r '.promedio')"
  brecha="$(awk -v o="$t_oficial" -v p="$t_paralelo" 'BEGIN {printf "%.6f", (p - o) / o * 100}')"
  if [ "$pretty" = 0 ]; then
    jq -n --argjson o "$t_oficial" --argjson p "$t_paralelo" --argjson b "$brecha" \
      '{oficial: $o, paralelo: $p, brecha_pct: $b}'
    return
  fi
  printf 'Brecha cambiaria: %s%% — BCV Bs. %s vs paralelo Bs. %s\n' \
    "$(fmt_ve "$brecha")" "$(fmt_ve "$t_oficial")" "$(fmt_ve "$t_paralelo")"
}

cmd_convertir() {
  local monto="${1:-}" dir="${2:-}" fuente="oficial" pretty=0
  shift 2 2>/dev/null || usage
  for arg in "$@"; do
    case "$arg" in
      oficial | paralelo) fuente="$arg" ;;
      --pretty) pretty=1 ;;
      *) usage ;;
    esac
  done
  case "$dir" in usd | bs) ;; *) usage ;; esac
  printf '%s' "$monto" | grep -qE '^[0-9]+([.][0-9]+)?$' || { err "❌ Monto inválido: $monto"; exit 2; }

  local json tasa resultado
  json="$(fetch "/v1/dolares/$fuente" "$TTL_HOY")"
  tasa="$(printf '%s' "$json" | jq -r '.promedio')"
  if [ "$dir" = "usd" ]; then
    resultado="$(awk -v m="$monto" -v t="$tasa" 'BEGIN {printf "%.6f", m * t}')"
  else
    resultado="$(awk -v m="$monto" -v t="$tasa" 'BEGIN {printf "%.6f", m / t}')"
  fi

  if [ "$pretty" = 0 ]; then
    jq -n --argjson monto "$monto" --arg direccion "$dir" --arg fuente "$fuente" \
      --argjson tasa "$tasa" --argjson resultado "$resultado" \
      '{monto: $monto, direccion: $direccion, fuente: $fuente, tasa: $tasa, resultado: $resultado}'
    return
  fi
  if [ "$dir" = "usd" ]; then
    printf '%s USD = Bs. %s (tasa %s %s)\n' \
      "$(fmt_ve "$monto")" "$(fmt_ve "$resultado")" "$fuente" "$(fmt_ve "$tasa")"
  else
    printf 'Bs. %s = %s USD (tasa %s %s)\n' \
      "$(fmt_ve "$monto")" "$(fmt_ve "$resultado")" "$fuente" "$(fmt_ve "$tasa")"
  fi
}

command -v jq >/dev/null || { err "❌ Falta jq."; exit 1; }
command -v curl >/dev/null || { err "❌ Falta curl."; exit 1; }

case "${1:-}" in
  hoy) shift; cmd_hoy "$@" ;;
  historico) shift; cmd_historico "$@" ;;
  brecha) shift; cmd_brecha "$@" ;;
  convertir) shift; cmd_convertir "$@" ;;
  *) usage ;;
esac
