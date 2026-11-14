# Tarea 2 (Secundaria) — Dashboard Exploratorio El Niño / Ciclón (`frontend_analytics/`)

> **Haz esta tarea DESPUÉS de validar los datos en `data_elnino_ciclon/` (`TAREA_1_COMPATIBILIDAD_DATOS.md`).**

## Objetivo
Construir un panel exploratorio en **Chart.js** que muestre las series reales extraídas en `data_elnino_ciclon/` (lluvia, rachas de viento, cobertura nubosa y humedad del suelo junto a las marcas de pasadas `Sentinel-1`) más las gráficas de explicabilidad (`shap_attributions` y `affected_land_cover_ha`) de `datos_compartidos/mock_events_contract.json`.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y data_elnino_ciclon/reporte_compatibilidad_elnino.json (si ya existe).
Trabaja ÚNICAMENTE dentro de la carpeta frontend_analytics/ (NO toques ningún archivo fuera de ella).

Crea en frontend_analytics/ un dashboard analítico oscuro (index.html, styles.css, app.js) con Chart.js desde CDN:
1. Carga vía fetch ../data_elnino_ciclon/reporte_compatibilidad_elnino.json, ../data_elnino_ciclon/dataset_compatibilidad_elnino.csv (si existen) y ../datos_compartidos/mock_events_contract.json (evento ciclon-elnino-global por defecto, con fallback en JS si falla la carga local).
2. Tarjetas KPI mostrando: anomalía El Niño (NOAA ONI +1.8 °C), intervalo Δt entre pasadas Sentinel-1 reales, reducción de falsos positivos (31.0%) y área afectada (410.0 km²).
3. Gráfica 1 (Líneas/Barras Chart.js): serie diaria de lluvia, racha de viento y nubosidad (%) señalando exactamente los días con pasada SAR real de NASA ASF.
4. Gráfica 2 (Barras Horizontales Chart.js): shap_attributions (feature y contribution_pct) + Gráfica Donut de affected_land_cover_ha.
5. Tarjeta comparativa física L-Band (24 cm) vs S-Band (9.4 cm) / SweepSAR (>240 km) y bloque legal de attributions.
```
