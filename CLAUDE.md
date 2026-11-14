# Instrucciones para Claude Code — Rama `yaro` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Yaro** (`@ItsYarosun`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `data_incendios_cultivos/` (Tarea 1 de Validación: cruce Satélite NASA ASF Sentinel-1 + Open Big Data ERA5 ➔ `hyperframes_incendio_cultivos.json` y `viabilidad_incendio_cultivos.md`)
- `frontend_analytics/` (Tarea 2 de Visualización: panel Chart.js animado por los 4 Hyperframes para integrarse luego en Vite + MapLibre/Deck.gl + GSAP)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_YARO.md`, `.gitignore`, `.github/`
- Todo lo que haya en `datos_compartidos/` (**SOLO LECTURA**)
- Cualquier archivo fuera de `data_incendios_cultivos/` y `frontend_analytics/`

*(Si Yaro hace `push` tocando cualquier ruta fuera de esas 2 carpetas, GitHub Actions bloqueará el push y revertirá la rama automáticamente).*

---

## 2. Arquitectura y Contrato de Datos (`datos_compartidos/`)

1. **`datos_compartidos/mock_events_contract.json`** (solo lectura): contrato base (`incendio-forestal-mediterraneo` es tu evento principal).
   - Claves exactas de `incendio-forestal-mediterraneo`: `id`, `title`, `scale`, `niche`, `location`, `center_coords` (`[39.95, -0.58]`), `bbox` (`[-0.80, 39.80, -0.35, 40.12]`), `dates` (`t0_pre`, `t1_event`, `t2_post_sar`), `sar_signature` (`sensor_reference`, `band`, `polarization`, `mechanism`, `mean_backscatter_drop_db`, `jepa_latent_anomaly_score`, `affected_area_km2`, `false_positive_reduction_pct`), `open_data_metrics` (incluye `affected_land_cover_ha`), `shap_attributions` (`[{ "feature", "contribution_pct" }]`), `storytelling_summary`, `attributions`.
2. **`datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md`** (solo lectura): incluye las **URLs verificadas sin API key** de NASA ASF (`Sentinel-1 GRD_HD` GeoJSON), Open-Meteo ERA5 (humedad, viento, temperatura máxima, nubosidad `cloud_cover_mean`), y la estructura estándar de los **4 Hyperframes** (`frame_1_pre`, `frame_2_event_blindness`, `frame_3_sar_level1`, `frame_4_fusion_level2_shap`).

---

## 3. Reglas técnicas
1. **`data_incendios_cultivos/`:** Scripts Python puros (`urllib.request`, `json`, `csv`, sin `pip install`) consultando las APIs reales y generando salidas ligeras (<1 MB).
2. **`frontend_analytics/`:** HTML/CSS/JS limpio (Chart.js desde CDN), cargando `../data_incendios_cultivos/hyperframes_incendio_cultivos.json` y `../datos_compartidos/mock_events_contract.json` vía `fetch` (con fallback por si falla `file://`), listo para integrarse en **Vite + GSAP** en `main`.
3. Comenta en español e indica al usuario exactamente qué archivos creaste dentro de sus 2 carpetas.
