# Tarea 1 — Visor Geoespacial SAR (`frontend_mapa/`)

## Objetivo
Construir un módulo visual interactivo con **Leaflet** que muestre los 4 eventos de `datos_compartidos/mock_events_contract.json`, permita alternar entre escala **Local** y **Global**, dibuje la zona afectada (`bbox`) y ofrezca un control temporal (`t0_pre` ➔ `t1_event` ➔ `t2_post_sar`) con métricas radar.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md.
Trabaja ÚNICAMENTE dentro de la carpeta frontend_mapa/ (no modifiques ningún archivo fuera de ella).

Crea allí una aplicación web limpia y responsive (index.html, styles.css, app.js) con diseño oscuro espacial profesional usando Leaflet desde CDN:
1. Selector rápido arriba con filtro de escala ("Todos", "Local", "Global") y botones para los 4 eventos de mock_events_contract.json (dana-valencia-2024 seleccionado por defecto).
2. Mapa Leaflet que haga zoom suave hacia event.center_coords ([lat, lon]) y dibuje un polígono/rectángulo interactivo usando event.bbox ([minLon, minLat, maxLon, maxLat] convertido correctamente a [[minLat, minLon], [maxLat, maxLon]]).
3. Un control deslizante o selector temporal de 3 pasos usando dates.t0_pre, dates.t1_event y dates.t2_post_sar para simular visualmente la diferencia entre "Óptico bloqueado por nubes/humo" vs "Detección SAR + Anomalía Latente" cambiando estilo/opacidad del área en el mapa y su etiqueta explicativa.
4. Panel lateral de telemetría mostrando: location, sensor_reference, band, polarization, mechanism, affected_area_km2, jepa_latent_anomaly_score, false_positive_reduction_pct, y el bloque legal attributions en el pie.
5. Carga los datos haciendo fetch('../datos_compartidos/mock_events_contract.json') y añade un botón de vista previa limpio por si se sirve con python3 -m http.server desde la raíz.
```
