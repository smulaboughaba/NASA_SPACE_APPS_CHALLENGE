# Reglas Obligatorias para Gemini Flash 3.8 (Antigravity) — Rama `jesus`

Eres el asistente de **Jesús** (`@jesusorellanagil2002`) para el proyecto **Dancing with the SAR's** (NASA Space Apps Challenge).

## 1. REGLA CRÍTICA DE CARPETAS (NO ROMPER)
- **SOLO puedes crear, editar o borrar archivos dentro de:**
  1. `data_global_insar/` (Tarea 1 de Validación: cruce Satélite NASA ASF + USGS/Open-Meteo ➔ `hyperframes_global_insar.json` y `viabilidad_global_insar.md`)
  2. `frontend_storytelling/` (Tarea 2 de Visualización: Storyboard Animado de 4 Hyperframes + escala Local ➔ Global + glosario `sar_concepts`)
- **PROHIBIDO modificar, crear o borrar:**
  - `GEMINI.md`, `LEEME_JESUS.md`, `.gitignore`, `.github/`
  - Todo lo que está en `datos_compartidos/` (**SOLO LECTURA**)
  - Cualquier archivo fuera de `data_global_insar/` y `frontend_storytelling/`
*(GitHub Actions revertirá automáticamente la rama si modificas cualquier otro archivo).*

---

## 2. ESQUEMA EXACTO DEL JSON (PROHIBIDO INVENTAR CLAVES)
Lee `datos_compartidos/mock_events_contract.json` y `datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md`. Usa **exactamente estas claves**:

- En `datos_compartidos/mock_events_contract.json`:
  - `events[]` (4 eventos: `dana-valencia-2024`, `incendio-forestal-mediterraneo`, `terremoto-insar-global`, `ciclon-elnino-global`):
    - `id`, `title`, `scale` (`"local"` o `"global"`), `niche`, `location`
    - `dates`: `{ "t0_pre": "...", "t1_event": "...", "t2_post_sar": "..." }`
    - `sar_signature`: `{ "sensor_reference": "...", "band": "...", "polarization": "...", "mechanism": "...", "jepa_latent_anomaly_score": <num>, "affected_area_km2": <num>, "false_positive_reduction_pct": <num> }`
    - `storytelling_summary`: **STRING directo (texto plano), NO es un objeto.**
    - `attributions`: array de strings.
  - `sar_concepts[]` (5 items: `l-band`, `s-band`, `backscatter`, `insar`, `polarizacion`):
    - Cada objeto tiene **SOLO 3 claves**: `id`, `title`, `summary`.

- En `data_global_insar/hyperframes_global_insar.json` (generado por tu script Python):
  - Sigue exactamente las claves definidas en `datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md` (`hyperframes[]` con 4 objetos: `frame_index`, `id`, `stage`, `timestamp`, `headline`, `ai_pipeline_layer`, `metrics`, `visual_layer`).

---

## 3. REGLAS TÉCNICAS
1. **`data_global_insar/`:** Python puro (`urllib.request`, `json`, `csv`, `datetime`) sin instalar paquetes externos.
2. **`frontend_storytelling/`:** HTML5 + CSS3 + JS puro sin frameworks (`index.html`, `styles.css`, `app.js`), cargando `../data_global_insar/hyperframes_global_insar.json` y `../datos_compartidos/mock_events_contract.json` vía `fetch` (con fallback por si falla `file://`), listo para integrarse después en **Vite + GSAP** en `main`.
3. Responde paso a paso en español indicando qué archivos creaste.
