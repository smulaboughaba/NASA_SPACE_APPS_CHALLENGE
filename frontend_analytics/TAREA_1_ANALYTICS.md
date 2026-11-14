# Tarea 2 de Visualización — Analytics Animado por Hyperframes (`frontend_analytics/`)

## Objetivo
Construir un panel analítico en **Chart.js** que evolucione visualmente paso a paso a través de los **4 Hyperframes** de `data_incendios_cultivos/hyperframes_incendio_cultivos.json`: mostrando cómo en el Nivel 1 el radar tiene ruido con cultivos, y en el Nivel 2 la fusión **`LightGBM + SHAP`** depura la causa real.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json, datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md y data_incendios_cultivos/hyperframes_incendio_cultivos.json (si existe).
Trabaja ÚNICAMENTE dentro de la carpeta frontend_analytics/ (no modifiques ningún archivo fuera de ella).

Crea en frontend_analytics/ un dashboard analítico oscuro de ciencia de datos (index.html, styles.css, app.js) usando Chart.js desde CDN:
1. Carga ../data_incendios_cultivos/hyperframes_incendio_cultivos.json y ../datos_compartidos/mock_events_contract.json vía fetch (incluye fallback en JS por si hyperframes_incendio_cultivos.json aún no existe).
2. Selector superior del evento activo (incendio-forestal-mediterraneo por defecto) + barra interactiva de los 4 Hyperframes con botones Play / Pausa (transición animada cada 3.5s) y pasos 1 -> 2 -> 3 -> 4:
   - Al cambiar de Hyperframe, actualiza con animación suave de Chart.js:
     a) Gráfica de Barras Horizontales (active_shap del Hyperframe activo, viendo cómo pasa de señal bruta con falsos positivos en cultivos en Nivel 1 a las contribuciones causales exactas shap_attributions en Nivel 2).
     b) Gráfica Donut de hectáreas por cobertura del suelo (open_data_metrics.affected_land_cover_ha) y comparación visual de falsos positivos eliminados (-28.5% / false_positive_reduction_pct).
     c) Tarjetas KPI vivas con temperatura, humedad, viento, anomaly_score y vista previa de sar_browse_url de Sentinel-1 cuando esté disponible en el frame.
3. Bloque fijo comparando Banda L (24 cm, bosques e incendios) vs Banda S (9.4 cm, hojas y cultivos) y pie legal con attributions del JSON.
4. Organiza app.js en funciones limpias exportables para facilitar su integración futura en Vite + MapLibre/Deck.gl + GSAP.
```
