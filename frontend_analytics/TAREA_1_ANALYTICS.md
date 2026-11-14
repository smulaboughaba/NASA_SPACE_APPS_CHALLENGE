# Tarea 1 — Panel Analítico Open Data + SHAP (`frontend_analytics/`)

## Objetivo
Construir un dashboard interactivo con **Chart.js** que lea `datos_compartidos/mock_events_contract.json` y muestre métricas de impacto, explicabilidad IA (`shap_attributions`), usos del suelo afectados (`affected_land_cover_ha`) y comparativa física **L-Band vs S-Band**.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md.
Trabaja ÚNICAMENTE dentro de la carpeta frontend_analytics/ (no modifiques ningún archivo fuera de ella).

Crea allí un dashboard analítico web (index.html, styles.css, app.js) con diseño oscuro científico usando Chart.js desde CDN:
1. Selector superior para cambiar entre los 4 eventos de mock_events_contract.json (incendio-forestal-mediterraneo seleccionado por defecto).
2. 4 tarjetas KPI arriba mostrando: área afectada (sar_signature.affected_area_km2 en km²), Score de anomalía latente JEPA (sar_signature.jepa_latent_anomaly_score), Reducción de falsos positivos frente a solo SAR (sar_signature.false_positive_reduction_pct %), y banda/polarización activa (sar_signature.band + polarization).
3. Gráfica 1 (Barras horizontales Chart.js): "Explicabilidad IA — Peso de Variables SAR vs Open Data", leyendo shap_attributions (eje Y: feature, eje X: contribution_pct %).
4. Gráfica 2 (Donut o barras apiladas Chart.js): "Hectáreas afectadas por cobertura del suelo", leyendo dinamicamente el objeto open_data_metrics.affected_land_cover_ha, más una tabla con el resto de open_data_metrics del evento.
5. Tarjeta comparativa fija abajo explicando L-Band (24 cm, penetración en bosque/incendios) vs S-Band (9.4 cm, sensibilidad en cultivos/superficie) y sección de créditos leyendo event.attributions. Carga el JSON mediante fetch('../datos_compartidos/mock_events_contract.json').
```
