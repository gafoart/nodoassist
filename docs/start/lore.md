---
summary: "Origen, principios y tono de NodoAssist, para escribir docs y copy coherentes"
read_when:
  - Escribiendo docs o copy de producto que necesiten el tono de NodoAssist
title: "El origen de NodoAssist"
---

# El origen de NodoAssist 👾📖

_Un asistente agentic que vive donde ya conversas._

## Qué es

NodoAssist es un gateway que corre en tu propia máquina y conecta tus canales de
mensajería —WhatsApp, Telegram, Discord, Slack, iMessage, Signal, Matrix y
varios más— con agentes de IA que pueden ejecutar trabajo real: leer código,
correr comandos, revisar logs, desplegar.

La idea es simple: en lugar de abrir otra aplicación más, le escribes a tu
agente por el mismo chat que ya tienes abierto.

## De dónde viene el nombre

```text
NODO = el punto donde se cruzan las conexiones
     = un proceso tuyo, en tu hardware, bajo tus reglas
     = la red se arma nodo por nodo
```

NodoAssist es el asistente de esa red. No vive en la nube de nadie más: vive en
tu nodo.

## Principios

**Tu máquina, tus reglas.** El gateway corre donde tú decidas. Las credenciales
se quedan en `~/.nodoassist/`. Ningún mensaje pasa por un servidor ajeno salvo
que tú lo configures así.

**Agentic, no chatbot.** La diferencia no es el modelo: es que el agente tiene
herramientas, permisos y consecuencias. Puede abrir un PR, reiniciar un
servicio o borrarte un archivo. Por eso existen los códigos de emparejamiento,
las listas de permitidos y las aprobaciones de ejecución.

**Open source de verdad.** Puedes leer exactamente qué hace el agente con tu
config, tus logs y tus mensajes. Si no te gusta, lo cambias.

**Un solo camino canónico.** Cuando algo cambia, migra. No se acumulan modos de
compatibilidad ni rutas paralelas "por si acaso".

## Tono

NodoAssist habla como un colega técnico competente: directo, con humor seco,
sin solemnidad de manual corporativo. Explica lo que hizo y lo que falló sin
adornarlo.

Lo que **no** hace: prometer más de lo que puede, esconder un error detrás de
un mensaje amable, ni celebrar como logro algo que todavía no verificó.

Las taglines del CLI (`src/cli/tagline.ts`) son la referencia viva de ese tono.

## Textos que definen a un agente

Cada agente de NodoAssist se arma con un puñado de archivos, y vale la pena
conocerlos porque son los que le dan carácter:

- **`AGENTS.md`** — las instrucciones de operación: qué puede hacer, qué no, y
  cómo trabajar en este repositorio.
- **`SOUL.md`** — el documento de identidad del agente: quién es y cómo habla.
- **`USER.md`** — contexto sobre ti, para que no tengas que repetirlo.
- **`memory/*.md`** — la memoria de largo plazo entre sesiones.

## Relacionado

- [Primeros pasos](/start/getting-started)
