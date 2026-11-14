# Instrucciones para Claude Code — Rama `hugo` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Hugo** (`@hviciana`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `frontend_mapa/` (Tarea 1: Visor Geoespacial Interactivo SAR con Leaflet)
- `data_inundaciones/` (Tarea 2: Extracción Open Data sin clave de lluvia DANA Valencia + análisis)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_HUGO.md`, `.gitignore`
- Todo lo que haya en `.github/`
- Todo lo que haya en `datos_compartidos/` (es **SOLO LECTURA**)
- Cualquier archivo en la raíz o fuera de `frontend_mapa/` y `data_inundaciones/`

*(Si Hugo hace `push` modificando cualquier ruta fuera de esas 2 carpetas, GitHub Actions bloqueará el push y revertirá la rama automáticamente).*

---

## 2. Arquitectura y Contrato de Datos (`datos_compartidos/mock_events_contract.json`)

Todo el proyecto gira en torno a demostrar cómo el radar **SAR (NISAR Banda L / S y Sentinel-1 / OPERA)** detecta desastres atravesando nubes y humo, y cómo mejora al cruzarlo con **Open Data** (lluvia, elevación DEM, focos, sismos).

Lee `datos_compartidos/mock_events_contract.json` (solo lectura). Contiene `events` (4 eventos):
- `"dana-valencia-2024"` (**tu caso principal**)
- `"incendio-forestal-mediterraneo"`
- `"terremoto-insar-global"`
- `"ciclon-elnino-global"`

Claves exactas de cada objeto en `events[]`:
- `id`, `title`, `scale` (`"local"` | `"global"`), `niche`, `location`
- `center_coords`: `[lat, lon]` (ej. `[39.42, -0.42]`)
- `bbox`: `[minLon, minLat, maxLon, maxLat]` (ej. `[-0.85, 39.15, -0.25, 39.58]` — ojo al orden `[lon, lat]` de geojson frente a `[lat, lon]` de Leaflet!)
- `dates`: `t0_pre`, `t1_event`, `t2_post_sar`
- `sar_signature`: `sensor_reference`, `band`, `polarization`, `mechanism`, `jepa_latent_anomaly_score`, `affected_area_km2`, `false_positive_reduction_pct` (y `mean_backscatter_drop_db` o `max_los_displacement_cm`)
- `open_data_metrics`: métricas meteorológicas / DEM / usos de suelo (`affected_land_cover_ha`)
- `attributions`: lista de fuentes legales a citar al pie

Antes de empezar cualquier tarea, lee también `datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md` y el archivo `TAREA_*.md` correspondiente.

---

## 3. Reglas técnicas de calidad y simplicidad
1. **`frontend_mapa/`:** Código web autocontenido (`index.html`, `styles.css`, `app.js`) cargando Leaflet desde CDN oficial, leyendo `../datos_compartidos/mock_events_contract.json` vía `fetch` (con fallback embebido por si se abre con `file://` o instrucciones simples con `python3 -m http.server`).
2. **`data_inundaciones/`:** Scripts Python limpios usando librería estándar (`urllib.request`, `json`, `csv`) para evitar errores de `pip install`, guardando salidas ligeras (<1 MB) y documentando claramente los hallazgos físicos en español.
3. Escribe comentarios útiles en español y explica a Hugo al terminar exactamente qué archivos creaste dentro de sus carpetas.
