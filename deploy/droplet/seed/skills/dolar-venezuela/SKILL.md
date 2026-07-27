---
name: dolar-venezuela
description: Consulta la tasa del dólar en Venezuela (BCV oficial y paralelo), histórico, brecha cambiaria y conversión USD/Bs vía DolarApi. Úsala cuando pregunten "a cuánto está el dólar", "tasa BCV", "tasa de hoy", "dólar paralelo", "cuánto son X dólares en bolívares", "brecha cambiaria" o pidan histórico de tasas.
---

# Dólar Venezuela (DolarApi)

Consulta tasas del dólar en Venezuela con `scripts/dolar.sh` (bash + curl + jq,
todo incluido en la imagen). API pública sin auth: `https://ve.dolarapi.com`.

## Comandos

```bash
# Tasa de hoy (default: oficial/BCV)
skills/dolar-venezuela/scripts/dolar.sh hoy oficial --pretty
# → Dólar BCV: Bs. 674,93 — actualizado 07/07/2026

skills/dolar-venezuela/scripts/dolar.sh hoy paralelo --pretty
skills/dolar-venezuela/scripts/dolar.sh hoy todos --pretty

# Histórico (solo por fuente; default últimos 30 registros)
skills/dolar-venezuela/scripts/dolar.sh historico oficial --dias 7
skills/dolar-venezuela/scripts/dolar.sh historico paralelo --desde 2026-01-01 --hasta 2026-03-31 --pretty

# Brecha cambiaria (% paralelo vs oficial)
skills/dolar-venezuela/scripts/dolar.sh brecha --pretty
# → Brecha cambiaria: 12,34% — BCV Bs. 674,93 vs paralelo Bs. 758,20

# Conversión (default fuente: oficial)
skills/dolar-venezuela/scripts/dolar.sh convertir 100 usd --pretty
# → 100,00 USD = Bs. 67.493,05 (tasa oficial 674,93)
skills/dolar-venezuela/scripts/dolar.sh convertir 5000 bs paralelo --pretty
```

Sin `--pretty` la salida es JSON limpio (valores crudos, sin redondear) para
procesar. Con `--pretty`, texto en español con formato venezolano (coma
decimal, punto de miles, 2 decimales).

## Endpoints

| Ruta                              | Qué devuelve                |
| --------------------------------- | --------------------------- |
| `/v1/dolares`                     | array con todas las fuentes |
| `/v1/dolares/oficial`             | tasa BCV de hoy             |
| `/v1/dolares/paralelo`            | tasa paralelo de hoy        |
| `/v1/historicos/dolares/oficial`  | histórico solo BCV          |
| `/v1/historicos/dolares/paralelo` | histórico solo paralelo     |

NUNCA uses `/v1/historicos/dolares` sin fuente (pesa ~2MB); el script ya lo
impide.

## ⚠️ Schema venezolano

En Venezuela `compra` y `venta` SIEMPRE vienen en `null`; **el valor de la
tasa está en `promedio`**. No asumas el schema de dolarapi.com (Argentina),
que sí usa compra/venta y `casa` en vez de `fuente`.

```json
{
  "moneda": "USD",
  "fuente": "oficial",
  "promedio": 674.9305,
  "fechaActualizacion": "2026-07-07T00:00:00-04:00"
}
```

## Si la API no responde

El script cachea en `/tmp/dolar-ve-cache/` (15 min la tasa de hoy, 6 h los
históricos). Si DolarApi falla, responde con el cache y avisa por stderr que
el dato es viejo con su fecha — pásale esa advertencia al usuario. Si no hay
cache, el script sale con error: dile al usuario que la fuente no está
disponible en este momento, no inventes una tasa.
