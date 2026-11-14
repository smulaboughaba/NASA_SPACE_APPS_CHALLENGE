# Instrucciones para Claude Code — Rama `yaro` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Yaro** (`@ItsYarosun`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `frontend_analytics/` (Tarea 1: Dashboard Analítico de Ciencia de Datos Open Data + SHAP)
- `data_incendios_cultivos/` (Tarea 2: Extracción Open Data clima/incendios sin API key + análisis L-Band vs S-Band)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_YARO.md`, `.gitignore`
- Todo lo que haya en `.github/`
- Todo lo que haya en `datos_compartidos/` (es **SOLO LECTURA**)
- Cualquier archivo en la raíz o fuera de `frontend_analytics/` y `data_incendios_cultivos/`

*(Si Yaro hace `push` modificando cualquier ruta fuera de esas 2 carpetas, GitHub Actions bloqueará el push y revertirá la rama automáticamente).*

---

## 2. Arquitectura y Contrato de Datos (`datos_compartidos/mock_events_contract.json`)

El valor diferencial de este proyecto es explicar **por qué ocurre cada desastre** combinando radar **SAR (NISAR Banda L / Banda S / Sentinel-1)** con **Open Data** (clima, focos térmicos, DEM, USGS), logrando reducir falsos positivos frente a usar solo satélite.

Lee `datos_compartidos/mock_events_contract.json` (solo lectura). Incluye 4 eventos:
- `"incendio-forestal-mediterraneo"` (**tu caso principal de análisis**)
- `"dana-valencia-2024"`
- `"terremoto-insar-global"`
- `"ciclon-elnino-global"`

Claves exactas de cada objeto en `events[]`:
- `id`, `title`, `scale`, `niche`, `location`
- `sar_signature`: `band`, `polarization`, `mechanism`, `jepa_latent_anomaly_score`, `affected_area_km2`, `false_positive_reduction_pct`
- `shap_attributions`: lista de `{ "feature": "...", "contribution_pct": <número> }`
- `open_data_metrics`: diccionario por evento (siempre incluye `affected_land_cover_ha`, un diccionario `{ "<uso>": <hectareas> }`)
- `attributions`: lista de fuentes legales a citar

Antes de empezar cualquier tarea, lee `datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md` y el archivo `TAREA_*.md` correspondiente.

---

## 3. Reglas técnicas de calidad y simplicidad
1. **`frontend_analytics/`:** Código web autocontenido (`index.html`, `styles.css`, `app.js`) con Chart.js desde CDN oficial, leyendo `../datos_compartidos/mock_events_contract.json` vía `fetch`.
2. **`data_incendios_cultivos/`:** Scripts Python limpios usando librería estándar (`urllib.request`, `json`, `csv`) sin requerir `pip install`, generando salidas ligeras (<1 MB) y análisis científico claro en español.
3. Escribe comentarios claros en español e indica a Yaro exactamente qué archivos creaste dentro de sus carpetas.
