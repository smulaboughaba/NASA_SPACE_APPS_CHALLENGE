# Instrucciones para Claude Code — Rama `hugo` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Hugo** (`@hviciana`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `data_inundaciones/` (Tarea 1 de Validación: cruce Satélite NASA SAR + Open Big Data DANA Valencia ➔ `hyperframes_dana_valencia.json` y `viabilidad_dana_valencia.md`)
- `frontend_mapa/` (Tarea 2 de Visualización: visor Leaflet con reproductor animado de los 4 Hyperframes para integrarse luego en Vite + MapLibre/Deck.gl + GSAP)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_HUGO.md`, `.gitignore`, `.github/`
- Todo lo que haya en `datos_compartidos/` (**SOLO LECTURA**)
- Cualquier archivo fuera de `data_inundaciones/` y `frontend_mapa/`

*(Si Hugo hace `push` tocando cualquier ruta fuera de esas 2 carpetas, GitHub Actions bloqueará el push y revertirá la rama automáticamente).*

---

## 2. Arquitectura y Contrato de Datos (`datos_compartidos/`)

1. **`datos_compartidos/mock_events_contract.json`** (solo lectura): contrato base de 4 eventos (`dana-valencia-2024` es tu evento principal).
   - Claves exactas de `dana-valencia-2024`: `id`, `title`, `scale`, `niche`, `location`, `center_coords` (`[39.42, -0.42]`), `bbox` (`[-0.85, 39.15, -0.25, 39.58]`, orden `[minLon, minLat, maxLon, maxLat]`), `dates` (`t0_pre`, `t1_event`, `t2_post_sar`), `sar_signature` (`sensor_reference`, `band`, `polarization`, `mechanism`, `mean_backscatter_drop_db`, `jepa_latent_anomaly_score`, `affected_area_km2`, `false_positive_reduction_pct`), `open_data_metrics`, `shap_attributions`, `storytelling_summary`, `attributions`.
2. **`datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md`** (solo lectura): contiene las **URLs verificadas sin API key** de NASA CMR (`OPERA DSWx-S1` / `RTC-S1`), NASA ASF (`Sentinel-1` GeoJSON), Open-Meteo ERA5 (incluyendo nubosidad `cloud_cover_mean`), y el esquema exacto de los **4 Hyperframes** (`frame_1_pre`, `frame_2_event_blindness`, `frame_3_sar_level1`, `frame_4_fusion_level2_shap`).

---

## 3. Reglas técnicas
1. **`data_inundaciones/`:** Scripts Python puros (`urllib.request`, `json`, `csv`, sin `pip install`) consultando las APIs reales, validando la coherencia temporal entre satélite y clima, y generando JSON ligero (<1 MB).
2. **`frontend_mapa/`:** HTML/CSS/JS limpio (Leaflet desde CDN), cargando primero `../data_inundaciones/hyperframes_dana_valencia.json` (con fallback a `../datos_compartidos/mock_events_contract.json`), diseñado de forma modular para conectarse después al motor **Vite + MapLibre/Deck.gl + GSAP** de `main`.
3. Comenta en español e indica al usuario exactamente qué archivos creaste dentro de sus 2 carpetas.
