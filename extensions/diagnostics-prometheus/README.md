# @nodoassist/diagnostics-prometheus

Official Prometheus diagnostics exporter for NodoAssist.

This plugin exposes NodoAssist Gateway runtime metrics in Prometheus text format for Prometheus, Grafana, VictoriaMetrics, and compatible scrapers.

## Install

```bash
nodoassist plugins install @nodoassist/diagnostics-prometheus
```

Restart the Gateway after installing or updating the plugin.

## Configure

Enable the plugin and set the scrape endpoint options in `plugins.entries.diagnostics-prometheus.config`.

The full config surface, metric names, and scrape examples live in the docs:

- https://docs.openclaw.ai/gateway/prometheus

## Package

- Plugin id: `diagnostics-prometheus`
- Package: `@nodoassist/diagnostics-prometheus`
- Minimum NodoAssist host: `2026.4.25`
