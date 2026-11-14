# Instrucciones para Claude Code — Rama `yaro` (*Dancing with the SAR's*)

Eres el asistente de programación en VS Code para **Yaro** (`@ItsYarosun`) en el **NASA Space Apps Challenge** (*Dancing with the SAR's*).

## 1. Misión Realista (NO programar modelos IA)
Tu objetivo **NO** es programar, entrenar ni modificar modelos de IA (`T-SAR-JEPA` ni `LightGBM`). De eso se encarga Samu al volver.
Tu objetivo es realizar un **Estudio de Compatibilidad de Datos (EDA)** del caso **El Niño y Ciclón Costero en el Pacífico (`ciclon-elnino-global`)** para demostrar con datos reales si existen pasadas radar SAR alineadas en el tiempo ($\Delta t$) y series climáticas limpias para el futuro pipeline de Samu.

## 2. Regla crítica de rutas (Candado automático de GitHub)
**SOLO puedes crear, editar o borrar archivos dentro de estas 2 carpetas:**
- `data_elnino_ciclon/` (**Tarea 1 prioritaria:** script Python `analizar_compatibilidad_elnino.py`, `dataset_compatibilidad_elnino.csv`, `reporte_compatibilidad_elnino.json` e `informe_viabilidad_elnino.md`)
- `frontend_analytics/` (**Tarea 2 secundaria:** dashboard exploratorio con Chart.js sobre los datos compatibles)

**PROHIBIDO modificar, crear o borrar:**
- `CLAUDE.md`, `LEEME_YARO.md`, `.gitignore`, `.github/`
- Todo lo que haya en `datos_compartidos/` (**SOLO LECTURA**)
- Cualquier archivo fuera de `data_elnino_ciclon/` y `frontend_analytics/`

*(GitHub Actions bloqueará y revertirá automáticamente cualquier push fuera de esas 2 carpetas).*

---

## 3. Referencias (`datos_compartidos/`)
1. `datos_compartidos/mock_events_contract.json` (solo lectura): tu caso principal es `events[1]` (`"id": "ciclon-elnino-global"`, `center_coords: [16.85, -99.82]`, `bbox: [-100.30, 16.50, -99.30, 17.20]`, `dates: t0_pre=2023-10-15, t1_event=2023-10-25, t2_post_sar=2023-10-29`).
2. `datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md` (solo lectura): contiene las **URLs verificadas sin API key** de NASA ASF (`Sentinel-1 GRD_HD`), NASA CMR (`OPERA RTC-S1` / `DSWx-S1`) y `Open-Meteo ERA5`, además del contexto del índice **El Niño (NOAA ONI +1.8 °C)**.

---

## 4. Reglas técnicas
1. **`data_elnino_ciclon/`:** Python puro usando solo librería estándar (`urllib.request`, `json`, `csv`, `datetime`), sin `pip install`. Nunca inventes números: si un catálogo devuelve 0 gránulos para una fecha, reporta `0` con transparencia (esa es precisamente la prueba de compatibilidad).
2. **`frontend_analytics/`:** HTML/CSS/JS limpio con Chart.js desde CDN cargando JSON locales sin compilación.
3. Explica a Yaro al finalizar qué archivos creaste y el veredicto de compatibilidad de los datos.
