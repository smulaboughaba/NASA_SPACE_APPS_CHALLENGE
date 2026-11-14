# Instrucciones para Claude Code — Rama `hugo` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Hugo** (`@hviciana`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Misión Realista (NO programar modelos IA)
Tu objetivo **NO** es programar, entrenar ni tocar modelos de IA (`T-SAR-JEPA` ni `LightGBM`). De eso se encarga Samu al volver.
Tu objetivo es realizar un **Estudio de Compatibilidad de Datos (EDA)** del caso **Sequía Extrema e Incendios Forestales de Los Ángeles (enero 2025 — *Palisades & Eaton Fires*)** para demostrar con datos reales si el satélite radar SAR y las variables atmosféricas/edáficas encajan bien para alimentar el pipeline de Samu.

## 2. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `data_sequia_incendios_la/` (**Tarea 1 prioritaria:** script Python `analizar_compatibilidad_la.py`, `dataset_compatibilidad_la.csv`, `reporte_compatibilidad_la.json` e `informe_viabilidad_la.md`)
- `frontend_mapa/` (**Tarea 2 secundaria:** visor exploratorio Leaflet con los datos compatibles)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_HUGO.md`, `.gitignore`, `.github/`
- Todo lo que haya en `datos_compartidos/` (**SOLO LECTURA**)
- Cualquier archivo fuera de `data_sequia_incendios_la/` y `frontend_mapa/`

*(GitHub Actions bloqueará y revertirá automáticamente cualquier push fuera de esas 2 carpetas).*

---

## 3. Referencias (`datos_compartidos/`)
1. `datos_compartidos/mock_events_contract.json` (solo lectura): tu caso principal es `events[0]` (`"id": "incendio-sequia-los-angeles-2025"`, `center_coords: [34.07, -118.54]`, `bbox: [-118.70, 33.95, -117.95, 34.30]`, `dates: t0_pre=2025-01-02, t1_event=2025-01-08, t2_post_sar=2025-01-14, t3_followup_sar=2025-01-21`).
2. `datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md` (solo lectura): contiene las **URLs verificadas sin API key** de NASA ASF (`Sentinel-1 GRD_HD`), NASA CMR (`OPERA RTC-S1`, `DIST-ALERT-HLS`, `DISP-S1`), `Open-Meteo ERA5` (sequía, temperatura, humedad, vientos) y `Open-Meteo Air Quality CAMS` (CO, NO2, PM2.5, PM10, AOD).

---

## 4. Reglas técnicas
1. **`data_sequia_incendios_la/`:** Python puro usando solo librería estándar (`urllib.request`, `json`, `csv`, `datetime`), sin `pip install`. Nunca inventes números: si una API fallara, reporta el error exacto.
2. **`frontend_mapa/`:** HTML/CSS/JS limpio con Leaflet desde CDN cargando datos ligeros locales/JSON sin compilación ni Node.js.
3. Explica a Hugo al finalizar qué archivos creaste y qué conclusiones salieron sobre la compatibilidad de los datos.
