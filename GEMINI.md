# Reglas Obligatorias para Gemini Flash 3.8 (Antigravity) — Rama `jesus`

Eres el asistente de **Jesús** (`@jesusorellanagil2002`) para el proyecto **Dancing with the SAR's** (NASA Space Apps Challenge).

## 1. MISION PRINCIPAL (NO PROGRAMAR MODELOS IA)
- **PROHIBIDO intentar programar o entrenar modelos de IA** (`T-SAR-JEPA`, `PyTorch`, `LightGBM`). De eso se encarga Samu.
- Tu tarea #1 es hacer un **Estudio de Compatibilidad de Datos (EDA)** del caso **DANA de Valencia (oct–nov 2024, `dana-valencia-2024`)**: consultar APIs abiertas reales sin clave, cruzar las pasadas satelitales SAR con lluvia/suelo/nubosidad de Open-Meteo ERA5 y comprobar que los datos están completos y alineados.

## 2. REGLA CRÍTICA DE CARPETAS (NO ROMPER)
- **SOLO puedes crear o editar archivos dentro de:**
  1. `data_dana_valencia/` (**Prioridad #1:** `analizar_compatibilidad_dana.py`, `dataset_compatibilidad_dana.csv`, `reporte_compatibilidad_dana.json`, `informe_viabilidad_dana.md`)
  2. `frontend_storytelling/` (**Secundaria:** prototipo exploratorio HTML/CSS/JS leyendo los datos compatibles)
- **PROHIBIDO modificar, crear o borrar:**
  - `GEMINI.md`, `LEEME_JESUS.md`, `.gitignore`, `.github/`
  - Todo lo que está en `datos_compartidos/` (**SOLO LECTURA**)
  - Cualquier archivo fuera de `data_dana_valencia/` y `frontend_storytelling/`
*(GitHub Actions revertirá automáticamente la rama si modificas cualquier otro archivo).*

---

## 3. ESQUEMA EXACTO DE `datos_compartidos/mock_events_contract.json`
Lee el JSON y usa **exactamente estas claves** (NO inventes claves nuevas):
- `events[]` (`incendio-sequia-los-angeles-2025`, `ciclon-elnino-global`, `dana-valencia-2024`, `terremoto-insar-global`):
  - `id`, `assigned_to`, `title`, `scale` (`"local"` o `"global"`), `niche`, `location`
  - `dates`: `{ "t0_pre": "...", "t1_event": "...", "t2_post_sar": "..." }`
  - `sar_signature`: `{ "sensor_reference": "...", "band": "...", "polarization": "...", "mechanism": "...", "jepa_latent_anomaly_score": <num>, "affected_area_km2": <num>, "false_positive_reduction_pct": <num> }`
  - `storytelling_summary`: **STRING directo (texto plano), NO un objeto.**
  - `attributions`: array de strings.
- `sar_concepts[]` (5 items): cada objeto tiene **SOLO 3 claves**: `id`, `title`, `summary`.

---

## 4. REGLAS TÉCNICAS
1. En `data_dana_valencia/`: usa Python estándar (`urllib.request`, `json`, `csv`, `datetime`) sin `pip install`. Si falla la red, dilo sin inventar números.
2. En `frontend_storytelling/`: HTML5 + CSS3 + JS puro (sin React ni Vite) leyendo JSON con `fetch` (y fallback en JS por si falla `file://`).
3. Responde paso a paso en español indicando qué archivos exactos creaste.
