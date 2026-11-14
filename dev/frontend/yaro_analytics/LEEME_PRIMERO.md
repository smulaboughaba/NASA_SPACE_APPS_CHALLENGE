# LÉEME PRIMERO — Yaro (`dev/frontend/yaro_analytics/`)

- **Rama obligatoria:** `yaro` (usuario `@ItsYarosun`).
- **Tu único objetivo:** Crear los **gráficos y tarjetas de Analítica Open Data + IA (SHAP)** mostrando por qué ocurre cada evento y cuánto reduce falsos positivos frente a solo SAR.

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/frontend/yaro_analytics/`) ni de `dev/data_science/yaro_incendios_cultivos/`.
- GitHub Actions revertirá automáticamente cualquier `push` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- Contrato de datos local: `dev/shared/mock_events_contract.json` (solo lectura).
- Enfoque técnico: leer `open_data_metrics`, `shap_attributions` y `sar_signature.false_positive_reduction_pct` de cada evento.

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/frontend/yaro_analytics/. Lee dev/shared/mock_events_contract.json (NO lo modifiques).
Crea un dashboard HTML/JS/CSS o componente React (usando Chart.js o SVG limpio) que reciba un evento del JSON y muestre:
1) 3 tarjetas KPI: área afectada (sar_signature.affected_area_km2), score de anomalía latente (sar_signature.jepa_latent_anomaly_score) y reducción de falsos positivos (sar_signature.false_positive_reduction_pct).
2) Un gráfico horizontal de barras con shap_attributions (feature y contribution_pct) para explicar qué variable Open Data + SAR pesó más.
3) Una tabla clara con open_data_metrics (incluyendo affected_land_cover_ha) y attributions. No toques archivos fuera de dev/frontend/yaro_analytics/.
```
