---
name: archivos
description: Guardar archivos que manda el cliente con una etiqueta natural y recuperarlos después (buscar, leer xlsx/xls/csv/PDF, listar).
---

# Archivos del cliente

Los archivos entrantes ya persisten en `media/inbound/` (recibes la ruta como
MediaPath), pero sin este índice no se pueden recuperar por referencia natural
("la lista de precios de maria"). Usa `scripts/archivos.py` (python3, ya
incluido en la imagen) desde el workspace.

## Cuándo usarla

- El cliente manda un archivo y pide guardarlo, o dice algo como "guárdalo
  como <etiqueta>": ejecuta `guardar` con una etiqueta natural descriptiva.
- El cliente pide un archivo previo ("léeme la lista de maria", "qué archivos
  tengo"): usa `buscar` / `leer` / `listar`.

## Comandos

```bash
# Guardar el último archivo entrante con etiqueta (y de quién viene)
python3 scripts/archivos.py guardar "lista de precios de maria" --ultimo-inbound --de "maria"

# Guardar una ruta concreta (MediaPath recibido)
python3 scripts/archivos.py guardar "factura enero" --ruta "/home/node/.nodoassist/media/inbound/factura---abc123.pdf" --de "pedro"

# Recuperar
python3 scripts/archivos.py buscar "precios maria"
python3 scripts/archivos.py leer "lista de precios de maria"          # vista previa
python3 scripts/archivos.py leer "lista de precios de maria" --todo   # completo
python3 scripts/archivos.py leer "factura enero" --hoja 2             # hoja N de un Excel
python3 scripts/archivos.py listar
```

Lee **xlsx, xls, csv y PDF** (pdftotext -layout). El índice vive en
`archivos/INDICE.md` + `archivos/indice.json` del workspace.

## Reglas

- Etiquetas naturales y descriptivas (quién + qué + cuándo si aplica).
- Si el cliente no da etiqueta, propónla tú a partir del contexto y confírmala.
- `leer` acepta la etiqueta, texto aproximado o el número del listado.
