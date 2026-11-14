# Tarea 2 de Visualización — Visor Animado de 4 Hyperframes (`frontend_mapa/`)

## Objetivo
Construir en `frontend_mapa/` un reproductor geoespacial animado con **Leaflet** que recorra paso a paso los **4 Hyperframes** generados en `data_inundaciones/hyperframes_dana_valencia.json`, mostrando la ceguera óptica por nubes, el barrido SAR con vista previa real de NASA y el filtro de falsos positivos IA. *(Samu lo integrará después en el motor Vite + MapLibre/Deck.gl + GSAP de `main`).*

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json, datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md y data_inundaciones/hyperframes_dana_valencia.json (si existe).
Trabaja ÚNICAMENTE dentro de la carpeta frontend_mapa/ (no modifiques ningún archivo fuera de ella).

Crea en frontend_mapa/ una interfaz web oscura de alto impacto visual (index.html, styles.css, app.js) con Leaflet desde CDN:
1. Carga primero ../data_inundaciones/hyperframes_dana_valencia.json vía fetch y también ../datos_compartidos/mock_events_contract.json (incluye un fallback en JS por si hyperframes_dana_valencia.json aún no se ha generado o falla la carga local).
2. Mapa Leaflet interactivo centrado en dana-valencia-2024 con transición suave (flyTo / flyToBounds según camera.center y camera.zoom del Hyperframe activo) dibujando el bbox oficial de Valencia.
3. Reproductor animado de los 4 Hyperframes en la parte inferior:
   - Botón Play / Pausa (auto-avance cada 3.5s) y botones directos para los 4 frames:
     1) Pre-evento (t0_pre)
     2) Crisis y Ceguera Óptica (cloud_cover_pct animando una capa visual de nubes sobre el bbox)
     3) Barrido Radar SAR Nivel 1 (animación de línea de escáner radar que revela una L.imageOverlay / tarjeta con visual_layer.sar_browse_url real de NASA y caída -6.8 dB)
     4) Fusión IA Nivel 2 + SHAP (resalta las métricas verificadas: 152.4 km² y reducción de 34.2% de falsos positivos).
4. Panel lateral de telemetría viva que muestre en cada frame: stage, headline, ai_pipeline_layer, métricas reales (lluvia mm, % nubosidad, anomaly_score) y al pie los créditos de attributions del JSON.
5. Mantén el código desacoplado (exportando si ayuda un objeto con los hooks de render) para facilitar su futura integración en Vite + MapLibre/Deck.gl + GSAP.
```
