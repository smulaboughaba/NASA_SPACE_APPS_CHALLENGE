# Tarea 2 (Secundaria) — Visor Exploratorio de Datos LA 2025 (`frontend_mapa/`)

> **Haz esta tarea DESPUÉS de validar los datos en `data_sequia_incendios_la/` (`TAREA_1_COMPATIBILIDAD_DATOS.md`).**

## Objetivo
Construir un visor geoespacial sencillo con **Leaflet** que muestre sobre el mapa de Los Ángeles el resultado de tu estudio de compatibilidad (`reporte_compatibilidad_la.json` y `dataset_compatibilidad_la.csv`) junto con `datos_compartidos/mock_events_contract.json`, sirviendo como maqueta exploratoria antes de la integración final en Vite + MapLibre/Deck.gl.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y data_sequia_incendios_la/reporte_compatibilidad_la.json (si ya existe).
Trabaja ÚNICAMENTE dentro de la carpeta frontend_mapa/ (NO toques ningún archivo fuera de ella).

Crea en frontend_mapa/ un visor exploratorio limpio (index.html, styles.css, app.js) usando Leaflet desde CDN:
1. Centra el mapa en Los Ángeles (incendio-sequia-los-angeles-2025: [34.07, -118.54]) y dibuja el rectángulo bbox ([-118.70, 33.95, -117.95, 34.30]).
2. Carga vía fetch ../data_sequia_incendios_la/reporte_compatibilidad_la.json y ../datos_compartidos/mock_events_contract.json (incluye un fallback en JS si aún no existe el reporte).
3. Muestra un selector temporal de las pasadas reales de Sentinel-1 encontradas (fechas t0_pre, t1_event, t2_post_sar) junto a las tarjetas con la imagen browse pública de NASA ASF y las variables compatibles verificadas (humedad del suelo, racha de viento, CO, PM2.5, AOD y disponibilidad DISP-S1).
4. Incluye un bloque limpio de atribuciones legales leyendo attributions del contrato JSON.
```
